import { Routes, Route, Navigate } from 'react-router-dom'
import TurmaSelect from './pages/TurmaSelect'
import Dashboard from './pages/Dashboard'
import ModulePage from './pages/ModulePage'
import LessonPage from './pages/LessonPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TurmaSelect />} />
      <Route path="/turma/:slug" element={<Dashboard />} />
      <Route path="/module/:moduleId" element={<ModulePage />} />
      <Route path="/lesson/:lessonId" element={<LessonPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
