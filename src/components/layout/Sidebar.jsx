import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { icons } from "../../assets/icons";
import { profiles } from "../../api/profiles";
import { chats } from "../../api/chats";
import { friends } from "../../api/friends";
import { invites } from "../../api/invites";
import { notifications } from "../../api/notifications";
import { getRoleFromJWT, removeJWT } from "../../utils/jwt";
import { NotificationBadge } from "../ui/NotificationBadge";

const UNREAD_CACHE_KEY = "teamforge-unread-messages-count";
const FRIEND_REQUESTS_CACHE_KEY = "teamforge-friend-requests-count";
const GAME_INVITES_CACHE_KEY = "teamforge-game-invites-count";
const NOTIFICATIONS_CACHE_KEY = "teamforge-notifications-count";
const USER_CACHE_KEY = "teamforge-sidebar-user";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    try {
      const cachedUser = localStorage.getItem(USER_CACHE_KEY);

      if (cachedUser) {
        return JSON.parse(cachedUser);
      }
    } catch {
      localStorage.removeItem(USER_CACHE_KEY);
    }

    return {
      nickname: "Користувач",
      role: getRoleFromJWT() || "User",
      rating: 0,
    };
  });

  const [unreadMessagesCount, setUnreadMessagesCount] = useState(() => {
    return Number(localStorage.getItem(UNREAD_CACHE_KEY) || 0);
  });

  const [friendRequestsCount, setFriendRequestsCount] = useState(() => {
    return Number(localStorage.getItem(FRIEND_REQUESTS_CACHE_KEY) || 0);
  });

  const [gameInvitesCount, setGameInvitesCount] = useState(() => {
    return Number(localStorage.getItem(GAME_INVITES_CACHE_KEY) || 0);
  });

  const [notificationsCount, setNotificationsCount] = useState(() => {
    return Number(localStorage.getItem(NOTIFICATIONS_CACHE_KEY) || 0);
  });

  useEffect(() => {
    loadCurrentUser();
    loadUnreadMessagesCount();
    loadIncomingFriendRequestsCount();
    loadIncomingGameInvitesCount();
    loadUnreadNotificationsCount();

    const handleUnreadUpdate = (event) => {
      if (typeof event.detail?.count === "number") {
        setUnreadMessagesCount(event.detail.count);
        localStorage.setItem(UNREAD_CACHE_KEY, String(event.detail.count));
        return;
      }

      loadUnreadMessagesCount();
    };

    const handleFriendRequestsUpdate = (event) => {
      if (typeof event.detail?.count === "number") {
        setFriendRequestsCount(event.detail.count);
        localStorage.setItem(
          FRIEND_REQUESTS_CACHE_KEY,
          String(event.detail.count),
        );
        return;
      }

      loadIncomingFriendRequestsCount();
    };

    const handleInvitesUpdate = (event) => {
      if (typeof event.detail?.count === "number") {
        setGameInvitesCount(event.detail.count);
        localStorage.setItem(
          GAME_INVITES_CACHE_KEY,
          String(event.detail.count),
        );
        return;
      }

      loadIncomingGameInvitesCount();
    };

    const handleNotificationsUpdate = (event) => {
      if (typeof event.detail?.count === "number") {
        setNotificationsCount(event.detail.count);
        localStorage.setItem(
          NOTIFICATIONS_CACHE_KEY,
          String(event.detail.count),
        );
        return;
      }

      loadUnreadNotificationsCount();
    };

    const handleUserUpdate = (event) => {
      const nickname = event.detail?.nickname;

      if (!nickname) return;

      setUser((prev) => {
        const updatedUser = {
          ...prev,
          nickname,
        };

        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(updatedUser));

        return updatedUser;
      });
    };

    window.addEventListener("chat-unread-updated", handleUnreadUpdate);
    window.addEventListener(
      "friend-requests-updated",
      handleFriendRequestsUpdate,
    );
    window.addEventListener("invites-updated", handleInvitesUpdate);
    window.addEventListener("notifications-updated", handleNotificationsUpdate);
    window.addEventListener("sidebar-user-updated", handleUserUpdate);

    return () => {
      window.removeEventListener("chat-unread-updated", handleUnreadUpdate);

      window.removeEventListener(
        "friend-requests-updated",
        handleFriendRequestsUpdate,
      );

      window.removeEventListener("invites-updated", handleInvitesUpdate);

      window.removeEventListener(
        "notifications-updated",
        handleNotificationsUpdate,
      );

      window.removeEventListener("sidebar-user-updated", handleUserUpdate);
    };
  }, []);

  const loadCurrentUser = async () => {
    try {
      const profile = await profiles.getMe();

      const currentUser = {
        nickname: profile.nickname || "Користувач",
        role: getRoleFromJWT() || "User",
        rating: Number(profile.averageRating || 0),
      };

      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(currentUser));
      setUser(currentUser);
    } catch {
      setUser((prev) => ({
        nickname: prev?.nickname || "Користувач",
        role: prev?.role || getRoleFromJWT() || "User",
        rating: Number(prev?.rating || 0),
      }));
    }
  };

  const loadUnreadMessagesCount = async () => {
    try {
      const data = await chats.getAll();
      const chatItems = Array.isArray(data) ? data : [];

      const totalUnread = chatItems.reduce(
        (sum, chat) => sum + Number(chat.unreadMessagesCount || 0),
        0,
      );

      localStorage.setItem(UNREAD_CACHE_KEY, String(totalUnread));
      setUnreadMessagesCount(totalUnread);
    } catch {
      setUnreadMessagesCount((prev) => prev);
    }
  };

  const loadIncomingFriendRequestsCount = async () => {
    try {
      const data = await friends.getIncomingRequests();
      const incomingItems = Array.isArray(data) ? data : [];

      localStorage.setItem(
        FRIEND_REQUESTS_CACHE_KEY,
        String(incomingItems.length),
      );

      setFriendRequestsCount(incomingItems.length);
    } catch {
      setFriendRequestsCount((prev) => prev);
    }
  };

  const loadIncomingGameInvitesCount = async () => {
    try {
      const data = await invites.getIncoming();
      const incomingItems = Array.isArray(data) ? data : [];

      localStorage.setItem(
        GAME_INVITES_CACHE_KEY,
        String(incomingItems.length),
      );
      setGameInvitesCount(incomingItems.length);
    } catch {
      setGameInvitesCount((prev) => prev);
    }
  };

  const loadUnreadNotificationsCount = async () => {
    try {
      const data = await notifications.getAll();
      const items = Array.isArray(data) ? data : [];

      const unreadCount = items.filter((item) => !item.isRead).length;

      localStorage.setItem(NOTIFICATIONS_CACHE_KEY, String(unreadCount));
      setNotificationsCount(unreadCount);
    } catch {
      setNotificationsCount((prev) => prev);
    }
  };

  const logout = () => {
    removeJWT();
    localStorage.removeItem(UNREAD_CACHE_KEY);
    localStorage.removeItem(FRIEND_REQUESTS_CACHE_KEY);
    localStorage.removeItem(GAME_INVITES_CACHE_KEY);
    localStorage.removeItem(NOTIFICATIONS_CACHE_KEY);
    localStorage.removeItem(USER_CACHE_KEY);
    navigate("/auth");
  };

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col overflow-hidden border-r border-[#30363D] bg-[#161B22] p-4">
      <div className="mb-8 px-3">
        <h2 className="text-[22px] font-bold text-[#DC2626]">TeamForge</h2>
        <p className="text-[13px] text-[#9CA3AF]">Знайди свою команду</p>
      </div>

      <nav className="space-y-2">
        <MenuItem
          icon={icons.search}
          text="Пошук тіммейтів"
          active={location.pathname === "/search"}
          onClick={() => navigate("/search")}
        />

        <MenuItem
          icon={icons.messageSquare}
          text="Чат"
          active={location.pathname === "/chat"}
          badge={unreadMessagesCount}
          onClick={() => navigate("/chat")}
        />

        <MenuItem
          icon={icons.users}
          text="Друзі"
          active={location.pathname === "/friends"}
          badge={friendRequestsCount}
          onClick={() => navigate("/friends")}
        />

        <MenuItem
          icon={icons.mail}
          text="Інвайти"
          active={location.pathname === "/invites"}
          badge={gameInvitesCount}
          onClick={() => navigate("/invites")}
        />

        <MenuItem
          icon={icons.bell}
          text="Сповіщення"
          active={location.pathname === "/notifications"}
          badge={notificationsCount}
          onClick={() => navigate("/notifications")}
        />

        <MenuItem
          icon={icons.settings}
          text="Налаштування"
          active={location.pathname === "/settings"}
          onClick={() => navigate("/settings")}
        />
      </nav>

      <div className="mt-auto space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[#30363D]" />

          <div className="flex items-center gap-1">
            <img
              src={icons.starFilled}
              alt=""
              className="h-4 w-4 shrink-0 icon-star"
            />

            <span className="text-[13px] font-bold leading-none text-[#F3F4F6]">
              {Number(user.rating || 0).toFixed(1)}
            </span>
          </div>

          <div className="h-px flex-1 bg-[#30363D]" />
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-[#30363D] bg-[#1C2128] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B91C1C] text-[14px] font-medium">
            {user.nickname[0]?.toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-[14px] font-bold">{user.nickname}</p>

            <p className="text-[12px] text-[#9CA3AF]">
              {user.role === "Admin" ? "Адміністратор" : "Гравець"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full rounded-md border border-[#30363D] bg-[#161B22] py-3 text-[14px] font-bold text-[#D1D5DB] transition hover:border-[#4B5563] hover:bg-[#232A34] hover:text-[#F3F4F6]"
        >
          Вийти з акаунта
        </button>
      </div>
    </aside>
  );
}

function MenuItem({ icon, text, active, badge = 0, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-[15px] font-medium transition ${
        active
          ? "bg-[#B91C1C] text-[#F3F4F6] hover:bg-[#9F1818]"
          : "text-[#D1D5DB] hover:bg-[#232A34] hover:text-[#F3F4F6]"
      }`}
    >
      <img
        src={icon}
        alt=""
        className={`h-5 w-5 ${active ? "icon-white" : "icon-muted"}`}
      />

      <span className="min-w-0 flex-1 truncate">{text}</span>

      <NotificationBadge count={badge} active={active} />
    </button>
  );
}
