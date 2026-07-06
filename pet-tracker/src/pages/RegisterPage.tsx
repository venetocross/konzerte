import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button, ErrorText, Field, Input } from '../components/ui'
import { translateAuthError } from '../lib/authErrors'
import { AuthLayout } from './AuthLayout'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== passwordConfirm) {
      setError('Die Passwörter stimmen nicht überein.')
      return
    }
    setLoading(true)
    try {
      await register(email, password)
      navigate('/verify-email')
    } catch (err) {
      setError(translateAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Konto erstellen" subtitle="Futter- und Ausscheidungs-Tracking für dein Haustier">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="E-Mail">
          <Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Passwort" hint="Mindestens 6 Zeichen">
          <Input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field label="Passwort bestätigen">
          <Input
            type="password"
            required
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
        </Field>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Wird erstellt…' : 'Registrieren'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Schon ein Konto?{' '}
        <Link to="/login" className="font-medium text-brand-700 hover:underline">
          Anmelden
        </Link>
      </p>
    </AuthLayout>
  )
}
