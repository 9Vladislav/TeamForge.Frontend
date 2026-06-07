import { icons } from "../../assets/icons";

export function ReviewModal({
  selectedRating,
  setSelectedRating,
  comment,
  setComment,
  onClose,
  onSend,
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onMouseDown={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
    >
      <div
        onMouseDown={(event) => event.stopPropagation()}
        className="w-125 rounded-lg border border-[#30363D] bg-[#1C2128] p-7"
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-[22px] font-bold">Залишити відгук</h2>

          <button type="button" onClick={onClose}>
            <img src={icons.x} alt="" className="h-5 w-5 icon-muted" />
          </button>
        </div>

        <p className="mb-4 text-[15px] font-bold">Оцінка (1-10)</p>

        <div className="mb-7 flex gap-2">
          {Array.from({ length: 10 }, (_, index) => index + 1).map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => setSelectedRating(rating)}
              className={`flex h-10 w-10 items-center justify-center rounded-md border text-[15px] font-bold transition ${
                selectedRating === rating
                  ? "border-[#DC2626] bg-[#DC2626] text-[#F3F4F6]"
                  : "border-[#30363D] bg-[#161B22] text-[#D1D5DB] hover:border-[#4B5563] hover:bg-[#232A34]"
              }`}
            >
              {rating}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="mb-3 block text-[15px] font-bold">
            Коментар (опціонально)
          </span>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Розкажіть про свій досвід гри з цим тіммейтом..."
            className="no-scrollbar min-h-32 w-full resize-none rounded-md border border-[#30363D] bg-[#161B22] px-4 py-3 text-[15px] text-[#F3F4F6] outline-none transition placeholder:text-[#9CA3AF] hover:border-[#4B5563] focus:border-[#B91C1C]"
          />
        </label>

        <div className="mt-7 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-md border border-[#30363D] bg-[#161B22] text-[15px] font-bold transition hover:border-[#4B5563] hover:bg-[#232A34]"
          >
            Скасувати
          </button>

          <button
            type="button"
            onClick={onSend}
            disabled={selectedRating === null}
            className="h-12 rounded-md bg-[#B91C1C] text-[15px] font-bold transition hover:bg-[#9F1818] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Надіслати
          </button>
        </div>
      </div>
    </div>
  );
}
