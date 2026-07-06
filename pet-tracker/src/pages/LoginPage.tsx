import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button, ErrorText, Field, Input } from '../components/ui'
import { translateAuthError } from '../lib/authErrors'
import { AuthLayout } from './AuthLayout'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(translateAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Anmelden" subtitle="Futter- und Ausscheidungs-Tracking für dein Haustier">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="E-Mail">
          <Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Passwort">
          <Input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Wird angemeldet…' : 'Anmelden'}
        </Button>
      </form>
      <div className="mt-4 flex items-center justify-between text-sm">
        <Link to="/forgot-password" className="text-brand-700 hover:underline">
          Passwort vergessen?
        </Link>
        <Link to="/register" className="font-medium text-brand-700 hover:underline">
          Konto erstellen
        </Link>
      </div>
    </AuthLayout>
  )
}
