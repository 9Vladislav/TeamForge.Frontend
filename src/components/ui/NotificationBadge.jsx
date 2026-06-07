export function NotificationBadge({ count, active = false }) {
  if (!count || count <= 0) return null;

  return (
    <span
      className={`flex h-5.5 min-w-5.5 items-center justify-center rounded-full px-1.5 text-[12px] font-bold leading-none ${
        active
          ? "bg-[#F3F4F6] text-[#B91C1C]"
          : "bg-[#DC2626] text-[#F3F4F6]"
      }`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}