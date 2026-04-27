import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import Header from "@/components/Header";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Idea Validator — Elux Internal",
  description: "Comparative analysis tool for product ideas",
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const secret = process.env.AUTH_SECRET;
  let username: string | null = null;
  if (secret) {
    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    username = await verifySession(token, secret);
  }

  return (
    <html lang="en">
      <body>
        <Header username={username} />
        <main className="max-w-[1100px] mx-auto px-6 py-8 pb-20">{children}</main>
      </body>
    </html>
  );
}
