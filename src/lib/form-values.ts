const SENSITIVE_FIELDS = ["password", "confirmPassword", "currentPassword", "newPassword"]

/**
 * Echo submitted form values back to the client so the form can repopulate
 * after a failed action. React 19 resets uncontrolled inputs when a form
 * action completes — without this echo the user loses everything they typed
 * whenever validation fails (e.g. implicit submit via the mobile keyboard's
 * confirm key).
 *
 * Password-like fields are excluded structurally (never echo secrets back to
 * the client), and File entries (uploads) are skipped. Multi-value fields
 * (e.g. checkbox groups) are joined with "," — split on "," when consuming.
 */
export function echoFormValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {}
  for (const key of new Set(formData.keys())) {
    if (SENSITIVE_FIELDS.includes(key)) continue
    const entries = formData.getAll(key).filter((v): v is string => typeof v === "string")
    if (entries.length > 0) values[key] = entries.join(",")
  }
  return values
}
