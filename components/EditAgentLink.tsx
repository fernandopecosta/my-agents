"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EditPasswordModal, { useEditAccess } from "@/components/EditPasswordModal";

interface EditAgentLinkProps {
  agentId: string;
}

export default function EditAgentLink({ agentId }: EditAgentLinkProps) {
  const router = useRouter();
  const { unlocked, refresh, setUnlocked } = useEditAccess();
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (unlocked === false) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  const handleUnlocked = async () => {
    setUnlocked(true);
    setShowModal(false);
    await refresh();
    router.push(`/agents/${agentId}/edit`);
  };

  return (
    <>
      <Link href={`/agents/${agentId}/edit`} className="btn-secondary" onClick={handleClick}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Editar
      </Link>
      <EditPasswordModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onUnlocked={handleUnlocked}
      />
    </>
  );
}
