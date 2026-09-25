import { Link, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore.ts'
import { DICTIONARY } from '../constants/dictionary.ts'

export function Navbar() {
  const { theme, toggleTheme } = useAppStore()
  const location = useLocation()

  return (
    <nav className="flex justify-between items-center py-4 mb-4 border-b border-base-300">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-bold text-lg tracking-tight hover:text-primary transition-colors">
          {DICTIONARY.common.brandName}
        </Link>
        <div className="flex gap-2 text-xs font-semibold">
          <Link
            to="/"
            className={`px-3 py-1 rounded transition-colors ${
              location.pathname === '/' ? 'bg-primary text-white' : 'hover:bg-base-300 text-base-content/70'
            }`}
          >
            {DICTIONARY.nav.counter}
          </Link>
          <Link
            to="/about"
            className={`px-3 py-1 rounded transition-colors ${
              location.pathname === '/about' ? 'bg-primary text-white' : 'hover:bg-base-300 text-base-content/70'
            }`}
          >
            {DICTIONARY.nav.about}
          </Link>
          <Link
            to="/catalog"
            className={`px-3 py-1 rounded transition-colors ${
              location.pathname === '/catalog' ? 'bg-primary text-white' : 'hover:bg-base-300 text-base-content/70'
            }`}
          >
            {DICTIONARY.nav.catalog}
          </Link>
        </div>
      </div>

      <button
        onClick={toggleTheme}
        className="btn btn-ghost btn-sm text-xs font-medium border border-base-300 gap-1.5"
        title={DICTIONARY.common.themeToggleTitle}
      >
        <span>{theme === 'kagemori' ? DICTIONARY.common.themeLight : DICTIONARY.common.themeDark}</span>
      </button>
    </nav>
  )
}
