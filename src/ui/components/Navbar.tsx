import { Link, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore.ts'
import { DICTIONARY } from '../constants/dictionary.ts'

const NAV_ITEMS = [
  { to: '/', label: DICTIONARY.nav.dday },
  { to: '/study', label: DICTIONARY.nav.study },
]

export function Navbar() {
  const { theme, toggleTheme } = useAppStore()
  const loc = useLocation()

  return (
    <nav className="flex justify-between items-center py-4 mb-4 border-b border-base-300">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-bold text-lg sm:text-xl tracking-tight text-primary hover:opacity-80 transition-opacity">
          {DICTIONARY.common.brandName}
        </Link>
        <div className="flex gap-2 text-xs sm:text-sm font-semibold">
          {NAV_ITEMS.map((item) => {
            const active = loc.pathname === item.to
            const cls = active ? 'bg-primary text-white shadow-xs' : 'hover:bg-base-300 text-base-content/70'
            return (
              <Link key={item.to} to={item.to} className={`px-3 py-1.5 rounded-lg transition-colors ${cls}`}>
                {item.label}
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
