import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import Stats from './pages/Stats'

function App() {
  const location = useLocation()
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-purple-700' : ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* 导航栏 */}
      <nav className="bg-purple-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl">🐾</span>
                <span className="text-white font-bold text-xl">小爪定时任务管理平台</span>
              </Link>
            </div>
            <div className="flex items-center space-x-1">
              <Link 
                to="/" 
                className={`text-purple-200 hover:text-white hover:bg-purple-700 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')}`}
              >
                📊 仪表盘
              </Link>
              <Link 
                to="/jobs" 
                className={`text-purple-200 hover:text-white hover:bg-purple-700 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/jobs')}`}
              >
                📋 任务列表
              </Link>
              <Link 
                to="/stats" 
                className={`text-purple-200 hover:text-white hover:bg-purple-700 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/stats')}`}
              >
                📈 统计分析
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
