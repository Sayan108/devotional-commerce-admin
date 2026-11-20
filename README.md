# Arghya Seller Admin

Install and start from this directory with Node.js 22.

```powershell
npm ci
npm run dev
```

Open `http://127.0.0.1:5174`. The development and preview servers proxy `/v1`, `/admin`, and `/media` to the API URL in `src/env.ts`. In local demo mode, the default staff mobile number is `9876543210`.

Run the API for staff sign-in and operations. [Arghya API](https://github.com/Sayan108/devotional-commerce-backend) · [Customer storefront](https://github.com/Sayan108/devotional-commerce-storefront)

Run `npm run build` to produce `dist/`. In production, route `/v1/*`, `/admin/*`, and `/media/*` on the admin domain to the API so session cookies stay same-origin. Serve the remaining routes from `dist/` with an `index.html` fallback for client-side routes.

The app shell lives in `src/app`, seller workflows in `src/features`, and the API client and shared UI in `src/shared`.
