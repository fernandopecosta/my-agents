"use client";

interface ExportAgentButtonProps {
  agentId: string;
  agentName: string;
  variant?: "primary" | "secondary";
}

export default function ExportAgentButton({
  agentId,
  agentName,
  variant = "secondary",
}: ExportAgentButtonProps) {
  const handleExport = () => {
    const link = document.createElement("a");
    link.href = `/api/agents/${agentId}/export`;
    link.download = `${agentName}.md`;
    link.click();
  };

  const className = variant === "secondary" ? "btn-secondary" : "btn-primary";

  return (
    <button type="button" className={className} onClick={handleExport}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </svg>
      Exportar
    </button>
  );
}
