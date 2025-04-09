# SETLIST

This is a web app that will allow users to upload content for publishing to various platforms (i.e. Instagram, Facebook, Youtube, TikTok, etc...) all at the same time from the same place. Additionally users will be able to schedule the content for publishing at some point in the future.

Requirements:

-   Integration with Instagram / Facebook, TikTok, and Youtube
-   Instant and Scheduled publishing to each of these platforms
-   Photo and Video content support
-   User Authentication and Authorization

Stack:

-   Node.js - Server Runtime
-   Next.js - React Framework
-   PostgreSQL (hosted by Neon) - User DB
-   Prisma - ORM for working with Postgres
-   MongoDB - Scheduled Posts DB (works natively with Angend)
-   Agenda - Scheduling Library
-   AWS S3 - object storage for images and videos
-   Tailwind - Styling
-   shadcn/ui - Component Library

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev-https
# or
npm run dev #for http instead of https
```

Open [https://localhost:3000](https://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
