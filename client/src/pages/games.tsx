import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GameCard from "@/components/game-card";
import AddGameModal from "@/components/add-game-modal";
import { useAuth } from "@/lib/auth";
import type { Game } from "@shared/schema";

export default function Games() {
  const { user } = useAuth();
  const [genre, setGenre] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);

  const queryKey = genre ? `/api/games?genre=${genre}` : "/api/games";
  const { data: games = [] } = useQuery<Game[]>({
    queryKey: [queryKey],
  });

  const filteredGames = games.filter((game: Game) =>
    game.title.toLowerCase().includes(search.toLowerCase())
  );

  const canAddGames = user?.role === "admin" || user?.role === "gameadder";

  return (
    <main className="pt-16 min-h-screen">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-3">
            <Input
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
              data-testid="input-search-games"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant={genre === "" ? "default" : "secondary"}
              onClick={() => setGenre("")}
              data-testid="button-filter-all"
            >
              All Games
            </Button>
            <Button
              variant={genre === "Action" ? "default" : "secondary"}
              onClick={() => setGenre("Action")}
              data-testid="button-filter-action"
            >
              Action
            </Button>
            <Button
              variant={genre === "RPG" ? "default" : "secondary"}
              onClick={() => setGenre("RPG")}
              data-testid="button-filter-rpg"
            >
              RPG
            </Button>
            <Button
              variant={genre === "Strategy" ? "default" : "secondary"}
              onClick={() => setGenre("Strategy")}
              data-testid="button-filter-strategy"
            >
              Strategy
            </Button>
            <Button
              variant={genre === "Racing" ? "default" : "secondary"}
              onClick={() => setGenre("Racing")}
              data-testid="button-filter-racing"
            >
              Racing
            </Button>
          </div>

          {canAddGames && (
            <Button 
              className="bg-accent text-accent-foreground" 
              onClick={() => setShowAddModal(true)}
              data-testid="button-add-game"
            >
              <i className="fas fa-plus mr-2"></i>Add Game
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredGames.length > 0 ? (
            filteredGames.map((game: Game) => (
              <GameCard key={game.id} game={game} />
            ))
          ) : (
            <div className="text-center text-muted-foreground py-12 col-span-full">
              <i className="fas fa-gamepad text-6xl mb-4"></i>
              <p>No games found</p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && <AddGameModal onClose={() => setShowAddModal(false)} />}
    </main>
  );
}
