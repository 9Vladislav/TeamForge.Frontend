import { GameRow } from "./ProfileRows";

export function ProfileGamesSection({ games = [] }) {
  return (
    <section className="rounded-lg border border-[#30363D] bg-[#1C2128] p-6">
      <h2 className="mb-5 text-[20px] font-bold">Ігри</h2>

      <div className="custom-scroll max-h-76 space-y-4">
        {games.length > 0 ? (
          games.map((game) => (
            <GameRow
              key={game.userGameId}
              title={game.gameName}
              description={game.playstyleDescription}
              level={game.skillLevel}
              imageUrl={game.imageUrl}
            />
          ))
        ) : (
          <p className="text-[14px] text-[#9CA3AF]">Ігри не вказані</p>
        )}
      </div>
    </section>
  );
}