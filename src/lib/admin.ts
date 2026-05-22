const BILLING_STATUSES = ['trial', 'paid', 'disabled'] as const

export type BillingStatus = (typeof BILLING_STATUSES)[number]

export function getAdminAllowlist() {
  return (process.env.ADMIN_EMAIL_ALLOWLIST || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false

  const normalized = email.trim().toLowerCase()
  return getAdminAllowlist().includes(normalized)
}

export function normalizeBillingStatus(value: string | null | undefined): BillingStatus {
  const normalized = (value || 'trial').trim().toLowerCase()
  return BILLING_STATUSES.includes(normalized as BillingStatus) ? (normalized as BillingStatus) : 'trial'
}

