import { Link, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore.ts'
import { DICTIONARY } from '../constants/dictionary.ts'

const NAV_ITEMS = [
  { to: '/', key: 'counter' as const },
  { to: '/about', key: 'about' as const },
  { to: '/catalog', key: 'catalog' as const },
  { to: '/study', key: 'study' as const },
]

export function Navbar() {
  const { theme, toggleTheme } = useAppStore()
  const loc = useLocation()

  return (
    <nav className="flex justify-between items-center py-4 mb-4 border-b border-base-300">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-bold text-lg tracking-tight hover:text-primary transition-colors">
          {DICTIONARY.common.brandName}
        </Link>
        <div className="flex gap-2 text-xs font-semibold">
          {NAV_ITEMS.map((item) => {
            const active = loc.pathname === item.to
            const cls = active ? 'bg-primary text-white' : 'hover:bg-base-300 text-base-content/70'
            return (
              <Link key={item.to} to={item.to} className={`px-3 py-1 rounded transition-colors ${cls}`}>
                {DICTIONARY.nav[item.key]}
              </Link>
            )
          })}
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
