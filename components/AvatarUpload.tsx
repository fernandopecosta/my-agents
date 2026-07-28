"use client";

import { useCallback, useState } from "react";
import { avatarUrl } from "@/lib/utils";

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onUpload: (file: File) => Promise<void>;
  onFileSelected?: (file: File) => void;
  disabled?: boolean;
}

export default function AvatarUpload({
  currentAvatar,
  onUpload,
  onFileSelected,
  disabled = false,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(
    avatarUrl(currentAvatar) ?? null
  );
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      onFileSelected?.(file);
      setPreview(URL.createObjectURL(file));
      setUploading(true);
      try {
        await onUpload(file);
      } finally {
        setUploading(false);
      }
    },
    [onUpload, onFileSelected]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="space-y-3">
      <label className="label">Avatar</label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center w-32 h-32 rounded-2xl border-2 border-dashed transition-colors cursor-pointer ${
          dragOver
            ? "border-accent bg-accent/10"
            : "border-border hover:border-accent/50"
        } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-2xl"
          />
        ) : (
          <div className="text-center p-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mx-auto text-text-muted mb-2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <p className="text-xs text-text-muted">PNG, JPG, WebP</p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-bg/80 rounded-2xl flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={disabled || uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
    </div>
  );
}
