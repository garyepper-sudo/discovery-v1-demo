# Discovery Interactive Prototype Alpha access

The Alpha advisor gate is temporary shared-password protection for `/alpha` and
its nested routes. It is not production authentication and does not provide
user accounts, durable per-user authorization, or distributed rate limiting.

## Local configuration

Add the following entries to `.env.local`:

```text
ALPHA_ACCESS_PASSWORD=<local password>
ALPHA_SESSION_SECRET=<long random secret>
```

`.env.local` is ignored by Git. Never commit either value or expose it through
an environment variable prefixed with `NEXT_PUBLIC_`.

Changing `ALPHA_ACCESS_PASSWORD` changes future logins. Changing
`ALPHA_SESSION_SECRET` invalidates all existing Alpha access cookies.

## Vercel configuration

In the Vercel project, open:

```text
Settings
→ Environment Variables
```

Add `ALPHA_ACCESS_PASSWORD` and `ALPHA_SESSION_SECRET` to the environment that
hosts the advisor prototype. Prefer Preview only when the prototype is deployed
as a Preview branch.

A redeployment may be required after changing environment variables, depending
on the affected deployment.

## Security boundary

The gate validates the password on the server and stores only a signed,
HTTP-only, time-bounded session cookie. Invalid attempts receive a small delay
and the client prevents rapid repeated submission while a request is pending.
The cookie is available at the site root because the gate also authenticates
Alpha-specific Next.js chunks that would otherwise reveal prototype fixture
content; middleware does not apply it to production application chunks.
This temporary mechanism does not provide strong distributed rate limiting
across Vercel instances.
