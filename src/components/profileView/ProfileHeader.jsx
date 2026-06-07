import { icons } from "../../assets/icons";
import { ProfileAction } from "./ProfileAction";

export function ProfileHeader({
  nickname,
  description,
  averageRating,
  reviewsCount,
  isPublic,
  friendStatus,
  friendActionLoading,
  allInvitesAlreadyExist,
  onOpenChat,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onRemoveFriend,
  onOpenInviteModal,
}) {
  return (
    <section className="mb-6 rounded-lg border border-[#30363D] bg-[#1C2128] p-8">
      <div className="flex items-start justify-between gap-8">
        <div className="flex gap-7">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#B91C1C] text-[36px] font-medium">
            {nickname[0]?.toUpperCase()}
          </div>

          <div>
            <h1 className="text-[30px] font-bold">{nickname}</h1>

            <p className="mt-3 max-w-225 text-[15px] leading-[1.6] text-[#9CA3AF]">
              {description || "Опис профілю відсутній."}
            </p>

            <div className="mt-5 flex items-center gap-6 text-[15px]">
              <div className="flex items-center gap-1">
                <img
                  src={icons.starFilled}
                  alt=""
                  className="relative -top-px h-4 w-4 icon-star"
                />
                <span>{averageRating}</span>
                <span className="text-[#9CA3AF]">({reviewsCount} відгуки)</span>
              </div>

              <div
                className={`flex items-center gap-2 ${
                  isPublic ? "text-[#16A34A]" : "text-[#9CA3AF]"
                }`}
              >
                <img
                  src={isPublic ? icons.eye : icons.eyeOff}
                  alt=""
                  className={`h-4 w-4 ${isPublic ? "icon-green" : "icon-muted"}`}
                />
                {isPublic ? "Публічний профіль" : "Прихований профіль"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <ProfileAction
            icon={icons.messageSquare}
            text="Написати"
            onClick={onOpenChat}
          />

          {friendStatus === "friends" ? (
            <ProfileAction
              icon={icons.userMinus}
              text="Видалити з друзів"
              onClick={onRemoveFriend}
              disabled={friendActionLoading}
            />
          ) : friendStatus === "incoming" ? (
            <ProfileAction
              icon={icons.check}
              text="Прийняти запит"
              onClick={onAcceptFriendRequest}
              disabled={friendActionLoading}
            />
          ) : friendStatus === "pending" ? (
            <ProfileAction icon={icons.check} text="Запит відправлено" disabled />
          ) : (
            <ProfileAction
              icon={icons.userPlus}
              text="Додати в друзі"
              onClick={onSendFriendRequest}
              disabled={friendActionLoading}
            />
          )}

          <ProfileAction
            icon={icons.mail}
            text={allInvitesAlreadyExist ? "Всі інвайти вже надіслані" : "Надіслати інвайт"}
            red
            disabled={allInvitesAlreadyExist}
            onClick={onOpenInviteModal}
          />
        </div>
      </div>
    </section>
  );
}