# Naivedya Seller Admin

Install and start from this directory with Node.js 22.

```powershell
npm ci
npm run dev
```

Open `http://127.0.0.1:5174`. The development server proxies `/v1`, `/admin`, and `/media` to the local API on port 4000. Set `ARGHYA_API_URL` in `.env.local` to point the proxy elsewhere. In local demo mode, the default staff mobile number is `9876543210`.

Run the API for staff sign-in and operations. [Naivedya API](https://github.com/Sayan108/devotional-commerce-backend) · [Customer storefront](https://github.com/Sayan108/devotional-commerce-storefront)

Run `npm run build` to produce `dist/`. The production build defaults to the hosted API. Set `VITE_API_URL` at build time to use a different API. Set it to an empty string for a same-origin reverse proxy. Serve the frontend with an `index.html` fallback for client-side routes.

The app shell lives in `src/app`, seller workflows in `src/features`, and the API client and shared UI in `src/shared`.

The dashboard shows all-time paid order value before refunds and charts the status and paid value of the latest 100 orders.

Catalog management supports categories and product drafts and editing their first variant: bilingual text, aliases, images, price, active status, and a reasoned adjustment to available stock. Existing order snapshots are not changed. The homepage editor saves drafts and publishes or restores revisions for the hero, featured IDs, category IDs, section order and kit content. Customer support lists up to 100 customers with orders using masked phone numbers and stores internal cases and notes. Do not put full phone numbers or sensitive personal information in notes. Coverage changes affect new delivery checks. Package drafts can be published without changing existing orders.

Image uploads require Cloudinary credentials configured on the backend; images are uploaded into the `naivedya` folder. The sign-in screen does not display demo verification codes; local demo sign-in still uses the code documented in the backend setup.

Additional variant management, homepage help content and full storefront previews, full CRM search, and courier integrations are not yet implemented.
