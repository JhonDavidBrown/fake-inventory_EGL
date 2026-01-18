import { Metadata } from "next";
import { PantalonEditPageSimpleRefactored } from "./components/PantalonEditPageSimpleRefactored";

interface PantalonEditPageProps {
  params: Promise<{
    referencia: string;
  }>;
}

export const metadata: Metadata = {
  title: "Editar Pantalón | Sistema de Inventario EGL",
  description: "Editar información del pantalón en el sistema de inventario",
};

export default async function PantalonEditPage({ params }: PantalonEditPageProps) {
  const { referencia } = await params;
  return <PantalonEditPageSimpleRefactored referencia={referencia} />;
}