# Heroku 설정 가이드

## MongoDB 연결 문제 해결

### 1. Heroku Config Vars 설정

1. Heroku 대시보드 접속: https://dashboard.heroku.com/
2. `vibe-todo-backend1` 앱 선택
3. Settings 탭 클릭
4. Config Vars 섹션으로 이동
5. Reveal Config Vars 클릭
6. 다음 환경변수 추가/수정:

```
Key: MONGODB_URI (또는 MONGO_URI)
Value: mongodb+srv://wonyong27_db_user:124qwrasf@cluster.c0hkr5i.mongodb.net/todo-db
```

**참고:** 코드는 `MONGODB_URI`와 `MONGO_URI` 둘 다 지원합니다.

**중요:** 데이터베이스 이름(`todo-db`)이 URI 끝에 포함되어야 합니다.

### 2. 앱 재시작

Config Vars를 설정한 후:
1. Heroku 대시보드에서 앱 선택
2. 우측 상단 "More" 버튼 클릭
3. "Restart all dynos" 선택

### 3. MongoDB Atlas 네트워크 접근 설정

1. MongoDB Atlas 대시보드 접속: https://cloud.mongodb.com/
2. 네트워크 액세스 설정 확인
3. IP 주소 추가:
   - `0.0.0.0/0` (모든 IP 허용 - 테스트용)
   - 또는 Heroku의 IP 범위 추가

### 4. 연결 확인

설정 후 다음 URL로 확인:
- `https://vibe-todo-backend1-45443a5ea80b.herokuapp.com/api` - MongoDB 연결 상태 확인
- `https://vibe-todo-backend1-45443a5ea80b.herokuapp.com/todos` - 데이터 조회

### 5. 연결 상태 진단

`/api` 엔드포인트에서 상세 정보 확인:
```
GET https://vibe-todo-backend1-45443a5ea80b.herokuapp.com/api
```

응답에서 확인:
- `hasMongoUri`: MONGO_URI가 설정되어 있는지 (true/false)
- `mongodb`: 연결 상태 (connected/disconnected/connecting)
- `readyState`: Mongoose 연결 상태 코드 (0=disconnected, 1=connected, 2=connecting)

### 6. 로그 확인

Heroku 로그에서 연결 상태 확인:
```bash
heroku logs --tail
```

또는 Heroku 대시보드에서 "View logs" 클릭

### 문제 해결 체크리스트

- [ ] Heroku Config Vars에 `MONGO_URI`가 설정되어 있는가?
- [ ] `MONGO_URI` 값이 올바른가? (사용자명, 비밀번호, 클러스터 주소 확인)
- [ ] URI 끝에 데이터베이스 이름(`/todo-db`)이 포함되어 있는가?
- [ ] MongoDB Atlas 네트워크 접근에서 IP가 허용되어 있는가?
- [ ] Heroku 앱을 재시작했는가?
- [ ] MongoDB Atlas 사용자 비밀번호가 올바른가?

