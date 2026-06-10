"use client"

/**
 * Reopens the cookie consent panel so users can review or withdraw consent
 * at any time (LGPD: withdrawal must be as easy as giving consent).
 * The {@link CookieBanner} listens for the "open-cookie-preferences" event.
 */
export function CookiePreferencesButton({
  className,
  label = "Gerenciar cookies",
}: {
  className?: string
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-cookie-preferences"))}
      className={className}
    >
      {label}
    </button>
  )
}
