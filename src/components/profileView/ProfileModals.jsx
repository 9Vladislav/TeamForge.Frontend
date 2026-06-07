import { icons } from "../../assets/icons";
import { CustomSelect } from "../ui/CustomSelect";

export function InfoModal({ title, text, onClose }) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-125 rounded-lg border border-[#30363D] bg-[#1C2128] p-7">
        <ModalHeader title={title} onClose={onClose} />

        <p className="text-[15px] leading-[1.6] text-[#D1D5DB]">{text}</p>

        <button
          type="button"
          onClick={onClose}
          className="mt-7 h-12 w-full rounded-md bg-[#B91C1C] text-[15px] font-bold transition hover:bg-[#9F1818]"
        >
          Добре
        </button>
      </div>
    </ModalOverlay>
  );
}

export function GameInviteModal({
  selectedGame,
  setSelectedGame,
  games = [],
  disabledGameIds = [],
  onClose,
  onSend,
}) {
  const selectedGameItem = games.find((game) => game.gameName === selectedGame);

  const allGamesDisabled =
    games.length > 0 &&
    games.every((game) => disabledGameIds.includes(game.gameId));

  const selectedGameDisabled =
    selectedGameItem && disabledGameIds.includes(selectedGameItem.gameId);

  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-125 rounded-lg border border-[#30363D] bg-[#1C2128] p-7">
        <ModalHeader title="Надіслати ігровий інвайт" onClose={onClose} />

        <div>
          <span className="mb-3 block text-[15px] font-bold">Оберіть гру</span>

          <CustomSelect
            value={selectedGame}
            disabled={games.length === 0 || allGamesDisabled}
            onChange={setSelectedGame}
            options={games.map((game) => {
              const disabled = disabledGameIds.includes(game.gameId);

              return {
                value: game.gameName,
                label: `${game.gameName}${disabled ? " — інвайт вже існує" : ""}`,
                disabled,
              };
            })}
          />
        </div>

        {allGamesDisabled && (
          <p className="mt-3 text-[13px] text-[#9CA3AF]">
            У всі доступні ігри вже є активний інвайт.
          </p>
        )}

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
            disabled={
              games.length === 0 || allGamesDisabled || selectedGameDisabled
            }
            className="h-12 rounded-md bg-[#B91C1C] text-[15px] font-bold transition hover:bg-[#9F1818] disabled:cursor-not-allowed disabled:opacity-70"
          >
            Надіслати
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function ModalOverlay({ children, onClose }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onMouseDown={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
    >
      <div onMouseDown={(event) => event.stopPropagation()}>{children}</div>
    </div>
  );
}

function ModalHeader({ title, onClose }) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <h2 className="text-[22px] font-bold">{title}</h2>

      <button type="button" onClick={onClose}>
        <img src={icons.x} alt="" className="h-5 w-5 icon-muted" />
      </button>
    </div>
  );
}