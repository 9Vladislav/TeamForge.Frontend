export function Loader({ variant = "page" }) {
  const heightClass =
    variant === "search" ? "min-h-100" : "min-h-[calc(100vh-64px)]";
  return (
    <div className={`flex w-full items-center justify-center ${heightClass}`}>
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#30363D] border-t-[#B91C1C]" />
    </div>
  );
}
