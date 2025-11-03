import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Todo from '../models/Todo.js';

// 환경변수 로드
dotenv.config();

const router = express.Router();

// MongoDB 연결 확인 및 재연결 시도
const ensureConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }
  
  // 연결 시도 중이면 대기
  if (mongoose.connection.readyState === 2) {
    return new Promise((resolve) => {
      mongoose.connection.once('connected', () => resolve(true));
      mongoose.connection.once('error', () => resolve(false));
      setTimeout(() => resolve(false), 5000);
    });
  }
  
  // 재연결 시도
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    return false;
  }
  
  try {
    let dbUri = MONGO_URI;
    const uriMatch = MONGO_URI.match(/mongodb\+srv:\/\/[^\/]+(\/([^?]+))?/);
    const hasDbName = uriMatch && uriMatch[2] && uriMatch[2].length > 0;
    
    if (!hasDbName) {
      dbUri = MONGO_URI.endsWith('/') 
        ? `${MONGO_URI}todo-db` 
        : `${MONGO_URI}/todo-db`;
    }
    
    await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    return true;
  } catch (error) {
    console.error('연결 시도 실패:', error.message);
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

