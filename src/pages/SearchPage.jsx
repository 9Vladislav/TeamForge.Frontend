import { useEffect, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { PlayerCard } from "../components/search/PlayerCard";
import { icons } from "../assets/icons";
import { search } from "../api/search";
import { games } from "../api/games";
import { Loader } from "../components/ui/Loader";
import { CustomSelect } from "../components/ui/CustomSelect";

export function SearchPage() {
  const [filters, setFilters] = useState({
    nickname: "",
    gameId: 0,
    skillLevel: "",
    dayOfWeek: 0,
    timeFrom: "",
    timeTo: "",
    minRating: "",
  });

  const [players, setPlayers] = useState([]);
  const [gameOptions, setGameOptions] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      loadPlayers(filters);
    }, 100);

    return () => clearTimeout(timer);
  }, [filters]);

  const loadGames = async () => {
    try {
      const data = await games.getAll();
      setGameOptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error.message);
    }
  };

  const loadPlayers = async (currentFilters) => {
    setError("");

    try {
      const normalizedTimeFrom = normalizeTimeForApi(currentFilters.timeFrom);
      const normalizedTimeTo = normalizeTimeForApi(currentFilters.timeTo);

      const requestData = {};

      if (currentFilters.nickname.trim()) {
        requestData.nickname = currentFilters.nickname.trim();
      }

      if (currentFilters.gameId) {
        requestData.gameId = Number(currentFilters.gameId);
      }

      if (currentFilters.skillLevel) {
        requestData.skillLevel = currentFilters.skillLevel;
      }

      if (currentFilters.dayOfWeek) {
        requestData.dayOfWeek = Number(currentFilters.dayOfWeek);
      }

      if (normalizedTimeFrom || normalizedTimeTo) {
        requestData.timeFrom = normalizedTimeFrom || "00:00";
        requestData.timeTo = normalizedTimeTo || "23:59";
      }

      if (currentFilters.minRating) {
        requestData.minRating = Number(currentFilters.minRating);
      }

      const data = await search.users(requestData);
      setPlayers(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(error.message || "Не вдалося завантажити гравців");
      setPlayers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilter = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: name === "gameId" || name === "dayOfWeek" ? Number(value) : value,
    }));
  };

  const updateRating = (value) => {
    const normalized = value.replace(",", ".");

    if (normalized === "") {
      updateFilter("minRating", "");
      return;
    }

    if (!/^\d{0,2}(\.\d{0,1})?$/.test(normalized)) {
      return;
    }

    const numberValue = Number(normalized);

    if (numberValue >= 1 && numberValue <= 10) {
      updateFilter("minRating", normalized);
    }
  };

  return (
    <main className="flex min-h-screen bg-[#0D1117] text-[#F3F4F6]">
      <Sidebar />

      <section className="flex-1 px-8 py-8">
        <h1 className="mb-2 text-[32px] font-bold">Пошук тіммейтів</h1>
        <p className="mb-8 text-[16px] text-[#9CA3AF]">
          Знайдіть ідеальних партнерів для гри
        </p>

        <div className="mb-8 grid grid-cols-7 gap-4">
          <FilterInput
            label="Нікнейм"
            value={filters.nickname}
            onChange={(value) => updateFilter("nickname", value)}
            placeholder="ProGamer..."
          />

          <CustomSelect
            label="Гра"
            value={filters.gameId}
            onChange={(value) => updateFilter("gameId", value)}
            options={[
              { value: 0, label: "Всі ігри" },
              ...gameOptions.map((game) => ({
                value: game.gameId,
                label: game.name,
              })),
            ]}
          />

          <CustomSelect
            label="Рівень майстерності"
            value={filters.skillLevel}
            onChange={(value) => updateFilter("skillLevel", value)}
            options={[
              { value: "", label: "Всі рівні" },
              { value: "Beginner", label: "Beginner" },
              { value: "Intermediate", label: "Intermediate" },
              { value: "Advanced", label: "Advanced" },
              { value: "Expert", label: "Expert" },
            ]}
          />

          <CustomSelect
            label="День тижня"
            value={filters.dayOfWeek}
            onChange={(value) => updateFilter("dayOfWeek", value)}
            options={[
              { value: 0, label: "Будь-який" },
              { value: 1, label: "Понеділок" },
              { value: 2, label: "Вівторок" },
              { value: 3, label: "Середа" },
              { value: 4, label: "Четвер" },
              { value: 5, label: "П’ятниця" },
              { value: 6, label: "Субота" },
              { value: 7, label: "Неділя" },
            ]}
          />

          <TimeInput
            label="Час від"
            value={filters.timeFrom}
            onChange={(value) => updateFilter("timeFrom", value)}
          />

          <TimeInput
            label="Час до"
            value={filters.timeTo}
            onChange={(value) => updateFilter("timeTo", value)}
          />

          <FilterInput
            label="Мін. рейтинг"
            value={filters.minRating}
            onChange={updateRating}
            placeholder="1-10"
          />
        </div>

        {error && (
          <div className="mb-6 inline-flex w-fit rounded-lg border border-[#B91C1C] bg-[#1C2128] px-5 py-4 text-[14px] text-[#B91C1C]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-3">
              <Loader variant="search" />
            </div>
          ) : (
            <>
              {players.map((player) => (
                <PlayerCard
                  key={player.userId}
                  player={player}
                  filters={filters}
                />
              ))}

              {players.length === 0 && !error && (
                <div className="inline-flex w-fit rounded-lg border border-[#30363D] bg-[#1C2128] px-5 py-4 text-[14px] text-[#9CA3AF]">
                  Гравців не знайдено
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function FilterInput({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-bold text-[#D1D5DB]">
        {label}
      </span>

      <input
        type="text"
        inputMode={label === "Мін. рейтинг" ? "decimal" : "text"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full cursor-text rounded-md border border-[#30363D] bg-[#1C2128] px-4 text-[15px] text-[#F3F4F6] outline-none transition placeholder:text-[#9CA3AF] hover:border-[#4B5563] hover:bg-[#232A34] focus:border-[#B91C1C]"
      />
    </label>
  );
}

function TimeInput({ label, value, onChange }) {
  const [isFocused, setIsFocused] = useState(false);

  const handleBlur = () => {
    setIsFocused(false);

    const normalizedValue = normalizeTimeForApi(value);

    if (normalizedValue !== value) {
      onChange(normalizedValue);
    }
  };

  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-bold text-[#D1D5DB]">
        {label}
      </span>

      <div
        className={`flex h-12 cursor-text items-center rounded-md border bg-[#1C2128] px-4 transition hover:bg-[#232A34] ${
          isFocused
            ? "border-[#B91C1C]"
            : "border-[#30363D] hover:border-[#4B5563]"
        }`}
      >
        <input
          type="text"
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onChange={(event) => onChange(formatTimeValue(event.target.value))}
          placeholder="--:--"
          maxLength={5}
          inputMode="numeric"
          className="w-full bg-transparent text-[15px] text-[#F3F4F6] outline-none placeholder:text-[#9CA3AF]"
        />

        <img src={icons.clock} alt="" className="h-5 w-5 icon-muted" />
      </div>
    </label>
  );
}

function formatTimeValue(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length === 0) return "";
  if (digits.length === 1) return digits;

  let hours = Number(digits.slice(0, 2));
  if (hours > 23) hours = 23;

  if (digits.length === 2) {
    return String(hours).padStart(2, "0");
  }

  let minutes = Number(digits.slice(2));
  if (digits.length === 4 && minutes > 59) minutes = 59;

  const minutesText =
    digits.length === 3 ? digits.slice(2) : String(minutes).padStart(2, "0");

  return `${String(hours).padStart(2, "0")}:${minutesText}`;
}

function normalizeTimeForApi(value) {
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