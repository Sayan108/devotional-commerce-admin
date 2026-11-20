# Admin · Product requirements
The shop owner opens the dashboard to answer three questions: what must leave next, which orders may miss their deadline and which products can still be sold? Use a dense operational table on desktop and a single-order picking view on phones.

| Workspace | Staff task | Definition of done |
|---|---|---|
| Dashboard | Sort unassigned, due soon, packing, courier pending, exceptions and overdue by time remaining | Every count drills into the same filtered queue. Paid unassigned orders remain visible during courier outages. |
| Catalog | Create category, product, variants, aliases, price in INR, tax class, material, weight, dimensions, active status and images | Draft requires title, SKU, units, price, stock policy and approved main image before publish. Archive preserves history. |
| Inventory | Receive stock and record damage, correction and bundle consumption | Movement records actor, SKU, quantity delta and reason. Available quantity accounts for holds. |
| Orders | Search by reference or authorized contact, inspect payment, promised time, item snapshot and buyer notes | Picker confirms SKU and quantity. Mark ready triggers booking/dispatch according to partner configuration. |
| Shipping | Read normalized timeline and latest courier update, retry booking safely, record approved fallback handoff | Unknown booking result requires lookup. An existing shipment cannot be accidentally booked twice. |
| Packages | Edit draft contents, cycle count and cadence, inspect upcoming drops, handle skip/change requests | Published edits create a new version. Existing purchasers retain price, schedule and entitlements. |
| Homepage CMS | Edit localized headline, hero poster/video, CTA, collection rail, package rail and help block; reorder, preview and publish | Preview both mobile and desktop. Publish is atomic. Rollback restores a previous snapshot as a new revision. |
| Finance and support | Request full or partial refund, see gateway status and customer contact history | Permission and reason required. Refund remains pending until reconciled. |
| Coverage and staff | Approve PIN register, schedules, partner priority, packing capacity and roles | Changes affect fresh quotes. Existing orders retain deadline and history. |

## Responsibilities
Owner manages access, settings, refunds and publish. Catalog editor manages products/media and drafts homepage content. Dispatcher sees only fulfillment and necessary contact data, marks orders packed and escalates delays. Support can view masked order details and log cases or request a refund. Owner authorizes the financial action. Staff offboarding invalidates sessions.

## Operational exception script
For at-risk orders, review deadline, pickup readiness and courier evidence; assign the case to a named operator. If contracted service fails, confirm the first booking is void before assigning a fallback. Contact the buyer with the original deadline and revised ETA. Record acceptance or cancellation request. Keep the original deadline available for the scorecard. At shift end hand over all unassigned and outstanding cases.
