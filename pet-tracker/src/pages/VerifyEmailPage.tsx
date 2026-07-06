import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui'
import { AuthLayout } from './AuthLayout'

export function VerifyEmailPage() {
  const { user, logout, resendVerification } = useAuth()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(false)
  const [sent, setSent] = useState(false)

  async function checkVerified() {
    setChecking(true)
    try {
      await auth.currentUser?.reload()
      if (auth.currentUser?.emailVerified) {
        navigate('/')
      }
    } finally {
      setChecking(false)
    }
  }

  // Poll periodically so the user doesn't have to click "reload" manually
  // after clicking the confirmation link in another tab.
  useEffect(() => {
    const interval = setInterval(checkVerified, 5000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthLayout title="E-Mail bestätigen">
      <p className="text-sm text-neutral-600">
        Wir haben eine Bestätigungs-E-Mail an <strong>{user?.email}</strong> gesendet. Bitte klicke auf den Link
        in der E-Mail, um dein Konto zu aktivieren. Diese Seite aktualisiert sich automatisch.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <Button onClick={checkVerified} disabled={checking}>
          {checking ? 'Prüfe…' : 'Ich habe bestätigt'}
        </Button>
        <Button
          variant="secondary"
          onClick={async () => {
            await resendVerification()
            setSent(true)
          }}
        >
          E-Mail erneut senden
        </Button>
        <Button variant="ghost" onClick={logout}>
          Abmelden
        </Button>
      </div>
      {sent && <p className="mt-3 text-center text-sm text-brand-700">E-Mail wurde erneut gesendet.</p>}
    </AuthLayout>
  )
}
