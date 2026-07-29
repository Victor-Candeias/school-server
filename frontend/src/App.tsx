import { AppSettingsProvider } from './context/AppSettingsContext'
import { AuthProvider } from './context/AuthContext'
import { useSchoolApplication } from './hooks/useSchoolApplication'
import { DashboardPage } from './pages/DashboardPage'
import './App.css'

export default function App() {
  const application = useSchoolApplication()

  return (
    <AuthProvider model={application}>
      <AppSettingsProvider model={application}>
        <DashboardPage model={application} />
      </AppSettingsProvider>
    </AuthProvider>
  )
}
