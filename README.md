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
