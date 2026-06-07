import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { icons } from "../assets/icons";
import { Loader } from "../components/ui/Loader";
import { notifications } from "../api/notifications";

const NOTIFICATIONS_PER_PAGE = 8;

export function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const unreadCount = items.filter((item) => !item.isRead).length;
  const totalPages = Math.ceil(items.length / NOTIFICATIONS_PER_PAGE);

  const visibleNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * NOTIFICATIONS_PER_PAGE;
    const endIndex = startIndex + NOTIFICATIONS_PER_PAGE;

    return items.slice(startIndex, endIndex);
  }, [items, currentPage]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const notifyNotificationsChanged = (nextItems = items) => {
    const count = nextItems.filter((item) => !item.isRead).length;

    window.dispatchEvent(
      new CustomEvent("notifications-updated", {
        detail: { count },
      }),
    );
  };

  const loadNotifications = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await notifications.getAll();
      const loadedItems = Array.isArray(data) ? data : [];

      setItems(loadedItems);
      notifyNotificationsChanged(loadedItems);
    } catch (error) {
      setError(error.message || "Не вдалося завантажити сповіщення");
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notifications.markAllAsRead();

      const updatedItems = items.map((item) => ({
        ...item,
        isRead: true,
      }));

      setItems(updatedItems);
      notifyNotificationsChanged(updatedItems);
    } catch (error) {
      alert(error.message || "Не вдалося позначити всі сповіщення");
    }
  };

  const markAsRead = async (notificationId) => {
    const notification = items.find(
      (item) => item.notificationId === notificationId,
    );

    if (!notification || notification.isRead) return;

    try {
      await notifications.markAsRead(notificationId);

      const updatedItems = items.map((item) =>
        item.notificationId === notificationId
          ? { ...item, isRead: true }
          : item,
      );

      setItems(updatedItems);
      notifyNotificationsChanged(updatedItems);
    } catch (error) {
      alert(error.message || "Не вдалося прочитати сповіщення");
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <main className="flex min-h-screen bg-[#0D1117] text-[#F3F4F6]">
      <Sidebar />

      <section className="flex-1 px-8 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-[32px] font-bold">Сповіщення</h1>
            <p className="text-[16px] text-[#9CA3AF]">
              У вас {unreadCount} непрочитаних сповіщень
            </p>
          </div>

          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex h-12 items-center gap-2 rounded-md bg-[#B91C1C] px-5 text-[14px] font-bold transition hover:bg-[#9F1818] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <img src={icons.check} alt="" className="h-4 w-4 icon-white" />
            Позначити всі як прочитані
          </button>
        </div>

        {error && (
          <div className="mb-6 inline-flex rounded-lg border border-[#B91C1C] bg-[#1C2128] px-5 py-4 text-[14px] text-[#B91C1C]">
            {error}
          </div>
        )}

        {isLoading ? (
          <Loader />
        ) : (
          <div className="flex min-h-221 flex-col justify-between">
            <div className="space-y-3">
              {visibleNotifications.map((notification) => (
                <NotificationCard
                  key={notification.notificationId}
                  notification={notification}
                  onClick={() => markAsRead(notification.notificationId)}
                />
              ))}

              {items.length === 0 && (
                <div className="inline-flex w-fit rounded-lg border border-[#30363D] bg-[#1C2128] px-5 py-4 text-[14px] text-[#9CA3AF]">
                  Сповіщень немає
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    className={`flex h-10 w-10 items-center justify-center rounded-md border text-[14px] font-bold transition ${
                      currentPage === page
                        ? "border-[#B91C1C] bg-[#B91C1C] text-[#F3F4F6]"
                        : "border-[#30363D] bg-[#161B22] text-[#D1D5DB] hover:border-[#4B5563] hover:bg-[#232A34] hover:text-[#F3F4F6]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function NotificationCard({ notification, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center justify-between rounded-lg border p-5 text-left transition hover:border-[#4B5563] hover:bg-[#232A34] ${
        notification.isRead
          ? "border-[#30363D] bg-[#161B22]"
          : "border-[#B91C1C] bg-[#1C2128]"
      }`}
    >
      <div className="flex min-w-0 items-center gap-5">
        <NotificationIcon
          type={notification.type}
          isRead={notification.isRead}
        />

        <div className="min-w-0">
          <h2 className="text-[16px] font-bold">
            {getNotificationTitle(notification.type)}
          </h2>

          <p className="mt-1 text-[14px] text-[#D1D5DB]">
            {notification.messageText}
          </p>
        </div>
      </div>

      <div className="ml-5 flex shrink-0 items-center gap-5">
        <span className="min-w-28 text-right text-[13px] text-[#9CA3AF]">
          {formatDateTime(notification.createdAt)}
        </span>

        {!notification.isRead && (
          <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
        )}
      </div>
    </button>
  );
}

function NotificationIcon({ type, isRead }) {
  const iconMap = {
    FriendRequest: icons.userPlus,
    Invite: icons.mail,
    Rating: icons.starFilled,
  };

  const iconAdjustMap = {
    Rating: "-translate-y-px",
  };

  return (
    <div
      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
        isRead ? "bg-[#30363D]" : "bg-[#DC2626]"
      }`}
    >
      <img
        src={iconMap[type] || icons.bell}
        alt=""
        draggable="false"
        className={`h-5 w-5 object-contain icon-white ${
          iconAdjustMap[type] || ""
        }`}
      />
    </div>
  );
}

function getNotificationTitle(type) {
  const titleMap = {
    FriendRequest: "Запит у друзі",
    Invite: "Ігровий інвайт",
    Rating: "Оцінка профілю",
  };

  return titleMap[type] || "Сповіщення";
}

function formatDateTime(value) {
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
