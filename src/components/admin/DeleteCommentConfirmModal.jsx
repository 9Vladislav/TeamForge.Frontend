import { icons } from "../../assets/icons";

export function DeleteCommentConfirmModal({ onClose, onConfirm }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onMouseDown={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
    >
      <div
        onMouseDown={(event) => event.stopPropagation()}
        className="w-115 rounded-lg border border-[#30363D] bg-[#1C2128] p-7"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[22px] font-bold">Видалити коментар?</h2>

          <button type="button" onClick={onClose}>
            <img src={icons.x} alt="" className="h-5 w-5 icon-muted" />
          </button>
        </div>

        <p className="text-[15px] leading-[1.6] text-[#D1D5DB]">
          Ви точно хочете видалити цей коментар? Оцінка користувача залишиться,
          буде видалено лише текст коментаря.
        </p>

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
            onClick={onConfirm}
            className="h-12 rounded-md bg-[#B91C1C] text-[15px] font-bold transition hover:bg-[#9F1818]"
          >
            Видалити
          </button>
        </div>
      </div>
    </div>
  );
}