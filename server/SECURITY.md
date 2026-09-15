# Security Policy

## Secret Rotation

| Secret                               | Rotation Cadence                                | Rotation Process                                                     |
| ------------------------------------ | ----------------------------------------------- | -------------------------------------------------------------------- |
| `ACCESS_TOKEN_SECRET`                | Every 90 days, or immediately on suspected leak | See "Rotating JWT secrets" below                                     |
| `REFRESH_TOKEN_SECRET`               | Every 90 days, or immediately on suspected leak | Same as above — invalidates all active sessions                      |
| `SSLCOMMERZ_STORE_PASSWORD`          | Per SSLCommerz's own policy / on leak           | Rotate via SSLCommerz merchant dashboard, update `.env` and redeploy |
| `CLOUDINARY_API_SECRET`              | Every 180 days, or on leak                      | Regenerate via Cloudinary dashboard, update `.env` and redeploy      |
| `SMTP_PASSWORD` (Gmail App Password) | Every 180 days, or on leak                      | Regenerate in Google Account security settings                       |
| MongoDB Atlas DB user password       | Every 180 days, or on leak                      | Rotate via Atlas dashboard; update `MONGODB_URI`                     |

## Rotating JWT Secrets Without Breaking Active Sessions

Rotating `ACCESS_TOKEN_SECRET`/`REFRESH_TOKEN_SECRET` immediately invalidates
every currently-issued token, forcing every logged-in user to log in again.
This is intentional and safe for the ACCESS token (15-minute lifetime — the
disruption is minor). For the REFRESH token (7-day lifetime), consider a
dual-secret transition window if disruption must be minimized:

1. Deploy with the OLD secret still accepted for verification, alongside
   the NEW secret used for signing new tokens.
2. After the old refresh token's max lifetime (7 days) has passed, remove
   the old secret entirely.

This requires the token-verification code to try both secrets — not
currently implemented; treat immediate full rotation (accept the
forced re-login) as the default unless this dual-secret approach is
built out.

## Incident Response

If any secret is suspected to have leaked (committed to git, exposed in
a log, shared accidentally):

1. Rotate the affected secret immediately via the table above.
2. Check `git log -p` / GitHub secret scanning alerts for the exposed value.
3. If committed to git history, treat the repository history itself as
   compromised — rotating the secret is necessary but does not remove
   it from git history (use `git filter-repo` or BFG Repo-Cleaner if the
   repo must be scrubbed).
4. Review recent audit logs (Step 72) for suspicious admin activity in
   the affected time window.
