import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import InsumoDetailsClient from "./InsumoDetailsClient";

export default async function Page({
  params,
}: {
  params: Promise<{ referencia: string }>;
}) {
  const { getToken, userId } = await auth();
  const token = await getToken();

  if (!token || !userId) return notFound();

  const resolvedParams = await params;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/insumos/${resolvedParams.referencia}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) return notFound();

  const insumo = await res.json();

  return (
    <div className="max-w-4xl  mx-auto space-y-6">
      <InsumoDetailsClient insumo={insumo} />
    </div>
  );
}
