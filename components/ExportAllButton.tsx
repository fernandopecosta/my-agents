"use client";

export default function ExportAllButton() {
  const handleExport = () => {
    const link = document.createElement("a");
    link.href = "/api/agents/export";
    link.download = "my-agents.md";
    link.click();
  };

  return (
    <button type="button" className="btn-secondary self-start" onClick={handleExport}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </svg>
      Exportar todos
    </button>
  );
}
