import { icons } from "../../assets/icons";

export function SectionTitle({ text }) {
  return <h2 className="mb-4 text-[20px] font-bold">{text}</h2>;
}

export function IncomingInviteCard({ invite, onAccept, onDecline }) {
  return (
    <article className="rounded-lg border border-[#30363D] bg-[#1C2128] p-6">
      <InviteInfo title={invite.game} label={`Від: ${invite.from}`} date={invite.date} />

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
    </article>
  );
}

export function OutgoingInviteCard({ invite, onCancel }) {
  return (
    <article className="relative rounded-lg border border-[#30363D] bg-[#1C2128] p-6">
      <span className="absolute right-6 top-6 rounded-md bg-[#cd7e1e] px-3 py-1 text-[12px] font-bold text-[#F3F4F6]">
        {invite.status}
      </span>

      <InviteInfo title={invite.game} label={`Кому: ${invite.to}`} date={invite.date} />

      <button
        type="button"
        onClick={onCancel}
        className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#B91C1C] text-[14px] font-bold transition hover:bg-[#9F1818]"
      >
        <img src={icons.x} alt="" className="h-4 w-4 icon-white" />
        Скасувати інвайт
      </button>
    </article>
  );
}

export function HistoryInviteCard({ invite, onReview }) {
  const isAccepted = invite.status === "Прийнято";

  return (
    <article className="flex items-center justify-between rounded-lg border border-[#30363D] bg-[#1C2128] px-5 py-4">
      <div className="flex items-center gap-8">
        <div>
          <h3 className="text-[16px] font-bold">{invite.game}</h3>
          <p className="mt-1 text-[13px] text-[#9CA3AF]">
            Від: {invite.user} • {invite.date}
          </p>
        </div>

        <span
          className={`rounded-md px-3 py-1 text-[13px] font-bold ${
            isAccepted
              ? "bg-[#16A34A] text-[#F3F4F6]"
              : "bg-[#B91C1C] text-[#F3F4F6]"
          }`}
        >
          {invite.status}
        </span>
      </div>

      {invite.canRate && (
        <button
          type="button"
          onClick={onReview}
          className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#B91C1C] px-5 text-[14px] font-bold transition hover:bg-[#9F1818]"
        >
          <img src={icons.star} alt="" className="h-4 w-4 icon-white" />
          Залишити відгук
        </button>
      )}

      {invite.rated && (
        <span className="text-[14px] text-[#9CA3AF]">Оцінено</span>
      )}
    </article>
  );
}

export function EmptyMessage({ text }) {
  return (
    <div className="inline-flex w-fit rounded-lg border border-[#30363D] bg-[#1C2128] px-5 py-4 text-[14px] text-[#9CA3AF]">
      {text}
    </div>
  );
}

function InviteInfo({ title, label, date }) {
  return (
    <div>
      <h3 className="text-[18px] font-bold">{title}</h3>
      <p className="mt-3 text-[13px] text-[#9CA3AF]">{label}</p>
      <p className="mt-1 text-[13px] text-[#9CA3AF]">Дата: {date}</p>
    </div>
  );
}