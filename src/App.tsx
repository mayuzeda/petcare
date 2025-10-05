import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Profile from './components/Profile'
import Charts from './pages/Charts'
import { PetProvider } from './contexts/PetContext'
import CalendarPage from './components/CalendarPage'
import ExamsPage from './components/ExamsPage'
import AppointmentsPage from './components/AppointmentsPage'
import AntiparasiticPage from './components/AntiparasiticPage'
import GPSPage from './components/GPSPage'
import DocumentsPage from './components/DocumentsPage'
import ChatPage from './components/ChatPage'
import CalendarReminder from './components/CalendarReminder'
import ActivityPage from './components/ActivityPage'
import TelemedicinePage from './components/TelemedicinePage'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <PetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/antiparasitic" element={<AntiparasiticPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/gps" element={<GPSPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/telemedicine" element={<TelemedicinePage />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Router>
      <CalendarReminder />
      <Toaster />
    </PetProvider>
  )
}

export default App
