import { AuthPage } from "@/components/auth";

export const metadata = {
  title: "Sign in — VEROLA",
  description: "Sign in to VEROLA to track orders, save designs and message the studio.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const sp = await searchParams;
  return <AuthPage initialMode={sp.mode === "register" ? "register" : "login"} />;
}
