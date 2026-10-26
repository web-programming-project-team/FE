# NEXT 시흥 — Frontend
시흥시 19~24세 청년 사회진입 로드맵 서비스 — 팀 NextStep

- API 명세: https://web-programming-project-team.github.io/API-/
- 백엔드: https://github.com/web-programming-project-team/BE
- 초기 세팅 문서: https://github.com/web-programming-project-team/BE/blob/develop/docs/SETUP.md

## 빠른 실행

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:5173 (/api 요청은 localhost:8080으로 프록시)
```

React 19 · Vite 8 · react-router-dom · axios · JavaScript

## 폴더

```
src/
├── api/         client.js (axios 인스턴스, 응답 껍데기 벗기기), 도메인별 파일
├── components/  공통 컴포넌트 (폴더마다 .jsx + .module.css)
├── constants/   enumLabels.js (서버 enum → 화면 표시명)
├── context/     AppState.jsx (API 연결 전 화면 간 공유 상태)
├── hooks/
├── layouts/     AppLayout (헤더 + 메뉴 4개), AuthLayout, AdminLayout
├── mocks/       data.js (Figma 시안 예시 데이터)
├── pages/       화면 단위 폴더
├── styles/      tokens.css (디자인 토큰), global.css
└── utils/       날짜·D-day 등 도우미
```

스타일은 CSS Module을 쓰고, 색·간격·글자 크기·모서리·그림자는 `tokens.css` 변수만 사용한다.
