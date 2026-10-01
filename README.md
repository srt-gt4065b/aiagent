# Agentic AI Studio

7주 동안 7개의 AI Agent를 만드는 실습 중심 인터랙티브 강좌 사이트입니다.

## 실행

```bash
cd /home/ubuntu/agentic-ai-studio
python3 -m http.server 4173 --bind 0.0.0.0
```

브라우저에서 `http://localhost:4173`을 엽니다.

## 포함 기능

- 7차시 로드맵과 현재 학습 진행률
- 차시별 이론 20% / 실습 80% 구조
- n8n 흐름 다이어그램, 실습 단계 체크리스트
- 미션·테스트 질문·데모 실행 토스트
- Firebase Authentication 로그인/회원가입 UI
- Firebase Realtime Database에 사용자별 진행률·실습 체크·메모 저장
- 로그인 전에는 localStorage를 사용하고, 로그인하면 Firebase로 동기화
- 차시별 메모 및 에이전트 설계 용어 Field Guide

## Firebase 설정

`app.js`에 Firebase Web App 설정이 연결되어 있습니다. Firebase Console에서 다음 Authentication 제공업체를 활성화해야 합니다.

- Email/Password
- Google (Google 로그인을 사용할 경우)

GitHub Pages로 배포할 경우 Firebase Console의 Authentication → Settings → Authorized domains에 다음 도메인을 추가합니다.

```text
<github-username>.github.io
```

Realtime Database Rules는 인증된 사용자만 자신의 `users/{uid}`, `progress/{uid}`, `notes/{uid}`를 읽고 쓸 수 있도록 설정해야 합니다. 교수자 전체 조회 권한을 추가할 경우에는 `role` 관리 방식을 별도로 보호하세요.

Firebase 웹 설정의 `apiKey`는 브라우저 앱에 포함되는 공개 식별자이며, 실제 접근 제어는 Authentication과 Realtime Database Rules가 담당합니다. n8n·OpenAI·Gmail 등의 비밀키는 이 정적 사이트에 넣지 않습니다.
