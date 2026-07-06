import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ModulePage from './pages/ModulePage'
import LessonPage from './pages/LessonPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin-slow text-2xl">⚽</div>
    </div>
  )
  if (!user) return <Navigate to="/login" />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/module/:moduleId" element={<ProtectedRoute><ModulePage /></ProtectedRoute>} />
      <Route path="/lesson/:lessonId" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
