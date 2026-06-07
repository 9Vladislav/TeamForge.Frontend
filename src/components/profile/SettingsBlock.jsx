export function SettingsBlock({ title, children, action }) {
  const hasHeader = title || action;

  return (
    <section className="mb-6 rounded-lg border border-[#30363D] bg-[#1C2128] p-6">
      {hasHeader && (
        <div className="mb-6 flex items-center justify-between">
          {title && <h2 className="text-[20px] font-bold">{title}</h2>}
          {action}
        </div>
      )}

      {children}
    </section>
  );
}