import { Link, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore.ts'

export function Navbar() {
  const { theme, toggleTheme } = useAppStore()
  const location = useLocation()

  return (
    <nav className="flex justify-between items-center py-4 mb-4 border-b border-base-300">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-bold text-lg tracking-tight hover:text-primary transition-colors">
          Kagemori D-day
        </Link>
        <div className="flex gap-2 text-xs font-semibold">
          <Link
            to="/"
            className={`px-3 py-1 rounded transition-colors ${
              location.pathname === '/' ? 'bg-primary text-white' : 'hover:bg-base-300 text-base-content/70'
            }`}
          >
            카운터
          </Link>
          <Link
            to="/about"
            className={`px-3 py-1 rounded transition-colors ${
              location.pathname === '/about' ? 'bg-primary text-white' : 'hover:bg-base-300 text-base-content/70'
            }`}
          >
            시험안내
          </Link>
        </div>
      </div>

      <button
        onClick={toggleTheme}
        className="btn btn-ghost btn-sm text-xs font-medium border border-base-300 gap-1.5"
        title="테마 변경"
      >
        <span>{theme === 'kagemori' ? '☀️ 라이트' : '🌙 다크'}</span>
      </button>
    </nav>
  )
}
