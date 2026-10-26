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
├── components/  공통 컴포넌트 (StatusBadge, DdayTag, Chip ...)
├── constants/   enumLabels.js (서버 enum → 화면 표시명)
├── hooks/
├── layouts/     AppLayout (헤더 + 메뉴 4개), AuthLayout
├── pages/       화면 단위 폴더
└── styles/      tokens.css (색·글꼴 토큰)
```
