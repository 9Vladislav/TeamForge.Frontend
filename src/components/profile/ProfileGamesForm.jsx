import { useEffect, useRef, useState } from "react";
import { icons } from "../../assets/icons";
import { profiles } from "../../api/profiles";

const skillOptions = ["Beginner", "Intermediate", "Advanced", "Expert"];

export function ProfileGamesForm({
  games,
  setGames,
  deletedGameIds,
  setDeletedGameIds,
  gameOptions,
  onReload,
  onMessage,
}) {
  const showMessage = (type, text) => {
    onMessage?.(type, text);
  };

  const addGame = () => {
    const firstGame = gameOptions[0];

    if (!firstGame) {
      showMessage("error", "Список ігор порожній");
      return;
    }

    setGames((prev) => [
      ...prev,
      {
        userGameId: `new-${Date.now()}`,
        gameId: firstGame.gameId,
        gameName: firstGame.name,
        imageUrl: firstGame.imageUrl,
        skillLevel: "Beginner",
        playstyleDescription: "",
        isNew: true,
      },
    ]);
  };

  const removeGame = (game) => {
    setGames((prev) =>
      prev.filter((item) => item.userGameId !== game.userGameId),
    );

    if (!game.isNew) {
      setDeletedGameIds((prev) => [...prev, game.userGameId]);
    }
  };

  const updateGame = (userGameId, field, value) => {
    setGames((prev) =>
      prev.map((game) => {
        if (game.userGameId !== userGameId) {
          return game;
        }

        if (field === "gameId") {
          const selectedGame = gameOptions.find(
            (option) => Number(option.gameId) === Number(value),
          );

          return {
            ...game,
            gameId: Number(value),
            gameName: selectedGame?.name || game.gameName,
            imageUrl: selectedGame?.imageUrl || game.imageUrl,
          };
        }

        return {
          ...game,
          [field]: value,
        };
      }),
    );
  };

  const saveGames = async () => {
    try {
      for (const gameId of deletedGameIds) {
        await profiles.deleteGame(gameId);
      }

      for (const game of games) {
        if (!game.gameId) continue;

        const data = {
          skillLevel: game.skillLevel || "Beginner",
          playstyleDescription: game.playstyleDescription || "",
        };

        if (game.isNew) {
          await profiles.addGame({
            gameId: Number(game.gameId),
            ...data,
          });
        } else {
          await profiles.updateGame(game.userGameId, data);
        }
      }

      setDeletedGameIds([]);
      showMessage("success", "Ігри збережено");
      await onReload();
    } catch (error) {
      showMessage("error", error.message || "Не вдалося зберегти ігри");
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[20px] font-bold">Мої ігри</h2>
        <AddButton text="Додати гру" onClick={addGame} />
      </div>

      <div className="mb-2 grid grid-cols-[1.5fr_1fr_1.8fr_70px] gap-4">
        <FieldTitle text="Гра" />
        <FieldTitle text="Рівень" />
        <FieldTitle text="Опис до гри" />
        <div />
      </div>

      {games.map((game) => (
        <GameRow
          key={game.userGameId}
          game={game}
          gameOptions={gameOptions}
          onChange={updateGame}
          onRemove={removeGame}
        />
      ))}

      {games.length === 0 && <EmptyMessage text="Ігри ще не додані" />}

      <SaveButton text="Зберегти ігри" onClick={saveGames} />
    </>
  );
}

function GameRow({ game, gameOptions, onChange, onRemove }) {
  return (
    <div className="mb-4 grid grid-cols-[1.5fr_1fr_1.8fr_70px] gap-4 last:mb-0">
      <GameSelect
        game={game}
        value={game.gameId || ""}
        onChange={(value) => onChange(game.userGameId, "gameId", value)}
        options={gameOptions.map((option) => ({
          value: option.gameId,
          label: option.name,
          imageUrl: option.imageUrl,
        }))}
      />

      <ProfileSelect
        fullHeight
        value={game.skillLevel || "Beginner"}
        onChange={(value) => onChange(game.userGameId, "skillLevel", value)}
        options={skillOptions.map((option) => ({
          value: option,
          label: option,
        }))}
      />

      <textarea
        value={game.playstyleDescription || ""}
        onChange={(event) =>
          onChange(game.userGameId, "playstyleDescription", event.target.value)
        }
        rows={3}
        className="no-scrollbar min-h-23 resize-none rounded-md border border-[#30363D] bg-[#161B22] px-4 py-3 text-[15px] outline-none transition hover:border-[#4B5563] focus:border-[#B91C1C]"
      />

      <DeleteButton onClick={() => onRemove(game)} />
    </div>
  );
}

function GameSelect({ game, value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const selectRef = useRef(null);

  const selectedOption =
    options.find((option) => String(option.value) === String(value)) ||
    options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = () => {
    if (selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      setDropUp(spaceBelow < 280 && spaceAbove > spaceBelow);
    }

    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        onClick={toggleOpen}
        className={`flex min-h-23 w-full items-center gap-4 overflow-hidden rounded-md border bg-[#161B22] text-left text-[15px] text-[#F3F4F6] outline-none transition hover:border-[#4B5563] ${
          isOpen ? "border-[#B91C1C]" : "border-[#30363D]"
        }`}
      >
        <GameImage game={game} />

        <span className="min-w-0 flex-1 truncate">
          {selectedOption?.label || "Не обрано"}
        </span>

        <img
          src={isOpen ? icons.chevronUp : icons.chevronDown}
          alt=""
          className="mr-4 h-5 w-5 shrink-0 icon-white"
        />
      </button>

      {isOpen && (
        <Dropdown
          options={options}
          value={value}
          dropUp={dropUp}
          onSelect={(optionValue) => {
            onChange(optionValue);
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ProfileSelect({ value, onChange, options, fullHeight = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const selectRef = useRef(null);

  const selectedOption =
    options.find((option) => String(option.value) === String(value)) ||
    options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = () => {
    if (selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      setDropUp(spaceBelow < 280 && spaceAbove > spaceBelow);
    }

    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative h-full" ref={selectRef}>
      <button
        type="button"
        onClick={toggleOpen}
        className={`flex w-full items-center justify-between rounded-md border bg-[#161B22] px-4 text-left text-[15px] text-[#F3F4F6] outline-none transition hover:bg-[#232A34] ${
          fullHeight ? "h-26" : "h-12"
        } ${
          isOpen
            ? "border-[#B91C1C]"
            : "border-[#30363D] hover:border-[#4B5563]"
        }`}
      >
        <span className="truncate">{selectedOption?.label || "Не обрано"}</span>

        <img
          src={isOpen ? icons.chevronUp : icons.chevronDown}
          alt=""
          className="h-5 w-5 shrink-0 icon-white"
        />
      </button>

      {isOpen && (
        <Dropdown
          options={options}
          value={value}
          dropUp={dropUp}
          onSelect={(optionValue) => {
            onChange(optionValue);
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
}

function Dropdown({ options, value, dropUp, onSelect }) {
  return (
    <div
      className={`custom-scroll custom-select-dropdown absolute left-0 right-0 z-50 max-h-64 rounded-md border border-[#30363D] bg-[#161B22] p-1 shadow-xl ${
        dropUp ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"
      }`}
    >
      {options.map((option) => {
        const isSelected = String(option.value) === String(value);

        return (
          <button
            type="button"
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`flex min-h-10 w-full items-center rounded px-3 text-left text-[15px] transition ${
              isSelected
                ? "bg-[#B91C1C] text-[#F3F4F6]"
                : "text-[#D1D5DB] hover:bg-[#232A34] hover:text-[#F3F4F6]"
            }`}
          >
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
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

function FieldTitle({ text }) {
  return <p className="block text-[14px] font-bold text-[#F3F4F6]">{text}</p>;
}

function AddButton({ text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-md bg-[#B91C1C] px-5 py-3 text-[14px] font-bold transition hover:bg-[#9F1818]"
    >
      <span className="relative -top-px text-[22px] leading-none">+</span>
      <span>{text}</span>
    </button>
  );
}

function DeleteButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-23 w-14 items-center justify-center rounded-md bg-[#B91C1C] transition hover:bg-[#9F1818]"
    >
      <img src={icons.trash} alt="" className="h-5 w-5 icon-white" />
    </button>
  );
}

function SaveButton({ text, onClick }) {
  return (
    <div className="mt-6 flex justify-end">
      <button
        type="button"
        onClick={onClick}
        className="rounded-md bg-[#B91C1C] px-6 py-3 text-[15px] font-bold transition hover:bg-[#9F1818]"
      >
        {text}
      </button>
    </div>
  );
}

function EmptyMessage({ text }) {
  return (
    <div className="inline-flex w-fit rounded-lg border border-[#30363D] bg-[#161B22] px-5 py-4 text-[14px] text-[#9CA3AF]">
      {text}
    </div>
  );
}