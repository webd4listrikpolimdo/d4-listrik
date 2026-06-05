# D4 Teknik Listrik — Sistem Informasi Program Studi

**GitHub Repository:** [https://github.com/webd4listrikpolimdo/d4-listrik](https://github.com/webd4listrikpolimdo/d4-listrik)

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Recent Updates

### 1. Standardized Notification Flow
* Replaced legacy inline success/error banners on Dosen and Pegawai profile dashboards with the global toast notification system (`useNotification` hook).

### 2. Mobile-Responsive Table Filters
* Converted overflowing horizontal filter layouts into collapsible **Filter** buttons on mobile and small screens across key admin dashboard tables:
  * **Staf Table**: Integrated a pop-up filter modal for functional titles, fields of expertise, and homebase.
  * **Kurikulum Table**: Created filter modals for both Mata Kuliah (semester, SKS, type) and CPL (categories).
  * **Karya Table**: Refactored filter dropdowns to show inline on large displays and inside a settings popup modal on small screens.

