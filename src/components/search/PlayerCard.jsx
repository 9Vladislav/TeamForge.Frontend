import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { icons } from "../../assets/icons";
import { invites } from "../../api/invites";
import { GameInviteModal, InfoModal } from "../profileView/ProfileModals";

const VISIBLE_PERIODS_COUNT = 3;

export function PlayerCard({ player, filters }) {
  const navigate = useNavigate();

  const gamesRef = useRef(null);
  const periodsRef = useRef(null);

  const [isGamesOpen, setIsGamesOpen] = useState(false);
  const [isPeriodsOpen, setIsPeriodsOpen] = useState(false);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteSuccessOpen, setInviteSuccessOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState("");
  const [outgoingInvites, setOutgoingInvites] = useState([]);
  const [incomingInvites, setIncomingInvites] = useState([]);

  const playerName = player.nickname || "Користувач";
  const rating = Number(player.averageRating || 0).toFixed(1);

  const games = sortGamesByFilter(player.games || [], filters?.gameId);
  const mainGame = games[0];
  const otherGames = games.slice(1);
  const hasOtherGames = otherGames.length > 0;

  const periods = filterAndSortPeriods(player.activityPeriods || [], filters);
  const visiblePeriods = periods.slice(0, VISIBLE_PERIODS_COUNT);
  const hiddenPeriodsCount = periods.length - visiblePeriods.length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (gamesRef.current && !gamesRef.current.contains(event.target)) {
        setIsGamesOpen(false);
      }

      if (periodsRef.current && !periodsRef.current.contains(event.target)) {
        setIsPeriodsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const openProfile = () => {
    navigate(`/profile/${player.userId}`);
  };

  const openChat = () => {
    navigate(
      `/chat?userId=${player.userId}&nickname=${encodeURIComponent(playerName)}`,
    );
  };

  const openInviteModal = async () => {
    try {
      const [incomingData, outgoingData] = await Promise.all([
        invites.getIncoming(),
        invites.getOutgoing(),
      ]);

      const incoming = Array.isArray(incomingData) ? incomingData : [];
      const outgoing = Array.isArray(outgoingData) ? outgoingData : [];

      setIncomingInvites(incoming);
      setOutgoingInvites(outgoing);

      const disabledIds = getDisabledInviteGameIds(
        outgoing,
        incoming,
        Number(player.userId),
      );

      const firstAvailableGame = games.find(
        (game) => !disabledIds.includes(game.gameId),
      );

      setSelectedGame(firstAvailableGame?.gameName || games[0]?.gameName || "");
      setInviteModalOpen(true);
    } catch (error) {
      alert(error.message || "Не вдалося завантажити інвайти");
    }
  };

  const sendGameInvite = async () => {
    const game = games.find((game) => game.gameName === selectedGame);

    if (!game) {
      alert("Оберіть гру для інвайту");
      return;
    }

    try {
      await invites.create({
        receiverId: Number(player.userId),
        gameId: game.gameId,
      });

      setOutgoingInvites((prev) => [
        ...prev,
        {
          receiverId: Number(player.userId),
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

  const disabledInviteGameIds = getDisabledInviteGameIds(
    outgoingInvites,
    incomingInvites,
    Number(player.userId),
  );

  return (
    <article className="relative flex h-90 flex-col rounded-lg border border-[#30363D] bg-[#1C2128] p-6">
      <button
        type="button"
        onClick={openProfile}
        className="mb-5 flex items-center gap-5 text-left"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#B91C1C] text-[18px] font-medium">
          {playerName[0]?.toUpperCase()}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-[18px] font-bold transition hover:text-[#DC2626]">
            {playerName}
          </h3>

          <div className="mt-1 flex items-center gap-1">
            <img
              src={icons.starFilled}
              alt=""
              className="relative -top-px h-4 w-4 icon-star"
            />
            <span className="text-[14px] text-[#D1D5DB]">{rating}</span>
          </div>
        </div>
      </button>

      <div
        ref={gamesRef}
        className="relative mb-4 rounded-md border border-[#30363D] bg-[#161B22] p-4"
      >
        <button
          type="button"
          disabled={!hasOtherGames}
          onClick={() => hasOtherGames && setIsGamesOpen(!isGamesOpen)}
          className={`w-full text-left ${
            hasOtherGames ? "cursor-pointer" : "cursor-default"
          }`}
        >
          <div className="flex gap-4">
            <GameImage game={mainGame} />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="mb-1 truncate text-[14px] font-bold">
                    {mainGame?.gameName || "Гра не вказана"}
                  </p>

                  <span className="rounded bg-[#7F1D1D] px-2 py-1 text-[12px] font-bold text-[#F3F4F6]">
                    {mainGame?.skillLevel || "Не вказано"}
                  </span>
                </div>

                {hasOtherGames && (
                  <img
                    src={isGamesOpen ? icons.chevronUp : icons.chevronDown}
                    alt=""
                    className="mt-1 h-5 w-5 shrink-0 icon-muted"
                  />
                )}
              </div>

              <p className="mt-2 line-clamp-2 min-h-10 text-[13px] leading-5 text-[#9CA3AF]">
                {mainGame?.playstyleDescription ||
                  player.description ||
                  "Опис відсутній"}
              </p>
            </div>
          </div>
        </button>

        {isGamesOpen && hasOtherGames && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-md border border-[#30363D] bg-[#161B22] p-4 shadow-xl">
            {otherGames.map((game, index) => (
              <div key={game.userGameId}>
                {index > 0 && <div className="my-4 h-px w-full bg-[#30363D]" />}
                <GameDropdownItem game={game} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        ref={periodsRef}
        className="relative mb-3 flex min-h-8 items-start gap-2 text-[14px] text-[#9CA3AF]"
      >
        <img
          src={icons.clock}
          alt=""
          className="mt-1 h-4 w-4 shrink-0 icon-muted"
        />

        <div className="min-w-0 flex-1">
          {periods.length === 0 ? (
            <span className="block py-1">Час не вказано</span>
          ) : (
            <div className="flex flex-nowrap items-center gap-2 overflow-hidden">
              {visiblePeriods.map((period) => (
                <PeriodBadge key={period.activityPeriodId} period={period} />
              ))}

              {hiddenPeriodsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setIsPeriodsOpen(!isPeriodsOpen)}
                  className="shrink-0 rounded border border-[#30363D] bg-[#161B22] px-2 py-1 text-[12px] text-[#DC2626] transition hover:border-[#4B5563] hover:bg-[#232A34]"
                >
                  {isPeriodsOpen ? "Згорнути" : `+${hiddenPeriodsCount} ще`}
                </button>
              )}
            </div>
          )}

          {isPeriodsOpen && hiddenPeriodsCount > 0 && (
            <div className="absolute left-0 right-0 top-9 z-30 rounded-md border border-[#30363D] bg-[#161B22] p-3 shadow-xl">
              <div className="flex flex-wrap gap-2">
                {periods.slice(VISIBLE_PERIODS_COUNT).map((period) => (
                  <PeriodBadge key={period.activityPeriodId} period={period} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2">
        <ActionButton icon={icons.user} onClick={openProfile} />
        <ActionButton icon={icons.messageSquare} onClick={openChat} />
        <ActionButton icon={icons.mail} red onClick={openInviteModal} />
      </div>

      {inviteModalOpen && (
        <GameInviteModal
          selectedGame={selectedGame}
          setSelectedGame={setSelectedGame}
          games={games}
          disabledGameIds={disabledInviteGameIds}
          onClose={() => setInviteModalOpen(false)}
          onSend={sendGameInvite}
        />
      )}

      {inviteSuccessOpen && (
        <InfoModal
          title="Ігровий інвайт відправлено"
          text={`Інвайт у гру ${selectedGame} успішно відправлено користувачу ${playerName}.`}
          onClose={() => setInviteSuccessOpen(false)}
        />
      )}
    </article>
  );
}

function sortGamesByFilter(games, selectedGameId) {
  if (!selectedGameId) {
    return games;
  }

  return [...games].sort((a, b) => {
    if (a.gameId === selectedGameId) return -1;
    if (b.gameId === selectedGameId) return 1;
    return 0;
  });
}

function filterAndSortPeriods(periods, filters) {
  const day = Number(filters?.dayOfWeek || 0);

  const timeFrom = normalizeTimeForFilter(filters?.timeFrom);
  const timeTo = normalizeTimeForFilter(filters?.timeTo);

  const hasTimeFilter = Boolean(timeFrom || timeTo);

  const filterFrom = timeFrom || "00:00";
  const filterTo = timeTo || "23:59";

  return periods
    .filter((period) => {
      const byDay = !day || period.dayOfWeek === day;

      if (!hasTimeFilter) {
        return byDay;
      }

      const periodFrom = normalizeTimeForFilter(period.timeFrom);
      const periodTo = normalizeTimeForFilter(period.timeTo);

      return byDay && periodFrom >= filterFrom && periodTo <= filterTo;
    })
    .sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) {
        return a.dayOfWeek - b.dayOfWeek;
      }

      return normalizeTimeForFilter(a.timeFrom).localeCompare(
        normalizeTimeForFilter(b.timeFrom),
      );
    });
}

function normalizeTimeForFilter(value) {
  if (!value) return "";

  const digits = String(value).replace(/\D/g, "").slice(0, 4);

  if (!digits) return "";

  if (digits.length <= 2) {
    const hours = Math.min(Number(digits), 23);
    return `${String(hours).padStart(2, "0")}:00`;
  }

  const hours = Math.min(Number(digits.slice(0, 2)), 23);
  const minutes = Math.min(Number(digits.slice(2).padEnd(2, "0")), 59);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function GameDropdownItem({ game }) {
  return (
    <div className="flex gap-4">
      <GameImage game={game} />

      <div className="min-w-0 flex-1">
        <p className="mb-1 truncate text-[14px] font-bold">
          {game?.gameName || "Гра не вказана"}
        </p>

        <span className="rounded bg-[#7F1D1D] px-2 py-1 text-[12px] font-bold text-[#F3F4F6]">
          {game?.skillLevel || "Не вказано"}
        </span>

        <p className="mt-2 line-clamp-2 min-h-10 text-[13px] leading-5 text-[#9CA3AF]">
          {game?.playstyleDescription || "Опис відсутній"}
        </p>
      </div>
    </div>
  );
}

function GameImage({ game }) {
  return (
    <div className="flex h-25.5 w-17 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#0D1117]">
      {game?.imageUrl ? (
        <img
          src={game.imageUrl}
          alt=""
          className="h-full w-full rounded-md object-cover"
        />
      ) : (
        <img src={icons.gamepad} alt="" className="h-8 w-8 icon-red" />
      )}
    </div>
  );
}

function PeriodBadge({ period }) {
  return (
    <span className="shrink-0 rounded border border-[#30363D] bg-[#161B22] px-2 py-1 text-[12px] text-[#D1D5DB]">
      {getDayName(period.dayOfWeek)} {period.timeFrom}-{period.timeTo}
    </span>
  );
}

function ActionButton({ icon, red, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 items-center justify-center rounded-md border border-[#30363D] transition ${
        red
          ? "bg-[#B91C1C] hover:bg-[#9F1818]"
          : "bg-[#161B22] hover:border-[#4B5563] hover:bg-[#232A34]"
      }`}
    >
      <img
        src={icon}
        alt=""
        className={`h-4 w-4 ${red ? "icon-white" : "icon-muted"}`}
      />
    </button>
  );
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

function getDayName(day) {
  const days = {
    0: "Щодня",
    1: "ПН",
    2: "ВТ",
    3: "СР",
    4: "ЧТ",
    5: "ПТ",
    6: "СБ",
    7: "НД",
  };

  return days[day] || "День";
}
