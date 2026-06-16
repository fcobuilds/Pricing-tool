"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 p-8">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
        <span className="text-red-600 text-xl">!</span>
      </div>
      <p className="text-base font-semibold text-slate-900">Something went wrong</p>
      <p className="text-sm text-slate-500 text-center max-w-sm">{error.message}</p>
      <button onClick={reset} className="btn-primary">Try again</button>
    </div>
  );
}
