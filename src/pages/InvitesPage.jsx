import { useEffect, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import {
  EmptyMessage,
  HistoryInviteCard,
  IncomingInviteCard,
  OutgoingInviteCard,
  SectionTitle,
} from "../components/invites/InviteCards";
import { ReviewModal } from "../components/invites/ReviewModal";
import { Loader } from "../components/ui/Loader";
import { invites } from "../api/invites";
import { ratings } from "../api/ratings";

export function InvitesPage() {
  const [incomingInvites, setIncomingInvites] = useState([]);
  const [outgoingInvites, setOutgoingInvites] = useState([]);
  const [history, setHistory] = useState([]);

  const [reviewInvite, setReviewInvite] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [comment, setComment] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [incomingData, outgoingData, historyData] = await Promise.all([
        invites.getIncoming(),
        invites.getOutgoing(),
        invites.getHistory(),
      ]);

      const incoming = Array.isArray(incomingData) ? incomingData : [];
      const outgoing = Array.isArray(outgoingData) ? outgoingData : [];
      const historyItems = Array.isArray(historyData) ? historyData : [];

      setIncomingInvites(incoming.map(mapIncomingInvite));
      setOutgoingInvites(outgoing.map(mapOutgoingInvite));
      setHistory(historyItems.map(mapHistoryInvite));

      notifyInvitesChanged(incoming);
    } catch (error) {
      setError(error.message || "Не вдалося завантажити інвайти");
    } finally {
      setIsLoading(false);
    }
  };

  const notifyInvitesChanged = (items = incomingInvites) => {
    window.dispatchEvent(
      new CustomEvent("invites-updated", {
        detail: { count: items.length },
      }),
    );
  };

  const acceptInvite = async (invite) => {
    try {
      await invites.updateStatus(invite.id, "Accepted");
      await loadInvites();
    } catch (error) {
      alert(error.message || "Не вдалося прийняти інвайт");
    }
  };

  const declineInvite = async (invite) => {
    try {
      await invites.updateStatus(invite.id, "Declined");
      await loadInvites();
    } catch (error) {
      alert(error.message || "Не вдалося відхилити інвайт");
    }
  };

  const cancelInvite = async (id) => {
    try {
      await invites.updateStatus(id, "Cancelled");
      await loadInvites();
    } catch (error) {
      alert(error.message || "Не вдалося скасувати інвайт");
    }
  };

  const openReviewModal = (invite) => {
    setReviewInvite(invite);
    setSelectedRating(null);
    setComment("");
  };

  const closeReviewModal = () => {
    setReviewInvite(null);
  };

  const sendReview = async () => {
    if (!reviewInvite) return;

    try {
      await ratings.create({
        inviteId: reviewInvite.id,
        score: selectedRating,
        commentText: comment,
      });

      setReviewInvite(null);
      setSelectedRating(null);
      setComment("");

      await loadInvites();
    } catch (error) {
      alert(error.message || "Не вдалося залишити відгук");
    }
  };

  return (
    <main className="flex min-h-screen bg-[#0D1117] text-[#F3F4F6]">
      <Sidebar />

      <section className="flex-1 px-8 py-8">
        <h1 className="mb-2 text-[32px] font-bold">Ігрові інвайти</h1>
        <p className="mb-8 text-[16px] text-[#9CA3AF]">
          Керуйте запрошеннями до гри
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
            <SectionTitle text={`Вхідні інвайти (${incomingInvites.length})`} />

            <div className="mb-8 grid grid-cols-2 gap-5">
              {incomingInvites.map((invite) => (
                <IncomingInviteCard
                  key={invite.id}
                  invite={invite}
                  onAccept={() => acceptInvite(invite)}
                  onDecline={() => declineInvite(invite)}
                />
              ))}

              {incomingInvites.length === 0 && (
                <EmptyMessage text="Вхідних інвайтів немає" />
              )}
            </div>

            <SectionTitle
              text={`Вихідні інвайти (${outgoingInvites.length})`}
            />

            <div className="mb-8 grid grid-cols-2 gap-5">
              {outgoingInvites.map((invite) => (
                <OutgoingInviteCard
                  key={invite.id}
                  invite={invite}
                  onCancel={() => cancelInvite(invite.id)}
                />
              ))}

              {outgoingInvites.length === 0 && (
                <EmptyMessage text="Вихідних інвайтів немає" />
              )}
            </div>

            <SectionTitle text="Історія інвайтів" />

            <div className="custom-scroll max-h-165 space-y-4">
              {history.map((invite) => (
                <HistoryInviteCard
                  key={invite.id}
                  invite={invite}
                  onReview={() => openReviewModal(invite)}
                />
              ))}

              {history.length === 0 && (
                <EmptyMessage text="Історія інвайтів порожня" />
              )}
            </div>
          </>
        )}
      </section>

      {reviewInvite && (
        <ReviewModal
          selectedRating={selectedRating}
          setSelectedRating={setSelectedRating}
          comment={comment}
          setComment={setComment}
          onClose={closeReviewModal}
          onSend={sendReview}
        />
      )}
    </main>
  );
}

function mapIncomingInvite(invite) {
  return {
    id: invite.inviteId,
    game: invite.gameName,
    from: invite.senderNickname,
    date: formatDateTime(invite.createdAt),
    raw: invite,
  };
}

function mapOutgoingInvite(invite) {
  return {
    id: invite.inviteId,
    game: invite.gameName,
    to: invite.receiverNickname,
    date: formatDateTime(invite.createdAt),
    status: getStatusText(invite.status),
    raw: invite,
  };
}

function mapHistoryInvite(invite) {
  return {
    id: invite.inviteId,
    game: invite.gameName,
    user: getOtherUserNickname(invite),
    date: formatDateTime(invite.createdAt),
    status: getStatusText(invite.status),

    canRate: invite.status === "Accepted" && !invite.isRatedByCurrentUser,

    rated: invite.status === "Accepted" && invite.isRatedByCurrentUser,

    ratedUserId: invite.ratedUserId,

    raw: invite,
  };
}

function getOtherUserNickname(invite) {
  if (invite.ratedUserId === invite.senderId) {
    return invite.senderNickname;
  }

  if (invite.ratedUserId === invite.receiverId) {
    return invite.receiverNickname;
  }

  return invite.receiverNickname || invite.senderNickname;
}

function getStatusText(status) {
  const statuses = {
    Pending: "Очікує відповіді",
    Accepted: "Прийнято",
    Declined: "Відхилено",
    Cancelled: "Скасовано",
  };

  return statuses[status] || status;
}

function formatDateTime(value) {
  if (!value) return "";

  const date = new Date(value);

  return `${date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} ${date.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
