import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { icons } from "../assets/icons";
import { friends } from "../api/friends";
import { Loader } from "../components/ui/Loader";

export function FriendsPage() {
  const navigate = useNavigate();

  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFriendsPage();
  }, []);

  const notifyFriendRequestsChanged = (items = incomingRequests) => {
    window.dispatchEvent(
      new CustomEvent("friend-requests-updated", {
        detail: { count: items.length },
      }),
    );
  };

  const loadFriendsPage = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [incomingData, outgoingData, friendsData] = await Promise.all([
        friends.getIncomingRequests(),
        friends.getOutgoingRequests(),
        friends.getAll(),
      ]);

      const incoming = Array.isArray(incomingData) ? incomingData : [];
      const outgoing = Array.isArray(outgoingData) ? outgoingData : [];
      const friendItems = Array.isArray(friendsData) ? friendsData : [];

      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
      setFriendsList(friendItems);

      notifyFriendRequestsChanged(incoming);
    } catch (error) {
      setError(error.message || "Не вдалося завантажити друзів");
    } finally {
      setIsLoading(false);
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      await friends.respondRequest(requestId, "Accepted");
      await loadFriendsPage();
    } catch (error) {
      alert(error.message || "Не вдалося прийняти запит");
    }
  };

  const declineRequest = async (requestId) => {
    try {
      await friends.respondRequest(requestId, "Declined");
      await loadFriendsPage();
    } catch (error) {
      alert(error.message || "Не вдалося відхилити запит");
    }
  };

  const cancelRequest = async (requestId) => {
    try {
      await friends.respondRequest(requestId, "Cancelled");
      await loadFriendsPage();
    } catch (error) {
      alert(error.message || "Не вдалося скасувати запит");
    }
  };

  const removeFriend = async (friendId) => {
    try {
      await friends.deleteFriend(friendId);
      await loadFriendsPage();
    } catch (error) {
      alert(error.message || "Не вдалося видалити з друзів");
    }
  };

  const openChat = (userId, nickname) => {
    navigate(`/chat?userId=${userId}&nickname=${encodeURIComponent(nickname)}`);
  };

  const openProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <main className="flex min-h-screen bg-[#0D1117] text-[#F3F4F6]">
      <Sidebar />

      <section className="flex-1 px-8 py-8">
        <h1 className="mb-2 text-[32px] font-bold">Друзі</h1>
        <p className="mb-8 text-[16px] text-[#9CA3AF]">
          Керуйте своїми друзями та запитами
        </p>

        {error && (
          <div className="mb-6 inline-flex rounded-lg border border-[#B91C1C] bg-[#1C2128] px-5 py-4 text-[14px] text-[#B91C1C]">
            {error}
          </div>
        )}

        {isLoading ? (
          <Loader />
        ) : (
          <>
            <SectionTitle text={`Вхідні запити (${incomingRequests.length})`} />

            <div className="mb-8 grid grid-cols-2 gap-5">
              {incomingRequests.map((request) => (
                <RequestCard
                  key={request.friendRequestId}
                  user={{
                    userId: request.senderId,
                    nickname: request.senderNickname,
                  }}
                  type="incoming"
                  onOpenProfile={() => openProfile(request.senderId)}
                  onAccept={() => acceptRequest(request.friendRequestId)}
                  onDecline={() => declineRequest(request.friendRequestId)}
                />
              ))}

              {incomingRequests.length === 0 && (
                <EmptyMessage text="Вхідних запитів немає" />
              )}
            </div>

            <SectionTitle
              text={`Вихідні запити (${outgoingRequests.length})`}
            />

            <div className="mb-8 grid grid-cols-2 gap-5">
              {outgoingRequests.map((request) => (
                <RequestCard
                  key={request.friendRequestId}
                  user={{
                    userId: request.receiverId,
                    nickname: request.receiverNickname,
                  }}
                  type="outgoing"
                  onOpenProfile={() => openProfile(request.receiverId)}
                  onCancel={() => cancelRequest(request.friendRequestId)}
                />
              ))}

              {outgoingRequests.length === 0 && (
                <EmptyMessage text="Вихідних запитів немає" />
              )}
            </div>

            <SectionTitle text={`Мої друзі (${friendsList.length})`} />

            <div className="grid grid-cols-2 gap-5">
              {friendsList.map((friend) => (
                <FriendCard
                  key={friend.friendId}
                  friend={friend}
                  onOpenProfile={() => openProfile(friend.userId)}
                  onMessage={() => openChat(friend.userId, friend.nickname)}
                  onRemove={() => removeFriend(friend.friendId)}
                />
              ))}

              {friendsList.length === 0 && (
                <EmptyMessage text="Список друзів порожній" />
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function SectionTitle({ text }) {
  return <h2 className="mb-4 text-[20px] font-bold">{text}</h2>;
}

function RequestCard({
  user,
  type,
  onOpenProfile,
  onAccept,
  onDecline,
  onCancel,
}) {
  return (
    <article className="rounded-lg border border-[#30363D] bg-[#1C2128] p-6">
      <UserInfo user={user} onOpenProfile={onOpenProfile} />

      {type === "incoming" ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onAccept}
            className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#16A34A] text-[14px] font-bold transition hover:bg-[#15803D]"
          >
            <img src={icons.check} alt="" className="h-4 w-4 icon-white" />
            Прийняти
          </button>

          <button
            type="button"
            onClick={onDecline}
            className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#B91C1C] text-[14px] font-bold transition hover:bg-[#9F1818]"
          >
            <img src={icons.x} alt="" className="h-4 w-4 icon-white" />
            Відхилити
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onCancel}
          className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#B91C1C] text-[14px] font-bold transition hover:bg-[#9F1818]"
        >
          <img src={icons.x} alt="" className="h-4 w-4 icon-white" />
          Скасувати запит
        </button>
      )}
    </article>
  );
}

function FriendCard({ friend, onOpenProfile, onMessage, onRemove }) {
  return (
    <article className="rounded-lg border border-[#30363D] bg-[#1C2128] p-6">
      <UserInfo user={friend} onOpenProfile={onOpenProfile} />

      <div className="mt-5 grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex h-10 items-center justify-center gap-2 rounded-md border border-[#30363D] bg-[#161B22] text-[14px] font-bold transition hover:border-[#4B5563] hover:bg-[#232A34]"
        >
          <img src={icons.user} alt="" className="h-4 w-4 icon-muted" />
        </button>

        <button
          type="button"
          onClick={onMessage}
          className="flex h-10 items-center justify-center gap-2 rounded-md border border-[#30363D] bg-[#161B22] text-[14px] font-bold transition hover:border-[#4B5563] hover:bg-[#232A34]"
        >
          <img
            src={icons.messageSquare}
            alt=""
            className="h-4 w-4 icon-muted"
          />
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#B91C1C] text-[14px] font-bold transition hover:bg-[#9F1818]"
        >
          <img src={icons.userMinus} alt="" className="h-4 w-4 icon-white" />
        </button>
      </div>
    </article>
  );
}

function UserInfo({ user, onOpenProfile }) {
  const nickname = user.nickname || "Користувач";
  const description = user.description || "Опис профілю відсутній";

  return (
    <button
      type="button"
      onClick={onOpenProfile}
      className="flex w-full items-center gap-5 text-left"
    >
      <Avatar letter={nickname[0]?.toUpperCase()} />

      <div className="min-w-0">
        <h3 className="truncate text-[18px] font-bold transition hover:text-[#DC2626]">
          {nickname}
        </h3>

        <p className="mt-1 line-clamp-2 text-[14px] text-[#9CA3AF]">
          {description}
        </p>
      </div>
    </button>
  );
}

function Avatar({ letter }) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#B91C1C] text-[18px] font-medium">
      {letter || "?"}
    </div>
  );
}

function EmptyMessage({ text }) {
  return (
    <div className="inline-flex w-fit rounded-lg border border-[#30363D] bg-[#1C2128] px-5 py-4 text-[14px] text-[#9CA3AF]">
      {text}
    </div>
  );
}
