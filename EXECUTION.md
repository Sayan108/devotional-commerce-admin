# Admin panel · Execution plan
Indicative workstream within the shared eight-week solo-developer schedule. Weeks overlap across projects. Seller handles operational decisions and partner onboarding. Progress by exit evidence.

| Week / phase | Implementation work | Exit evidence |
|---|---|---|
| 1 · Workflows | Walk seller through packing shift, role split, fallback and refund ownership; agree filters and status names. | Staff can identify the next parcel and its deadline in a paper walkthrough. |
| 2–3 · Merchandise | Implement sign-in/MFA, role-aware shell, catalog forms, component quantities, inventory movements and signed media upload. | Editor publishes a SKU; missing image blocks publish; two simultaneous edits prompt conflict. |
| 4–5 · Orders | Build deadline queue, packing actions, tracking history, manual fallback, refund request/approval and daily totals. | Dispatch can fulfil a prepaid order, support can log a case, dispatcher is denied a refund by API. |
| 6 · Packages | Implement plan revisions, schedule preview, stock forecast and undelivered-cycle queue. | Prior buyer retains original contents after plan edit; refunded cycle remains traceable. |
| 7 · Publishing | Implement private preview, mobile/desktop checks, scheduled changes if required later, atomic publish and rollback. | Owner publishes a hero and restores prior revision while another draft remains intact. |
| 8 · Operations | Train staff with a delayed booking, broken video, late capture and thrown packing exception. Rehearse account offboarding. | Seller can run a shift and reconcile its pending cases using only the admin panel. |

## Release and rollback
Retain previous static build and compatible API version. Revert content through revision history. Disable affected privileged action while keeping read-only queues and buyer support available.
