import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { ChatList } from "../components/chat/ChatList";
import { ChatWindow } from "../components/chat/ChatWindow";
import { chats } from "../api/chats";
import { getIdFromJWT } from "../utils/jwt";

export function ChatPage() {
  const currentUserId = Number(getIdFromJWT());
  const messagesContainerRef = useRef(null);
  const [searchParams] = useSearchParams();

  const targetUserId = Number(searchParams.get("userId") || 0);
  const targetNickname = searchParams.get("nickname") || "";

  const [chatItems, setChatItems] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);

  const [messageText, setMessageText] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const [isChatsLoading, setIsChatsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadChats();
  }, [targetUserId]);

  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    if (selectedChat.isTemporary) {
      setMessages([]);
      return;
    }

    markSelectedChatAsRead(selectedChat.chatId);
    loadMessages(selectedChat.chatId);
  }, [selectedChat?.chatId, selectedChat?.isTemporary]);

  const filteredChats = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return chatItems;
    }

    return chatItems.filter((chat) =>
      chat.otherUserNickname.toLowerCase().includes(normalizedSearch),
    );
  }, [chatItems, searchValue]);

  const notifyUnreadChanged = (items = chatItems) => {
    const totalUnread = items.reduce(
      (sum, chat) => sum + Number(chat.unreadMessagesCount || 0),
      0,
    );

    window.dispatchEvent(
      new CustomEvent("chat-unread-updated", {
        detail: { count: totalUnread },
      }),
    );
  };

  const markSelectedChatAsRead = (chatId) => {
    setChatItems((prev) => {
      const updatedChats = prev.map((chat) =>
        chat.chatId === chatId ? { ...chat, unreadMessagesCount: 0 } : chat,
      );

      notifyUnreadChanged(updatedChats);

      return updatedChats;
    });
  };

  const createTemporaryChat = () => {
    if (!targetUserId) return null;

    return {
      chatId: `temporary-${targetUserId}`,
      otherUserId: targetUserId,
      otherUserNickname: targetNickname || "Користувач",
      createdAt: new Date().toISOString(),
      lastMessageText: "",
      lastMessageAt: null,
      unreadMessagesCount: 0,
      isTemporary: true,
    };
  };

  const selectChatFromUrl = (loadedChats) => {
    if (!targetUserId) {
      setSelectedChat((prev) => {
        if (!prev) return null;
        return loadedChats.find((chat) => chat.chatId === prev.chatId) || null;
      });

      return;
    }

    const existingChat = loadedChats.find(
      (chat) => Number(chat.otherUserId) === targetUserId,
    );

    if (existingChat) {
      setSelectedChat(existingChat);
      return;
    }

    setSelectedChat(createTemporaryChat());
  };

  const loadChats = async (showLoader = true) => {
    setError("");

    if (showLoader) {
      setIsChatsLoading(true);
    }

    try {
      const data = await chats.getAll();
      const loadedChats = Array.isArray(data) ? data : [];

      setChatItems(loadedChats);
      selectChatFromUrl(loadedChats);
      notifyUnreadChanged(loadedChats);
    } catch (error) {
      setError(error.message || "Не вдалося завантажити чати");
    } finally {
      if (showLoader) {
        setIsChatsLoading(false);
      }
    }
  };

  const loadMessages = async (chatId) => {
    setIsMessagesLoading(true);

    try {
      const data = await chats.getMessages(chatId);
      setMessages(Array.isArray(data) ? data : []);

      await chats.markAsRead(chatId);
      markSelectedChatAsRead(chatId);
    } catch (error) {
      setError(error.message || "Не вдалося завантажити повідомлення");
    } finally {
      setIsMessagesLoading(false);
    }
  };

  const sendMessage = async () => {
    const text = messageText.trim();

    if (!text || !selectedChat) return;

    try {
      setMessageText("");

      await chats.sendMessage(selectedChat.otherUserId, text);

      const data = await chats.getAll();
      const loadedChats = Array.isArray(data) ? data : [];

      setChatItems(loadedChats);

      const createdOrExistingChat = loadedChats.find(
        (chat) => Number(chat.otherUserId) === Number(selectedChat.otherUserId),
      );

      if (createdOrExistingChat) {
        setSelectedChat(createdOrExistingChat);

        const messagesData = await chats.getMessages(createdOrExistingChat.chatId);
        setMessages(Array.isArray(messagesData) ? messagesData : []);
      }

      notifyUnreadChanged(loadedChats);
    } catch (error) {
      alert(error.message || "Не вдалося відправити повідомлення");
    }
  };

  return (
    <main className="flex h-screen overflow-hidden bg-[#0D1117] text-[#F3F4F6]">
      <Sidebar />

      <section className="flex min-h-0 flex-1 overflow-hidden">
        <ChatList
          chats={filteredChats}
          selectedChat={selectedChat}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          isLoading={isChatsLoading}
          onSelectChat={setSelectedChat}
        />

        <ChatWindow
          selectedChat={selectedChat}
          messages={messages}
          currentUserId={currentUserId}
          messageText={messageText}
          setMessageText={setMessageText}
          isMessagesLoading={isMessagesLoading}
          messagesContainerRef={messagesContainerRef}
          onSendMessage={sendMessage}
        />
      </section>

      {error && (
        <div className="fixed bottom-5 right-5 rounded-lg border border-[#B91C1C] bg-[#1C2128] px-5 py-4 text-[14px] text-[#B91C1C]">
          {error}
        </div>
      )}
    </main>
  );
}