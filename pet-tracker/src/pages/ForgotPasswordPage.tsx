import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button, ErrorText, Field, Input } from '../components/ui'
import { translateAuthError } from '../lib/authErrors'
import { AuthLayout } from './AuthLayout'

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(translateAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Passwort zurücksetzen">
      {sent ? (
        <p className="text-sm text-neutral-600">
          Falls ein Konto mit dieser E-Mail existiert, haben wir einen Link zum Zurücksetzen des Passworts
          verschickt. Bitte Postfach prüfen.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="E-Mail">
            <Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Wird gesendet…' : 'Link senden'}
          </Button>
        </form>
      )}
      <p className="mt-4 text-center text-sm text-neutral-500">
        <Link to="/login" className="font-medium text-brand-700 hover:underline">
          Zurück zur Anmeldung
        </Link>
      </p>
    </AuthLayout>
  )
}
