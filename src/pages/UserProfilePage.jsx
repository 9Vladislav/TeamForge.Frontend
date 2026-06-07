import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { ReviewModal } from "../components/invites/ReviewModal";
import {
  GameInviteModal,
  InfoModal,
} from "../components/profileView/ProfileModals";
import { ProfileHeader } from "../components/profileView/ProfileHeader";
import { ProfileGamesSection } from "../components/profileView/ProfileGamesSection";
import { ProfileScheduleSection } from "../components/profileView/ProfileScheduleSection";
import { ProfileReviewsSection } from "../components/profileView/ProfileReviewsSection";
import { profiles } from "../api/profiles";
import { ratings } from "../api/ratings";
import { invites } from "../api/invites";
import { friends } from "../api/friends";
import { Loader } from "../components/ui/Loader";

export function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [profileRatings, setProfileRatings] = useState([]);
  const [acceptedInvites, setAcceptedInvites] = useState([]);
  const [outgoingInvites, setOutgoingInvites] = useState([]);
  const [incomingInvites, setIncomingInvites] = useState([]);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [friendStatus, setFriendStatus] = useState("none");
  const [friendRecordId, setFriendRecordId] = useState(null);
  const [friendActionLoading, setFriendActionLoading] = useState(false);

  const [friendModalOpen, setFriendModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteSuccessOpen, setInviteSuccessOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const [selectedGame, setSelectedGame] = useState("");
  const [selectedRating, setSelectedRating] = useState(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    loadProfile();
  }, [userId]);

  useEffect(() => {
    if (!profile?.games?.length) return;

    const disabledIds = getDisabledInviteGameIds(
      outgoingInvites,
      incomingInvites,
      Number(userId),
    );

    const firstAvailableGame = profile.games.find(
      (game) => !disabledIds.includes(game.gameId),
    );

    setSelectedGame(firstAvailableGame?.gameName || profile.games[0].gameName);
  }, [profile, outgoingInvites, incomingInvites, userId]);

  const loadProfile = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [
        profileData,
        ratingsData,
        friendsData,
        incomingFriendRequests,
        outgoingFriendRequests,
        acceptedInvitesData,
        incomingInvitesData,
        outgoingInvitesData,
      ] = await Promise.all([
        profiles.getById(userId),
        ratings.getByUserId(userId),
        friends.getAll(),
        friends.getIncomingRequests(),
        friends.getOutgoingRequests(),
        invites.getAccepted(),
        invites.getIncoming(),
        invites.getOutgoing(),
      ]);

      setProfile(profileData);
      setProfileRatings(Array.isArray(ratingsData) ? ratingsData : []);
      setAcceptedInvites(
        Array.isArray(acceptedInvitesData) ? acceptedInvitesData : [],
      );
      setIncomingInvites(
        Array.isArray(incomingInvitesData) ? incomingInvitesData : [],
      );
      setOutgoingInvites(
        Array.isArray(outgoingInvitesData) ? outgoingInvitesData : [],
      );

      const targetUserId = Number(userId);

      const friendItem = findFriendItem(friendsData, targetUserId);
      const incomingItem = findIncomingRequest(
        incomingFriendRequests,
        targetUserId,
      );
      const outgoingItem = findOutgoingRequest(
        outgoingFriendRequests,
        targetUserId,
      );

      if (friendItem) {
        setFriendStatus("friends");
        setFriendRecordId(friendItem.friendId);
      } else if (incomingItem) {
        setFriendStatus("incoming");
        setFriendRecordId(incomingItem.friendRequestId);
      } else if (outgoingItem) {
        setFriendStatus("pending");
        setFriendRecordId(outgoingItem.friendRequestId);
      } else {
        setFriendStatus("none");
        setFriendRecordId(null);
      }
    } catch (error) {
      setError(error.message || "Не вдалося завантажити профіль");
    } finally {
      setIsLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    setFriendActionLoading(true);

    try {
      await friends.sendRequest(Number(userId));
      setFriendStatus("pending");
      setFriendModalOpen(true);
    } catch (error) {
      alert(error.message || "Не вдалося відправити запит у друзі");
    } finally {
      setFriendActionLoading(false);
    }
  };

  const acceptFriendRequest = async () => {
    if (!friendRecordId) {
      alert("ID запиту не знайдено");
      return;
    }

    setFriendActionLoading(true);

    try {
      await friends.respondRequest(friendRecordId, "Accepted");

      const friendsData = await friends.getAll();
      const friendItem = findFriendItem(friendsData, Number(userId));

      setFriendStatus("friends");
      setFriendRecordId(friendItem?.friendId || null);
    } catch (error) {
      alert(error.message || "Не вдалося прийняти запит у друзі");
    } finally {
      setFriendActionLoading(false);
    }
  };

  const removeFriend = async () => {
    if (!friendRecordId) return;

    setFriendActionLoading(true);

    try {
      await friends.deleteFriend(friendRecordId);
      setFriendStatus("none");
      setFriendRecordId(null);
    } catch (error) {
      alert(error.message || "Не вдалося видалити з друзів");
    } finally {
      setFriendActionLoading(false);
    }
  };

  const sendGameInvite = async () => {
    const disabledInviteGameIds = getDisabledInviteGameIds(
      outgoingInvites,
      incomingInvites,
      Number(userId),
    );

    const game = profile?.games?.find((game) => game.gameName === selectedGame);

    if (!game) {
      alert("Оберіть гру для інвайту");
      return;
    }

    if (disabledInviteGameIds.includes(game.gameId)) {
      alert("Інвайт у цю гру вже існує");
      return;
    }

    try {
      await invites.create({
        receiverId: Number(userId),
        gameId: game.gameId,
      });

      setOutgoingInvites((prev) => [
        ...prev,
        {
          receiverId: Number(userId),
          gameId: game.gameId,
          status: "Pending",
        },
      ]);

      setInviteModalOpen(false);
      setInviteSuccessOpen(true);
    } catch (error) {
      alert(error.message || "Не вдалося відправити інвайт");
    }
  };

  const openChat = () => {
    navigate(`/chat?userId=${userId}&nickname=${encodeURIComponent(nickname)}`);
  };

  const sendReview = async () => {
    const invite = findInviteForReview(
      acceptedInvites,
      profileRatings,
      Number(userId),
    );

    if (!invite) {
      alert("Немає прийнятого інвайту для оцінювання");
      return;
    }

    try {
      await ratings.create({
        inviteId: invite.inviteId,
        score: selectedRating,
        commentText: comment,
      });

      setReviewModalOpen(false);
      setSelectedRating(null);
      setComment("");
      await loadProfile();
    } catch (error) {
      alert(error.message || "Не вдалося залишити відгук");
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen bg-[#0D1117] text-[#F3F4F6]">
        <Sidebar />
        <section className="flex-1 px-8 py-8">
          <Loader />
        </section>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="flex min-h-screen bg-[#0D1117] text-[#F3F4F6]">
        <Sidebar />
        <section className="flex-1 px-8 py-8">
          <div className="inline-flex rounded-lg border border-[#B91C1C] bg-[#1C2128] px-5 py-4 text-[14px] text-[#B91C1C]">
            {error || "Профіль не знайдено"}
          </div>
        </section>
      </main>
    );
  }

  const nickname = profile.nickname || "Користувач";
  const averageRating = Number(profile.averageRating || 0).toFixed(1);
  const reviewsCount = profileRatings.length || profile.ratings?.length || 0;

  const reviewsWithComments = profileRatings
    .filter((review) => getReviewText(review).trim().length > 0)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);

      return dateB - dateA;
    });

  const disabledInviteGameIds = getDisabledInviteGameIds(
    outgoingInvites,
    incomingInvites,
    Number(userId),
  );

  const allInvitesAlreadyExist =
    profile.games?.length > 0 &&
    profile.games.every((game) => disabledInviteGameIds.includes(game.gameId));

  const availableInviteForReview = findInviteForReview(
    acceptedInvites,
    profileRatings,
    Number(userId),
  );

  const canLeaveReview = Boolean(availableInviteForReview);
  const isPublic = profile.visibilityStatus === "Public";

  return (
    <main className="flex min-h-screen bg-[#0D1117] text-[#F3F4F6]">
      <Sidebar />

      <section className="flex-1 px-8 py-8">
        <ProfileHeader
          nickname={nickname}
          description={profile.description}
          averageRating={averageRating}
          reviewsCount={reviewsCount}
          isPublic={isPublic}
          friendStatus={friendStatus}
          friendActionLoading={friendActionLoading}
          allInvitesAlreadyExist={allInvitesAlreadyExist}
          onOpenChat={openChat}
          onSendFriendRequest={sendFriendRequest}
          onAcceptFriendRequest={acceptFriendRequest}
          onRemoveFriend={removeFriend}
          onOpenInviteModal={() => setInviteModalOpen(true)}
        />

        <div className="mb-6 grid grid-cols-[2fr_1fr] gap-6">
          <ProfileGamesSection games={profile.games || []} />

          <ProfileScheduleSection
            activityPeriods={profile.activityPeriods || []}
          />
        </div>

        <ProfileReviewsSection
          reviews={reviewsWithComments}
          canLeaveReview={canLeaveReview}
          onOpenReviewModal={() => {
            setSelectedRating(null);
            setComment("");
            setReviewModalOpen(true);
          }}
          getReviewText={getReviewText}
        />
      </section>

      {friendModalOpen && (
        <InfoModal
          title="Запит у друзі відправлено"
          text={`Запит на додавання користувача ${nickname} у друзі успішно відправлено.`}
          onClose={() => setFriendModalOpen(false)}
        />
      )}

      {inviteModalOpen && (
        <GameInviteModal
          selectedGame={selectedGame}
          setSelectedGame={setSelectedGame}
          games={profile.games || []}
          disabledGameIds={disabledInviteGameIds}
          onClose={() => setInviteModalOpen(false)}
          onSend={sendGameInvite}
        />
      )}

      {inviteSuccessOpen && (
        <InfoModal
          title="Ігровий інвайт відправлено"
          text={`Інвайт у гру ${selectedGame} успішно відправлено користувачу ${nickname}.`}
          onClose={() => setInviteSuccessOpen(false)}
        />
      )}

      {reviewModalOpen && (
        <ReviewModal
          selectedRating={selectedRating}
          setSelectedRating={setSelectedRating}
          comment={comment}
          setComment={setComment}
          onClose={() => setReviewModalOpen(false)}
          onSend={sendReview}
        />
      )}
    </main>
  );
}

function getReviewText(review) {
  const value = review?.commentText ?? review?.comment ?? "";

  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return String(
      value.commentText ||
        value.text ||
        value.value ||
        value.content ||
        value.message ||
        "",
    );
  }

  return String(value);
}

function getDisabledInviteGameIds(outgoingItems, incomingItems, userId) {
  const outgoingIds = Array.isArray(outgoingItems)
    ? outgoingItems
        .filter((invite) => {
          const receiverId =
            invite.receiverId ||
            invite.receiverUserId ||
            invite.receiver?.userId;

          const status = invite.status || invite.inviteStatus;

          return (
            receiverId === userId &&
            (!status || status === "Pending" || status === "Очікує")
          );
        })
        .map((invite) => invite.gameId || invite.game?.gameId)
        .filter(Boolean)
    : [];

  const incomingIds = Array.isArray(incomingItems)
    ? incomingItems
        .filter((invite) => {
          const senderId =
            invite.senderId || invite.senderUserId || invite.sender?.userId;

          const status = invite.status || invite.inviteStatus;

          return (
            senderId === userId &&
            (!status || status === "Pending" || status === "Очікує")
          );
        })
        .map((invite) => invite.gameId || invite.game?.gameId)
        .filter(Boolean)
    : [];

  return [...new Set([...outgoingIds, ...incomingIds])];
}

function findInviteForReview(acceptedItems, userRatings, userId) {
  if (!Array.isArray(acceptedItems)) return null;

  return acceptedItems.find((invite) => {
    const receiverId =
      invite.receiverId || invite.receiverUserId || invite.receiver?.userId;

    const senderId =
      invite.senderId || invite.senderUserId || invite.sender?.userId;

    const inviteUserId = receiverId === userId || senderId === userId;

    if (!inviteUserId) return false;

    const inviteId = invite.inviteId || invite.id;

    const alreadyRated = Array.isArray(userRatings)
      ? userRatings.some((rating) => rating.inviteId === inviteId)
      : false;

    return inviteId && !alreadyRated;
  });
}

function findFriendItem(items, userId) {
  if (!Array.isArray(items)) return null;

  return items.find((item) => item.userId === userId);
}

function findIncomingRequest(items, userId) {
  if (!Array.isArray(items)) return null;

  return items.find((item) => item.senderId === userId);
}

function findOutgoingRequest(items, userId) {
  if (!Array.isArray(items)) return null;

  return items.find((item) => item.receiverId === userId);
}
