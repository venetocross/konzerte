const MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'Diese E-Mail-Adresse ist bereits registriert.',
  'auth/invalid-email': 'Bitte eine gültige E-Mail-Adresse eingeben.',
  'auth/weak-password': 'Das Passwort muss mindestens 6 Zeichen lang sein.',
  'auth/user-not-found': 'E-Mail oder Passwort ist falsch.',
  'auth/wrong-password': 'E-Mail oder Passwort ist falsch.',
  'auth/invalid-credential': 'E-Mail oder Passwort ist falsch.',
  'auth/too-many-requests': 'Zu viele Versuche. Bitte später erneut versuchen.',
}

export function translateAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code
  if (code && MESSAGES[code]) return MESSAGES[code]
  return 'Etwas ist schiefgelaufen. Bitte erneut versuchen.'
}
