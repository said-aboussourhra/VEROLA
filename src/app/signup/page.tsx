import { AuthPage } from "@/components/auth";

export const metadata = {
  title: "Create your account — VEROLA",
  description:
    "Create a VEROLA account to save designs, track production and reorder in one click.",
};

export default function SignupPage() {
  return <AuthPage initialMode="register" />;
}
