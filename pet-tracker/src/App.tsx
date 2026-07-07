import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AccessProvider } from './contexts/AccessContext'
import { PetProvider } from './contexts/PetContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AccessGate } from './components/AccessGate'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { PetListPage } from './pages/PetListPage'
import { PetProfilePage } from './pages/PetProfilePage'
import { DailyLogPage } from './pages/DailyLogPage'
import { ProtocolsPage } from './pages/ProtocolsPage'
import { AdminPage } from './pages/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AccessProvider>
          <PetProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              <Route
                element={
                  <ProtectedRoute>
                    <AccessGate>
                      <Layout />
                    </AccessGate>
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Navigate to="/log" replace />} />
                <Route path="/log" element={<DailyLogPage />} />
                <Route path="/protocols" element={<ProtocolsPage />} />
                <Route path="/pets" element={<PetListPage />} />
                <Route path="/pets/new" element={<PetProfilePage />} />
                <Route path="/pets/:id/edit" element={<PetProfilePage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PetProvider>
        </AccessProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
