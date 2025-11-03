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
Key: MONGO_URI
Value: mongodb+srv://wonyong27_db_user:dnjsdyd12@cluster.c0hkr5i.mongodb.net/todo-db
```

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

### 5. 로그 확인

Heroku 로그에서 연결 상태 확인:
```bash
heroku logs --tail
```

또는 Heroku 대시보드에서 "View logs" 클릭

