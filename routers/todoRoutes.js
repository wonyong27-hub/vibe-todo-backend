import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Todo from '../models/Todo.js';

// 환경변수 로드
dotenv.config();

const router = express.Router();

// MongoDB 연결 확인 및 재연결 시도
const ensureConnection = async () => {
  // 이미 연결되어 있으면 성공
  if (mongoose.connection.readyState === 1) {
    return true;
  }
  
  // 연결 시도 중이면 대기 (최대 10초)
  if (mongoose.connection.readyState === 2) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 10000);
      mongoose.connection.once('connected', () => {
        clearTimeout(timeout);
        resolve(true);
      });
      mongoose.connection.once('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }
  
  // MONGO_URI 확인
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('MONGO_URI가 환경변수에 설정되어 있지 않습니다.');
    return false;
  }
  
  try {
    // 기존 연결이 있다면 종료
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    // URI 준비
    let dbUri = MONGO_URI.trim();
    
    // URI 형식 검증 및 데이터베이스 이름 추가
    const uriMatch = dbUri.match(/mongodb\+srv:\/\/[^\/]+(\/([^?]+))?/);
    const hasDbName = uriMatch && uriMatch[2] && uriMatch[2].trim().length > 0;
    
    if (!hasDbName) {
      // 데이터베이스 이름이 없으면 추가
      dbUri = dbUri.endsWith('/') 
        ? `${dbUri}todo-db` 
        : `${dbUri}/todo-db`;
    }
    
    // MongoDB Atlas 연결 옵션
    const connectionOptions = {
      serverSelectionTimeoutMS: 10000, // 10초 타임아웃
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
      w: 'majority',
      // MongoDB Atlas 관련 추가 옵션
      ssl: true,
      authSource: 'admin'
    };
    
    console.log('MongoDB 연결 시도 중...');
    console.log('URI:', dbUri.substring(0, 30) + '...');
    
    await mongoose.connect(dbUri, connectionOptions);
    
    console.log('MongoDB 연결 성공!');
    return true;
  } catch (error) {
    console.error('MongoDB 연결 실패:');
    console.error('오류 메시지:', error.message);
    console.error('오류 코드:', error.code);
    console.error('오류 이름:', error.name);
    
    // 특정 오류에 대한 안내
    if (error.message.includes('authentication')) {
      console.error('인증 오류: 사용자명/비밀번호를 확인하세요.');
    } else if (error.message.includes('timeout')) {
      console.error('타임아웃: MongoDB Atlas 네트워크 접근 설정을 확인하세요.');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('DNS 오류: MongoDB Atlas 클러스터 주소를 확인하세요.');
    }
    
    return false;
  }
};

// 모든 할일 조회
router.get('/', async (req, res) => {
  try {
    // MongoDB 연결 확인 및 재연결 시도
    const connected = await ensureConnection();
    
    if (!connected) {
      return res.status(503).json({ 
        message: '데이터베이스에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.',
        hint: 'Heroku Config Vars에 MONGO_URI가 설정되어 있는지 확인하세요.'
      });
    }
    
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    console.error('할일 조회 오류:', error);
    res.status(500).json({ 
      message: error.message || '서버 오류가 발생했습니다.' 
    });
  }
});

// 단일 할일 조회
router.get('/:id', async (req, res) => {
  try {
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ 
        message: '데이터베이스에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.' 
      });
    }
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: '할일을 찾을 수 없습니다.' });
    }
    res.json(todo);
  } catch (error) {
    console.error('할일 조회 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 새로운 할일 생성
router.post('/', async (req, res) => {
  try {
    // MongoDB 연결 확인 및 재연결 시도
    const connected = await ensureConnection();
    
    if (!connected) {
      return res.status(503).json({ 
        message: '데이터베이스에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.',
        hint: 'Heroku Config Vars에 MONGO_URI가 설정되어 있는지 확인하세요.'
      });
    }
    
    const todo = new Todo(req.body);
    const savedTodo = await todo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    console.error('할일 생성 오류:', error);
    res.status(400).json({ message: error.message });
  }
});

// 할일 수정
router.put('/:id', async (req, res) => {
  try {
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ 
        message: '데이터베이스에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.' 
      });
    }
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!todo) {
      return res.status(404).json({ message: '할일을 찾을 수 없습니다.' });
    }
    res.json(todo);
  } catch (error) {
    console.error('할일 수정 오류:', error);
    res.status(400).json({ message: error.message });
  }
});

// 할일 삭제
router.delete('/:id', async (req, res) => {
  try {
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ 
        message: '데이터베이스에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.' 
      });
    }
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: '할일을 찾을 수 없습니다.' });
    }
    res.json({ message: '할일이 삭제되었습니다.' });
  } catch (error) {
    console.error('할일 삭제 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

