import { OrderFlow } from "@/components/orderflow";

export const metadata = { title: "Place your order — VEROLA" };

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const sp = await searchParams;
  return <OrderFlow initialProduct={sp.product} />;
}
