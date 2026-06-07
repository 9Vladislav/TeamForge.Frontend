import { useEffect, useLayoutEffect, useRef } from "react";
import { icons } from "../../assets/icons";
import { Loader } from "../ui/Loader";
import { ChatAvatar } from "./ChatListItem";
import { MessageBubble } from "./MessageBubble";

export function ChatWindow({
  selectedChat,
  messages,
  currentUserId,
  messageText,
  setMessageText,
  isMessagesLoading,
  messagesContainerRef,
  onSendMessage,
}) {
  const textareaRef = useRef(null);

  useLayoutEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [messages, selectedChat?.chatId, isMessagesLoading]);

  useEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "48px";

    if (messageText) {
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageText]);

  const updateTextareaHeight = (event) => {
    event.target.style.height = "48px";
    event.target.style.height = `${event.target.scrollHeight}px`;
  };

  if (!selectedChat) {
    return (
      <section className="flex min-w-0 flex-1 flex-col bg-[#0D1117]">
        <div className="flex flex-1 items-center justify-center text-[15px] text-[#9CA3AF]">
          Оберіть чат для перегляду повідомлень
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#0D1117]">
      <header className="flex h-17.5 shrink-0 items-center gap-4 border-b border-[#30363D] px-6">
        <ChatAvatar
          letter={selectedChat.otherUserNickname?.[0]?.toUpperCase()}
          size="small"
        />

        <h2 className="text-[17px] font-bold">
          {selectedChat.otherUserNickname}
        </h2>
      </header>

      <div
        ref={messagesContainerRef}
        className="custom-scroll min-h-0 flex-1 overflow-y-auto px-6 py-6"
      >
        {isMessagesLoading ? (
          <Loader />
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.messageId}
                message={message}
                fromMe={Number(message.senderId) === currentUserId}
              />
            ))}

            {messages.length === 0 && (
              <p className="text-[14px] text-[#9CA3AF]">
                Повідомлень поки немає
              </p>
            )}
          </>
        )}
      </div>

      <footer className="shrink-0 border-t border-[#30363D] bg-[#161B22] p-4">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={messageText}
            onChange={(event) => {
              setMessageText(event.target.value);
              updateTextareaHeight(event);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSendMessage();
              }
            }}
            placeholder="Напишіть повідомлення..."
            rows={1}
            className="no-scrollbar max-h-28 min-h-12 flex-1 resize-none rounded-md border border-[#30363D] bg-[#1C2128] px-4 py-3 text-[15px] text-[#F3F4F6] outline-none transition placeholder:text-[#9CA3AF] hover:border-[#4B5563] focus:border-[#B91C1C]"
          />

          <button
            type="button"
            onClick={onSendMessage}
            disabled={!messageText.trim()}
            className="flex h-12 items-center gap-2 rounded-md bg-[#B91C1C] px-5 text-[15px] font-bold transition hover:bg-[#9F1818] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <img src={icons.send} alt="" className="h-5 w-5 icon-white" />
            Надіслати
          </button>
        </div>
      </footer>
    </section>
  );
}
