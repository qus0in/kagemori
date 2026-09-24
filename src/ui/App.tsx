import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navbar } from './components/Navbar.tsx'
import { MainSchedulePage } from './pages/MainSchedulePage.tsx'
import { AboutPage } from './pages/AboutPage.tsx'

export function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            refetchOnWindowFocus: true,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-base-200 text-base-content flex flex-col justify-between p-4 sm:p-8">
          <div className="max-w-3xl mx-auto w-full">
            <Navbar />
            <main className="py-4">
              <Routes>
                <Route path="/" element={<MainSchedulePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>

          {/* Footer */}
          <footer className="text-center text-xs text-base-content/50 py-6 border-t border-base-300 max-w-3xl mx-auto w-full">
            &copy; {new Date().getFullYear()} 제47회 투자자산운용사 D-Day • Powered by Hono & Cloudflare Workers
          </footer>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
