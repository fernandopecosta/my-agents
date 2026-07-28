"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import EditPasswordModal, { useEditAccess } from "@/components/EditPasswordModal";

interface DeleteAgentButtonProps {
  agentId: string;
  agentName: string;
}

export default function DeleteAgentButton({
  agentId,
  agentName,
}: DeleteAgentButtonProps) {
  const router = useRouter();
  const { unlocked, refresh, setUnlocked } = useEditAccess();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const performDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/agents/${agentId}`, { method: "DELETE" });
      if (res.status === 403) {
        setShowEditModal(true);
        setDeleting(false);
        return;
      }
      if (!res.ok) throw new Error("Erro ao excluir");
      router.push("/");
      router.refresh();
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  };

  const handleDeleteClick = () => {
    if (unlocked === false) {
      setShowEditModal(true);
      return;
    }
    setConfirming(true);
  };

  const handleUnlocked = async () => {
    setUnlocked(true);
    setShowEditModal(false);
    await refresh();
    if (confirming) {
      await performDelete();
    }
  };

  if (confirming) {
    return (
      <>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">Excluir {agentName}?</span>
          <button
            type="button"
            className="btn-danger text-sm py-2 px-3"
            disabled={deleting}
            onClick={performDelete}
          >
            {deleting ? "Excluindo..." : "Confirmar"}
          </button>
          <button
            type="button"
            className="btn-secondary text-sm py-2 px-3"
            onClick={() => setConfirming(false)}
          >
            Cancelar
          </button>
        </div>
        <EditPasswordModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUnlocked={handleUnlocked}
        />
      </>
    );
  }

  return (
    <>
      <button type="button" className="btn-danger" onClick={handleDeleteClick}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        </svg>
        Excluir
      </button>
      <EditPasswordModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUnlocked={handleUnlocked}
      />
    </>
  );
}
