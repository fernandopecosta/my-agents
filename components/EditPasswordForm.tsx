"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useState } from "react";

interface EditPasswordFormProps {
  title?: string;
  description?: string;
  onSuccess?: () => void;
  compact?: boolean;
}

export default function EditPasswordForm({
  title = "Senha de edição",
  description = "Digite a senha de edição para continuar",
  onSuccess,
  compact = false,
}: EditPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
        const res = await fetch("/api/auth/edit-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Senha incorreta");
        }

        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, password, router]
  );

  return (
    <div className={compact ? "" : "max-w-md mx-auto"}>
      {!compact && (
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto mb-4">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-accent"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <p className="text-text-muted text-sm mt-2">{description}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`card space-y-4 ${compact ? "p-4" : "p-6"}`}>
        {compact && (
          <div>
            <p className="font-display font-bold text-sm">{title}</p>
            <p className="text-text-muted text-xs mt-1">{description}</p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="label" htmlFor="edit-password">
            Senha de edição
          </label>
          <input
            id="edit-password"
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full justify-center"
          disabled={loading}
        >
          {loading ? "Verificando..." : "Desbloquear edição"}
        </button>
      </form>
    </div>
  );
}
