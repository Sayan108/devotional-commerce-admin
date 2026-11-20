# Admin · Technical architecture
Deploy a React + Vite SPA under admin on a separate host or isolated origin. Same-origin /v1 reverse proxy forwards to Express. Admin index sends X-Robots-Tag noindex and no-store for authenticated responses. Authentication and role checks run on the server for every read and mutation. Use React Router, TanStack Query for cached API data and validated forms. Use secure HTTP-only host-scoped cookies, MFA for staff, CSRF tokens on cookie-authenticated writes and session expiry.

| Route | API group | Implementation detail |
|---|---|---|
| /dashboard, /orders | /admin/metrics, /admin/orders | Cursor pagination by deadline and ID; URL-backed filters; refresh counts and list together |
| /orders/:id | /admin/orders/:id/actions, /shipments, /refunds | Render allowed actions from state and permissions; attach stable action key and reason |
| /catalog, /inventory | /admin/products, /admin/inventory/movements | If-Match revision on edits; ledger-based stock adjustment, no free editing of reserved stock |
| /packages, /cycles | /admin/plans, /admin/cycles | Preview concrete dates and price allocations; distinguish the plan template from purchased instances |
| /content/home | /admin/cms/home/revisions | Structured block editor, draft autosave, version conflict prompt, short-lived authenticated preview |
| /media | /admin/media/sign, /admin/media/complete | Upload direct to Cloudinary with scoped signature; show processing/failed/ready |
| /settings | /admin/coverage, /admin/staff, /admin/audit | Owner only; diff before publishing coverage; audit log searchable by entity |

## CMS contract
Each revision has id, version, author, createdAt, status and ordered blocks. Hero requires headline, mediaId, posterId for video and internal CTA path. Collection and package rails require active reference IDs. Validate character lengths, allowed locales and internal links. Escape text and reject arbitrary HTML or script embeds. Store focal point and mobile crop per hero. Preview renders the storefront component registry against a private draft token. Publish performs compare-and-swap on the live pointer and queues cache invalidation. If invalidation fails retry, show status and retain short public cache TTL.

## Mutations and recovery
Use pessimistic UI for refund, booking, stock and publish. Disable duplicate submissions in the UI and enforce idempotency server-side. Route 401 to sign-in with a safe internal return path, 403 to permission feedback, 409 to refreshed records with the user’s draft retained. Clear cached personal data on sign-out. Display last-refreshed time during polling failures. Export functions, if added, require explicit permission and an audit event.

## Acceptance tests
Exercise each role by direct API calls as well as UI. Run two simultaneous edits to one product. Replay one refund twice. Publish while another editor changes a draft. Remove a referenced image and verify publish is blocked. Restore an earlier homepage and compare the public HTML. Test keyboard navigation, sticky table headings and packing view at 360 px.
