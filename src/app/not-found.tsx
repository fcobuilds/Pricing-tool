import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-bold text-slate-200 mb-4">404</p>
        <p className="text-lg font-semibold text-slate-700 mb-2">Page not found</p>
        <p className="text-sm text-slate-500 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="btn-primary">Go to Dashboard</Link>
      </div>
    </div>
  );
}
