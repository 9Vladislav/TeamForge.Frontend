import { icons } from "../../assets/icons";

export function GameRow({ title, description, level, imageUrl }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-[#30363D] bg-[#161B22] px-4 py-5">
      <div className="flex min-w-0 items-center gap-4">
        <GameImage imageUrl={imageUrl} />

        <div className="min-w-0">
          <h3 className="truncate text-[16px] font-bold">{title}</h3>

          <p className="mt-2 line-clamp-2 text-[14px] leading-5 text-[#9CA3AF]">
            {description || "Опис до гри відсутній"}
          </p>
        </div>
      </div>

      <span className="ml-4 shrink-0 rounded bg-[#B91C1C] px-3 py-2 text-[13px] font-bold">
        {level}
      </span>
    </div>
  );
}

function GameImage({ imageUrl }) {
  return (
    <div className="flex h-25.5 w-17 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#0D1117]">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full rounded-md object-cover"
        />
      ) : (
        <img src={icons.gamepad} alt="" className="h-8 w-8 icon-red" />
      )}
    </div>
  );
}

export function ActivityRow({ day, time }) {
  return (
    <div className="flex justify-between text-[#D1D5DB]">
      <span>{day}</span>
      <span className="text-[#9CA3AF]">{time}</span>
    </div>
  );
}

export function ReviewCard({ author, date, text, rating }) {
  return (
    <article className="rounded-md border border-[#30363D] bg-[#161B22] p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold">{author}</h3>
          <p className="mt-1 text-[13px] text-[#9CA3AF]">{formatDate(date)}</p>
        </div>

        <div className="flex items-center gap-1">
          <img
            src={icons.starFilled}
            alt=""
            className="relative -top-px h-4 w-4 icon-star"
          />
          <span className="text-[14px] text-[#D1D5DB]">{rating}</span>
        </div>
      </div>

      <p className="mt-3 text-[14px] text-[#D1D5DB]">{text}</p>
    </article>
  );
}

function formatDate(date) {
  if (!date) return "";
  return String(date).slice(0, 10);
}