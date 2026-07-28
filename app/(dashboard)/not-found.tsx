import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <h1 className="font-display text-6xl font-bold text-accent mb-4">404</h1>
      <p className="text-text-muted mb-8">Agente não encontrado</p>
      <Link href="/" className="btn-primary">
        Voltar à galeria
      </Link>
    </div>
  );
}
