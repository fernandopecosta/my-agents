"use client";

import { useCallback, useState } from "react";

interface SkillsUploaderProps {
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
}

export default function SkillsUploader({
  onUpload,
  disabled = false,
}: SkillsUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".zip")) return;
      setUploading(true);
      try {
        await onUpload(file);
      } finally {
        setUploading(false);
      }
    },
    [onUpload]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      files.forEach((file) => handleFile(file));
    },
    [handleFile]
  );

  return (
    <div className="space-y-3">
      <label className="label">Skills (.zip)</label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-colors ${
          dragOver
            ? "border-accent bg-accent/10"
            : "border-border hover:border-accent/50"
        } ${disabled || uploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
      >
        {uploading ? (
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-text-muted">Extraindo ZIP...</span>
          </div>
        ) : (
          <>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-text-muted mb-3"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 8v8M8 12l4 4 4-4" />
            </svg>
            <p className="text-sm text-text-muted text-center">
              Arraste o <strong className="text-text">ZIP da skill</strong> aqui
            </p>
            <p className="text-xs text-text-muted/60 mt-1 text-center max-w-xs">
              Deve conter SKILL.md, scripts, imagens e demais arquivos (máx. 10 MB)
            </p>
          </>
        )}

        <input
          type="file"
          accept=".zip,application/zip"
          multiple
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={disabled || uploading}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            files.forEach((file) => handleFile(file));
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
