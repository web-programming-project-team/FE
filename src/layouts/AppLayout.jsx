import { NavLink, Outlet } from 'react-router-dom'

// 메뉴는 4개로 고정 (제안서 5-5). 알림 센터는 헤더 종 아이콘 드롭다운으로 추가 예정
const MENUS = [
  { to: '/', label: '내 로드맵' },
  { to: '/jobs', label: '맞춤 채용' },
  { to: '/community', label: '커뮤니티' },
  { to: '/calendar', label: 'NEXT 캘린더' },
]

export default function AppLayout() {
  return (
    <>
      <header>
        <strong>NEXT 시흥</strong>
        <nav>
          {MENUS.map((m) => (
            <NavLink key={m.to} to={m.to} end={m.to === '/'}>
              {m.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  )
}
