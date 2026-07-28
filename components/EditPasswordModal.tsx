"use client";

import { useCallback, useEffect, useState } from "react";
import EditPasswordForm from "@/components/EditPasswordForm";

interface EditPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}

export default function EditPasswordModal({
  open,
  onClose,
  onUnlocked,
}: EditPasswordModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <EditPasswordForm
          compact
          title="Senha de edição necessária"
          description="Informe a senha de edição para alterar ou excluir agentes"
          onSuccess={onUnlocked}
        />
        <button
          type="button"
          className="btn-secondary w-full mt-3 justify-center"
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export function useEditAccess() {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/auth/edit-status");
    const data = await res.json();
    setUnlocked(data.unlocked === true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { unlocked, refresh, setUnlocked };
}
