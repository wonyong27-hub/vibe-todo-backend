const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const todoRouter = require('./routers/todoRouter');
const path = require('path');

// 환경변수 로드 (명시적으로 경로 지정)
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = 5000;

// Middleware
// CORS 기본 설정
app.use(cors());

// 보안 헤더 설정
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 서빙 (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB 연결
// URI에 데이터베이스 이름이 없으면 기본 데이터베이스 사용
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-db';

// 환경변수 확인 (디버깅용)
console.log('환경변수 확인:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '설정됨' : '설정되지 않음');

// MongoDB 연결 시 데이터베이스 이름을 명시적으로 지정
// 클러스터: cluster.c0hkr5i.mongodb.net
// 데이터베이스: todo-db
// 컬렉션: todos
const dbName = 'todo-db';
let connectionUri = MONGODB_URI;

// URI에 데이터베이스 이름이 없으면 추가
if (connectionUri.endsWith('/')) {
  connectionUri = connectionUri + dbName;
} else {
  // URI에서 마지막 슬래시 이후 부분 확인
  const parts = connectionUri.split('/');
  // mongodb+srv://user:pass@host/ 형식인 경우 마지막 부분이 데이터베이스 이름
  if (parts.length <= 3 || !parts[parts.length - 1] || parts[parts.length - 1].includes('?')) {
    connectionUri = connectionUri + '/' + dbName;
  }
}

console.log('사용할 MONGODB_URI:', connectionUri);

mongoose.connect(connectionUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // 5초 타임아웃
  socketTimeoutMS: 45000, // 45초 소켓 타임아웃
})
  .then(() => {
    console.log('연결 성공');
    console.log(`MongoDB 연결됨: ${connectionUri}`);
    console.log('데이터베이스:', mongoose.connection.name);
    console.log('컬렉션: todos');
    console.log('MongoDB Atlas 클러스터에 데이터가 저장됩니다.');
  })
  .catch((error) => {
    console.error('MongoDB 연결 실패:', error.message);
    console.error('전체 오류:', error);
    console.log('MongoDB 연결이 실패했습니다. 서버는 계속 실행되지만 데이터 저장이 불가능합니다.');
  });

// MongoDB 연결 이벤트 리스너
mongoose.connection.on('connected', () => {
  console.log('Mongoose가 MongoDB에 연결되었습니다.');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose 연결 오류:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose 연결이 끊어졌습니다.');
});

// Routes
// API 정보 엔드포인트
app.get('/api', (req, res) => {
  res.json({ 
    message: 'TODO Backend API is running!',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 할일 라우터
app.use('/todos', todoRouter);

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

