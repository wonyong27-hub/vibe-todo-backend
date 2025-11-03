import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import todoRoutes from './routers/todoRoutes.js';

// ES 모듈에서 __dirname 사용하기
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todo-app';

// CORS 미들웨어
app.use(cors());

// JSON 미들웨어
app.use(express.json());

// 루트 경로 (Heroku health check용)
app.get('/', (req, res) => {
  res.json({ 
    message: 'Todo Backend API',
    status: 'running'
  });
});

// API 라우트
app.get('/api', (req, res) => {
  const connectionStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };
  
  res.json({ 
    message: 'Todo Backend API',
    status: 'running',
    mongodb: connectionStates[mongoose.connection.readyState] || 'unknown',
    readyState: mongoose.connection.readyState,
    hasMongoUri: !!MONGO_URI,
    mongoUriPrefix: MONGO_URI ? MONGO_URI.substring(0, 30) + '...' : 'not set'
  });
});

// MongoDB 연결 설정
const mongooseOptions = {
  serverSelectionTimeoutMS: 15000, // 15초 타임아웃
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  retryWrites: true,
  w: 'majority',
  maxPoolSize: 10,
  minPoolSize: 1,
  ssl: true, // MongoDB Atlas는 SSL 필수
  authSource: 'admin' // 인증 소스
};

// MongoDB 연결 (데이터베이스 이름 명시)
const connectDB = async (retries = 3) => {
  if (!MONGO_URI) {
    console.warn('MONGO_URI 환경변수가 설정되지 않았습니다.');
    console.warn('Heroku Config Vars에 MONGO_URI를 설정하세요.');
    return;
  }

  try {
    // URI 준비 (공백 제거)
    let dbUri = MONGO_URI.trim();
    
    // MongoDB Atlas URI 형식 확인
    // 형식: mongodb+srv://user:pass@cluster.net/dbname?options
    const uriMatch = dbUri.match(/mongodb\+srv:\/\/[^\/]+(\/([^?]+))?/);
    const hasDbName = uriMatch && uriMatch[2] && uriMatch[2].trim().length > 0;
    
    if (!hasDbName) {
      // 데이터베이스 이름이 없으면 추가
      dbUri = dbUri.endsWith('/') 
        ? `${dbUri}todo-db` 
        : `${dbUri}/todo-db`;
    }
    
    // 이미 연결되어 있으면 스킵
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB 이미 연결되어 있습니다.');
      return;
    }
    
    // 기존 연결이 있으면 종료
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    console.log('MongoDB 연결 시도 중...');
    await mongoose.connect(dbUri, mongooseOptions);
    console.log('MongoDB 연결 성공:', mongoose.connection.name);
    console.log('데이터베이스:', mongoose.connection.db?.databaseName);
  } catch (error) {
    console.error('MongoDB 연결 실패:');
    console.error('오류 메시지:', error.message);
    console.error('오류 코드:', error.code);
    console.error('오류 이름:', error.name);
    
    // 특정 오류에 대한 안내
    if (error.message.includes('authentication')) {
      console.error('인증 오류: MongoDB Atlas 사용자명/비밀번호를 확인하세요.');
    } else if (error.message.includes('timeout')) {
      console.error('타임아웃: MongoDB Atlas Network Access에서 Heroku IP를 허용하세요.');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('DNS 오류: MongoDB Atlas 클러스터 주소를 확인하세요.');
    }
    
    // 재시도 로직
    if (retries > 0) {
      console.log(`${retries}번 남았습니다. 5초 후 재시도...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectDB(retries - 1);
    } else {
      console.error('MongoDB 연결 재시도 횟수를 초과했습니다.');
      console.error('MONGO_URI 확인:', MONGO_URI ? '설정됨' : '설정 안됨');
      if (MONGO_URI) {
        console.error('MONGO_URI 시작 부분:', MONGO_URI.substring(0, 30) + '...');
      }
    }
  }
};

// MongoDB 연결 이벤트 리스너
mongoose.connection.on('connected', () => {
  console.log('MongoDB 연결됨');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB 연결 오류:', err.message);
  console.error('오류 코드:', err.code);
  console.error('오류 이름:', err.name);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB 연결 끊김');
  // 재연결 시도
  setTimeout(() => connectDB(3), 5000);
});

// 데이터베이스 연결 시작
connectDB();

// Todo 라우트
app.use('/api/todos', todoRoutes);
app.use('/todos', todoRoutes); // /todos 엔드포인트도 추가

// 정적 파일 제공 (가장 마지막에 배치)
app.use(express.static(join(__dirname, 'public')));

// 서버 시작
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});

// 서버 오류 처리
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`포트 ${PORT}가 이미 사용 중입니다.`);
  } else {
    console.error('서버 오류:', error);
  }
  process.exit(1);
});

// 프로세스 종료 처리
process.on('SIGTERM', () => {
  console.log('SIGTERM 신호 수신. 서버 종료 중...');
  server.close(() => {
    console.log('서버가 종료되었습니다.');
    mongoose.connection.close(false, () => {
      console.log('MongoDB 연결이 종료되었습니다.');
      process.exit(0);
    });
  });
});






