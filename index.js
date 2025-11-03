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
const PORT = 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todo-app';

// CORS 미들웨어
app.use(cors());

// JSON 미들웨어
app.use(express.json());

// MongoDB 연결
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB 연결 성공');
  })
  .catch((error) => {
    console.error('MongoDB 연결 실패:', error.message);
  });

// API 라우트
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Todo Backend API',
    status: 'running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Todo 라우트
app.use('/api/todos', todoRoutes);

// 정적 파일 제공 (가장 마지막에 배치)
app.use(express.static(join(__dirname, 'public')));

// 서버 시작
const server = app.listen(PORT, () => {
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






