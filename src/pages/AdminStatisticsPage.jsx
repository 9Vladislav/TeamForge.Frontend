import { useEffect, useMemo, useState } from "react";
import { AdminSidebar } from "../components/layout/AdminSidebar";
import { Loader } from "../components/ui/Loader";
import { admin } from "../api/admin";
import { icons } from "../assets/icons";

const dayNames = {
  1: "Понеділок",
  2: "Вівторок",
  3: "Середа",
  4: "Четвер",
  5: "П’ятниця",
  6: "Субота",
  7: "Неділя",
};

const pieColors = ["#991B1B", "#B91C1C", "#DC2626", "#EF4444", "#F87171", "#FCA5A5", "#FB7185", "#E11D48", "#BE123C", "#9F1239", "#7F1D1D", "#F43F5E"];

export function AdminStatisticsPage() {
  const [stats, setStats] = useState(null);
  const [hoveredGame, setHoveredGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await admin.getStats();
      setStats(data);
    } catch {
      setError("Не вдалося завантажити статистику");
    } finally {
      setIsLoading(false);
    }
  };

  const popularGames = stats?.popularGames || [];
  const activityStatistics = stats?.activityStatistics || [];

  return (
    <div className="flex min-h-screen bg-[#0D1117] text-[#F3F4F6]">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <h1 className="mb-2 text-[28px] font-bold">Панель адміністратора</h1>
        <p className="mb-8 text-[15px] text-[#9CA3AF]">
          Керування платформою TeamForge
        </p>

        {isLoading ? (
          <Loader text="Завантаження статистики..." />
        ) : error ? (
          <p className="text-[#B91C1C]">{error}</p>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-3 gap-5">
              <StatCard
                icon={icons.users}
                title="Всього користувачів"
                value={stats.usersCount}
                iconClass="icon-white"
                bgColor="bg-[#B91C1C]"
              />
              <StatCard
                icon={icons.eye}
                title="Публічні профілі"
                value={stats.publicProfilesCount}
                iconClass="icon-white"
                bgColor="bg-[#059669]"
              />
              <StatCard
                icon={icons.eyeOff}
                title="Приховані профілі"
                value={stats.hiddenProfilesCount}
                iconClass="icon-white"
                bgColor="bg-[#9CA3AF]"
              />
            </div>

            <div className="mb-6 grid grid-cols-2 gap-5">
              <section className="rounded-lg border border-[#30363D] bg-[#1C2128] p-6">
                <h2 className="mb-5 text-[18px] font-bold">Популярні ігри</h2>

                <div className="flex h-75 items-center justify-center">
                  <PieChart
                    games={popularGames}
                    hoveredGame={hoveredGame}
                    setHoveredGame={setHoveredGame}
                  />
                </div>
              </section>

              <section className="rounded-lg border border-[#30363D] bg-[#1C2128] p-6">
                <h2 className="mb-5 text-[18px] font-bold">
                  Популярні ігри - список
                </h2>

                <div className="custom-scroll max-h-75 space-y-3">
                  {popularGames.map((game, index) => (
                    <div
                      key={game.gameId}
                      onMouseEnter={() => setHoveredGame(game)}
                      onMouseLeave={() => setHoveredGame(null)}
                      className="flex items-center justify-between rounded-md border border-[#30363D] bg-[#161B22] px-4 py-3 transition hover:border-[#B91C1C]"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor:
                              pieColors[index % pieColors.length],
                          }}
                        />
                        <p className="text-[14px] font-bold">{game.gameName}</p>
                      </div>

                      <p className="text-[14px] text-[#9CA3AF]">
                        {game.playersCount} гравців
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="rounded-lg border border-[#30363D] bg-[#1C2128] p-6">
              <h2 className="mb-6 text-[18px] font-bold">
                Активність за днями тижня
              </h2>

              <div className="grid grid-cols-[1fr_1.4fr_1.4fr] border-b border-[#30363D] px-4 pb-3 text-[14px] font-bold text-[#9CA3AF]">
                <p>День тижня</p>
                <p>Активних користувачів</p>
                <p>Найпопулярніший період</p>
              </div>

              {activityStatistics.map((item) => (
                <div
                  key={item.dayOfWeek}
                  className="grid grid-cols-[1fr_1.4fr_1.4fr] border-b border-[#30363D] px-4 py-4 text-[14px] last:border-b-0"
                >
                  <p className="font-medium">{dayNames[item.dayOfWeek]}</p>
                  <p>{item.usersCount}</p>
                  <p className="flex items-center gap-2 text-[#9CA3AF]">
                    <img
                      src={icons.clock}
                      alt=""
                      className="h-4 w-4 icon-muted"
                    />
                    {item.mostPopularTimeFrom} - {item.mostPopularTimeTo}
                  </p>
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, bgColor, iconClass }) {
  return (
    <div className="flex items-center gap-5 rounded-lg border border-[#30363D] bg-[#1C2128] p-6">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-md ${bgColor}`}
      >
        <img src={icon} alt="" className={`h-6 w-6 ${iconClass}`} />
      </div>

      <div>
        <p className="mb-1 text-[14px] text-[#9CA3AF]">{title}</p>
        <p className="text-[30px] font-medium leading-none">{value}</p>
      </div>
    </div>
  );
}

function PieChart({ games, hoveredGame, setHoveredGame }) {
  const total = useMemo(() => {
    return games.reduce((sum, game) => sum + game.playersCount, 0);
  }, [games]);

  if (!games.length || total === 0) {
    return <p className="text-[#9CA3AF]">Дані відсутні</p>;
  }

  let currentAngle = -90;

  const slices = games.map((game, index) => {
    const angle = (game.playersCount / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    const middleAngle = startAngle + angle / 2;

    currentAngle = endAngle;

    const tooltipPoint = polarToCartesian(150, 150, 145, middleAngle);

    return {
      ...game,
      startAngle,
      endAngle,
      middleAngle,
      path: createSlice(150, 150, 95, startAngle, endAngle),
      color: pieColors[index % pieColors.length],
      tooltipPoint,
    };
  });

  const activeSlice = hoveredGame
    ? slices.find((slice) => slice.gameId === hoveredGame.gameId)
    : null;

  return (
    <div className="relative">
      <svg width="420" height="330" viewBox="0 0 300 300">
        {slices.map((slice) => (
          <path
            key={slice.gameId}
            d={slice.path}
            fill={slice.color}
            stroke="#D1D5DB"
            strokeWidth="1.5"
            onMouseEnter={() => setHoveredGame(slice)}
            onMouseLeave={() => setHoveredGame(null)}
            className="cursor-pointer transition-opacity hover:opacity-85"
          />
        ))}
      </svg>

      {activeSlice && (
        <div
          className="pointer-events-none absolute z-10 w-48 rounded-lg border border-[#30363D] bg-[#161B22] px-4 py-3 shadow-lg"
          style={{
            left: `${(activeSlice.tooltipPoint.x / 300) * 100}%`,
            top: `${(activeSlice.tooltipPoint.y / 300) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <p className="mb-1 text-[14px] font-bold">{activeSlice.gameName}</p>
          <p className="text-[13px] text-[#9CA3AF]">
            {activeSlice.playersCount} гравців
          </p>
        </div>
      )}
    </div>
  );
}

function createSlice(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function polarToCartesian(cx, cy, r, angle) {
  const angleInRadians = (angle * Math.PI) / 180;

  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}
