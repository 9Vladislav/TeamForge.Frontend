import { icons } from "../../assets/icons";
import { Loader } from "../ui/Loader";
import { ChatListItem } from "./ChatListItem";

export function ChatList({
  chats,
  selectedChat,
  searchValue,
  setSearchValue,
  isLoading,
  onSelectChat,
}) {
  return (
    <aside className="flex h-screen w-75 shrink-0 flex-col border-r border-[#30363D] bg-[#0D1117]">
      <div className="shrink-0 border-b border-[#30363D] p-4">
        <h1 className="mb-4 text-[22px] font-bold">Чат</h1>

        <div className="flex h-10 items-center gap-3 rounded-md border border-[#30363D] bg-[#1C2128] px-3 transition hover:border-[#4B5563] focus-within:border-[#B91C1C]">
          <img src={icons.search} alt="" className="h-5 w-5 icon-muted" />

          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Пошук..."
            className="w-full bg-transparent text-[14px] text-[#F3F4F6] outline-none placeholder:text-[#9CA3AF]"
          />
        </div>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-6">
            <Loader />
          </div>
        ) : (
          <>
            {chats.map((chat) => (
              <ChatListItem
                key={chat.chatId}
                chat={chat}
                active={selectedChat?.chatId === chat.chatId}
                onClick={() => onSelectChat(chat)}
              />
            ))}

            {chats.length === 0 && (
              <p className="px-4 py-5 text-[14px] text-[#9CA3AF]">
                Чатів не знайдено
              </p>
            )}
          </>
        )}
      </div>
    </aside>
  );
}