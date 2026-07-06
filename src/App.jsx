import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ModulePage from './pages/ModulePage'
import LessonPage from './pages/LessonPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/module/:moduleId" element={<ModulePage />} />
      <Route path="/lesson/:lessonId" element={<LessonPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
