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
  res.json({ 
    message: 'Todo Backend API',
    status: 'running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// MongoDB 연결 설정
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // 5초 타임아웃
  socketTimeoutMS: 45000,
};

// MongoDB 연결
if (MONGO_URI) {
  mongoose.connect(MONGO_URI, mongooseOptions)
    .then(() => {
      console.log('MongoDB 연결 성공');
    })
    .catch((error) => {
      console.error('MongoDB 연결 실패:', error.message);
      console.error('MONGO_URI가 설정되어 있는지 확인하세요.');
      // 연결 실패해도 서버는 계속 실행 (개발 환경)
    });
} else {
  console.warn('MONGO_URI 환경변수가 설정되지 않았습니다.');
}

// Todo 라우트
app.use('/api/todos', todoRoutes);

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






