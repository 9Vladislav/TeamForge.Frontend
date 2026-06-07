import { useEffect, useRef, useState } from "react";
import { icons } from "../../assets/icons";
import { profiles } from "../../api/profiles";

const days = [
  { value: 1, label: "Понеділок" },
  { value: 2, label: "Вівторок" },
  { value: 3, label: "Середа" },
  { value: 4, label: "Четвер" },
  { value: 5, label: "П’ятниця" },
  { value: 6, label: "Субота" },
  { value: 7, label: "Неділя" },
];

export function ActivityPeriodsForm({
  periods,
  setPeriods,
  deletedPeriodIds,
  setDeletedPeriodIds,
  onReload,
  onMessage,
}) {
  const showMessage = (type, text) => {
    onMessage?.(type, text);
  };

  const addPeriod = () => {
    setPeriods((prev) => [
      ...prev,
      {
        activityPeriodId: `new-${Date.now()}`,
        dayOfWeek: 1,
        timeFrom: "",
        timeTo: "",
        isNew: true,
      },
    ]);
  };

  const removePeriod = (period) => {
    setPeriods((prev) =>
      prev.filter((item) => item.activityPeriodId !== period.activityPeriodId),
    );

    if (!period.isNew) {
      setDeletedPeriodIds((prev) => [...prev, period.activityPeriodId]);
    }
  };

  const updatePeriod = (activityPeriodId, field, value) => {
    setPeriods((prev) =>
      prev.map((period) =>
        period.activityPeriodId === activityPeriodId
          ? { ...period, [field]: value }
          : period,
      ),
    );
  };

  const savePeriods = async () => {
    try {
      for (const periodId of deletedPeriodIds) {
        await profiles.deleteActivityPeriod(periodId);
      }

      for (const period of periods) {
        if (!period.timeFrom || !period.timeTo) continue;

        const data = {
          dayOfWeek: Number(period.dayOfWeek),
          timeFrom: normalizeTimeForApi(period.timeFrom),
          timeTo: normalizeTimeForApi(period.timeTo),
        };

        if (period.isNew) {
          await profiles.addActivityPeriod(data);
        } else {
          await profiles.updateActivityPeriod(period.activityPeriodId, data);
        }
      }

      setDeletedPeriodIds([]);
      showMessage("success", "Періоди активності збережено");
      await onReload();
    } catch (error) {
      showMessage(
        "error",
        error.message || "Не вдалося зберегти періоди активності",
      );
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[20px] font-bold">Періоди активності</h2>
        <AddButton text="Додати період" onClick={addPeriod} />
      </div>

      <div className="mb-2 grid grid-cols-[1fr_1fr_1fr_70px] gap-4">
        <FieldTitle text="День тижня" />
        <FieldTitle text="Початок" />
        <FieldTitle text="Кінець" />
        <div />
      </div>

      {periods.map((period) => (
        <ActivityRow
          key={period.activityPeriodId}
          period={period}
          onChange={updatePeriod}
          onRemove={removePeriod}
        />
      ))}

      {periods.length === 0 && (
        <EmptyMessage text="Періоди активності ще не додані" />
      )}

      <SaveButton text="Зберегти періоди активності" onClick={savePeriods} />
    </>
  );
}

function ActivityRow({ period, onChange, onRemove }) {
  return (
    <div className="mb-4 grid grid-cols-[1fr_1fr_1fr_70px] gap-4 last:mb-0">
      <ProfileSelect
        value={period.dayOfWeek}
        onChange={(value) =>
          onChange(period.activityPeriodId, "dayOfWeek", Number(value))
        }
        options={days}
      />

      <TimeField
        value={period.timeFrom || ""}
        onChange={(value) =>
          onChange(period.activityPeriodId, "timeFrom", value)
        }
      />

      <TimeField
        value={period.timeTo || ""}
        onChange={(value) => onChange(period.activityPeriodId, "timeTo", value)}
      />

      <DeleteButton onClick={() => onRemove(period)} />
    </div>
  );
}

function ProfileSelect({ value, onChange, options }) {
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
        className={`flex h-12 w-full items-center justify-between rounded-md border bg-[#161B22] px-4 text-left text-[15px] text-[#F3F4F6] outline-none transition hover:bg-[#232A34] ${
          isOpen ? "border-[#B91C1C]" : "border-[#30363D] hover:border-[#4B5563]"
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

function TimeField({ value, onChange }) {
  return (
    <div className="flex h-12 items-center rounded-md border border-[#30363D] bg-[#161B22] px-4 transition hover:border-[#4B5563] focus-within:border-[#B91C1C]">
      <input
        value={value}
        onChange={(event) => onChange(formatTimeValue(event.target.value))}
        onBlur={(event) => onChange(normalizeTimeForInput(event.target.value))}
        placeholder="--:--"
        maxLength={5}
        inputMode="numeric"
        className="w-full bg-transparent text-[15px] text-[#F3F4F6] outline-none placeholder:text-[#9CA3AF]"
      />

      <img
        src={icons.clock}
        alt=""
        className="pointer-events-none h-5 w-5 icon-muted"
      />
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
      className="flex h-12 w-14 items-center justify-center rounded-md bg-[#B91C1C] transition hover:bg-[#9F1818]"
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

function normalizeTimeForInput(value) {
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

function normalizeTimeForApi(value) {
  return normalizeTimeForInput(value);
}