"use client";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8 pb-28 md:pb-8 flex flex-col items-center justify-center min-h-[60vh]">
      <SettingsIcon className="w-16 h-16 text-gray-300 mb-4" />
      <h1 className="text-xl font-bold text-gray-900 mb-2">Ajustes</h1>
      <p className="text-sm text-gray-500 text-center">Próximamente: configuración de keywords, alertas y preferencias.</p>
    </div>
  );
}
