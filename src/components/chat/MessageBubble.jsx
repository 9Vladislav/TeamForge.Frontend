export function MessageBubble({ message, fromMe }) {
  return (
    <div className={`mb-6 flex ${fromMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-md px-4 py-3 ${
          fromMe ? "bg-[#B91C1C]" : "bg-[#1C2128]"
        }`}
      >
        <p className="whitespace-pre-wrap wrap-break-word text-[14px]">
          {message.text}
        </p>

        <p
          className={`mt-1 text-[11px] ${
            fromMe ? "text-[#F3F4F6]/80" : "text-[#9CA3AF]"
          }`}
        >
          {formatMessageDateTime(message.sentAt)}
        </p>
      </div>
    </div>
  );
}

function formatMessageDateTime(value) {
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

  return `${date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
  })} ${date.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}