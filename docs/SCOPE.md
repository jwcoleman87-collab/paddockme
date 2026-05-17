# Scope — Day One

This doc captures (a) what is explicitly OUT of scope right now, and (b) the definition of done for the day-one foundation. When in doubt, default to "not yet".

## What NOT to build yet

The following belong to later milestones. Not day one.

- Real money movement. The contract fee is a fake button until payments are wired.
- Real Google Maps. Use a static map placeholder until the map view is built.
- Real GPS tracking on transport. A fake animated dot is fine for now.
- AI mediation of disputes.
- Real e-signatures or legal contract generation.
- Reviews and ratings.
- Stripe integration.
- Messaging (chat threads).
- Admin panels.
- Testing frameworks (Vitest comes later).
- Over-engineering of any kind.
- Building out the request creation flow on day one — the route is scaffolded as a placeholder only.
- Building out the match engine logic on day one — placeholder only.

## Day-one definition of done

When the day-one foundation finishes, the persona walkthrough must be able to:

| Item | Status |
| --- | --- |
| Visit a live Vercel URL | done |
| Click "Sign Up", create an account, get redirected to `/app/home` | pending verification (post-deploy) |
| See the Fraunces + Outfit fonts and sage / cream / terra palette rendering | done (built into globals.css and layout.tsx) |
| See `profiles`, `paddocks`, `agistment_requests`, `matches`, `agreements` tables in Supabase with RLS enabled | done (migration applied + verified) |
| See the GitHub repo with a clean commit history and complete README | pending (push) |
| Push a small change and watch it auto-deploy to Vercel | pending verification (post-deploy) |

The pending items resolve when the Vercel project is wired up to GitHub `main` and the first deploy succeeds.
