import { NotificationBadge } from "../ui/NotificationBadge";

export function ChatListItem({ chat, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 border-b border-[#30363D] px-4 py-4 text-left transition ${
        active ? "bg-[#1C2128]" : "bg-[#0D1117] hover:bg-[#161B22]"
      }`}
    >
      <ChatAvatar letter={chat.otherUserNickname?.[0]?.toUpperCase()} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] font-bold">
          {chat.otherUserNickname}
        </p>

        <p className="mt-1 truncate text-[13px] font-bold text-[#9CA3AF]">
          {chat.lastMessageText || "Повідомлень поки немає"}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <span className="text-[12px] text-[#9CA3AF]">
          {formatChatTime(chat.lastMessageAt || chat.createdAt)}
        </span>

        <NotificationBadge count={chat.unreadMessagesCount} />
      </div>
    </button>
  );
}

export function ChatAvatar({ letter, size = "normal" }) {
  const sizeClass =
    size === "small" ? "h-10 w-10 text-[14px]" : "h-12 w-12 text-[16px]";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#B91C1C] font-medium ${sizeClass}`}
    >
      {letter || "?"}
    </div>
  );
}

function formatChatTime(value) {
  if (!value) return "";

  const date = new Date(value);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
  });
}