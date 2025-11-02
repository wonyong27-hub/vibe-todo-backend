# Todo Backend

Node.js를 사용한 Todo 애플리케이션 백엔드 API

## 시작하기

### 요구사항
- Node.js 18.x 이상
- MongoDB

### 설치

```bash
npm install
```

### 환경 설정

`.env` 파일을 생성하고 MongoDB URI를 설정하세요:

```env
MONGO_URI=mongodb://localhost:27017/todo-app
```

### MongoDB 실행

로컬에서 MongoDB를 실행하거나 MongoDB Atlas를 사용하세요.

### 실행

개발 모드:
```bash
npm run dev
```

프로덕션 모드:
```bash
npm start
```

서버는 포트 5000번에서 실행됩니다.

웹 테스트 페이지를 사용하려면:
```
http://localhost:5000
```

## 프로젝트 구조

```
todo-backend/
├── index.js              # 메인 애플리케이션 파일
├── package.json          # 프로젝트 설정
├── models/
│   └── Todo.js           # Todo 스키마 모델
├── routers/
│   └── todoRoutes.js     # Todo API 라우트
├── public/
│   └── index.html        # 웹 테스트 페이지
└── README.md             # 문서
```

## API 엔드포인트

### 할일 관리

#### 모든 할일 조회
```
GET http://localhost:5000/api/todos
```

#### 특정 할일 조회
```
GET http://localhost:5000/api/todos/:id
```

#### 할일 생성
```
POST http://localhost:5000/api/todos
Content-Type: application/json

{
  "title": "할일 제목",
  "description": "상세 설명",
  "priority": "high",
  "dueDate": "2024-12-31"
}
```

#### 할일 수정
```
PUT http://localhost:5000/api/todos/:id
Content-Type: application/json

{
  "title": "수정된 제목",
  "completed": true
}
```

#### 할일 삭제
```
DELETE http://localhost:5000/api/todos/:id
```

## Todo 데이터 구조

```javascript
{
  "title": "String (필수)",           // 할일 제목
  "description": "String (선택)",     // 상세 설명
  "completed": "Boolean",             // 완료 여부 (기본값: false)
  "priority": "String",               // 우선순위: low, medium, high (기본값: medium)
  "dueDate": "Date (선택)",           // 마감일
  "createdAt": "Date (자동)",         // 생성일
  "updatedAt": "Date (자동)"          // 수정일
}
```

