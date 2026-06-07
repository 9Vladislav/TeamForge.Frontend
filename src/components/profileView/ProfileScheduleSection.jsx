import { ActivityRow } from "./ProfileRows";

export function ProfileScheduleSection({ activityPeriods = [] }) {
  const sortedPeriods = [...activityPeriods].sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) {
      return a.dayOfWeek - b.dayOfWeek;
    }

    return a.timeFrom.localeCompare(b.timeFrom);
  });

  return (
    <section className="rounded-lg border border-[#30363D] bg-[#1C2128] p-6">
      <h2 className="mb-5 text-[20px] font-bold">Розклад активності</h2>

      <div className="custom-scroll max-h-76 space-y-3 text-[14px]">
        {sortedPeriods.length > 0 ? (
          sortedPeriods.map((period) => (
            <ActivityRow
              key={period.activityPeriodId}
              day={getDayName(period.dayOfWeek)}
              time={`${period.timeFrom} - ${period.timeTo}`}
            />
          ))
        ) : (
          <p className="text-[14px] text-[#9CA3AF]">Активність не вказана</p>
        )}
      </div>
    </section>
  );
}

function getDayName(day) {
  const days = {
    0: "Щодня",
    1: "Понеділок",
    2: "Вівторок",
    3: "Середа",
    4: "Четвер",
    5: "П’ятниця",
    6: "Субота",
    7: "Неділя",
  };

  return days[day] || "День";
}