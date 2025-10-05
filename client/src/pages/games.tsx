import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import GameCard from "@/components/game-card";
import AddGameModal from "@/components/add-game-modal";
import { useAuth } from "@/lib/auth";
import type { Game } from "@shared/schema";

export default function Games() {
  const { user } = useAuth();
  const [genre, setGenre] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLegalDisclaimer, setShowLegalDisclaimer] = useState(true);

  useEffect(() => {
    // Show disclaimer every time the games page is accessed
    setShowLegalDisclaimer(true);
  }, []);

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
      <AlertDialog open={showLegalDisclaimer} onOpenChange={setShowLegalDisclaimer}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <i className="fas fa-exclamation-triangle text-yellow-500"></i>
              Legal Disclaimer & Terms of Use
            </AlertDialogTitle>
          </AlertDialogHeader>
          
          <div className="space-y-4 text-left px-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                IMPORTANT: Please read these notices carefully.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <i className="fas fa-question-circle text-green-500"></i>
                What is this?
              </h4>
              <p className="text-sm mb-2">
                This platform provides technical information about Steam game files. Here's what these terms mean:
              </p>
              <div className="text-sm space-y-2 ml-4">
                <div>
                  <strong className="text-green-600 dark:text-green-400">AppID:</strong> A unique numerical identifier Steam assigns to each game or application (e.g., 730 for Counter-Strike: Global Offensive).
                </div>
                <div>
                  <strong className="text-green-600 dark:text-green-400">Depot:</strong> A storage container on Steam's servers that holds game files, updates, and different versions of content.
                </div>
                <div>
                  <strong className="text-green-600 dark:text-green-400">Manifest:</strong> A technical file that lists all files in a depot, their versions, and checksums - essentially a blueprint of game content.
                </div>
              </div>
              <p className="text-xs italic mt-2 text-muted-foreground">
                We provide this information for educational and research purposes only.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <i className="fas fa-info-circle text-blue-500"></i>
                Technical Information Only
              </h4>
              <p className="text-sm">
                This platform provides <strong>NO games, pirated content, or illegal files</strong>.
                We display exclusively <strong>technical information</strong> about modification files and scripts for educational purposes.
              </p>
              <p className="text-xs italic mt-2 text-muted-foreground">
                We DO NOT provide games, pirated content, or illegal files. This platform displays technical information only.
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <i className="fas fa-balance-scale text-orange-500"></i>
                User Responsibility
              </h4>
              <p className="text-sm mb-2">
                <strong>Each user is solely responsible</strong> for how they use the information displayed here.
                You must ensure that your usage:
              </p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Complies with all applicable laws</li>
                <li>Respects the <a href="https://store.steampowered.com/subscriber_agreement/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Steam Terms of Service</a></li>
                <li>Does not violate any copyrights or other rights</li>
                <li>Only applies to legally acquired games</li>
              </ul>
              <p className="text-xs italic mt-2 text-muted-foreground">
                Each user is solely responsible for how they use the information displayed here.
              </p>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <i className="fas fa-shield-alt text-red-500"></i>
                No Liability
              </h4>
              <p className="text-sm mb-2">
                We assume <strong>NO LIABILITY</strong> for:
              </p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>The use of the displayed information</li>
                <li>Legal consequences from your usage</li>
                <li>Violations of third-party terms of service</li>
                <li>Damages or losses of any kind</li>
              </ul>
              <p className="text-xs italic mt-2 text-muted-foreground">
                We assume NO LIABILITY for how you use this information or any consequences thereof.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <i className="fas fa-file-contract text-purple-500"></i>
                Steam Terms of Service
              </h4>
              <p className="text-sm">
                Before proceeding, please read the official{' '}
                <a
                  href="https://store.steampowered.com/subscriber_agreement/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline font-semibold"
                >
                  Steam Terms of Service
                </a>
                {' '}to understand what is permitted and what is not.
              </p>
              <p className="text-xs italic mt-2 text-muted-foreground">
                Please read the official Steam Terms of Service to understand what is permitted.
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                By clicking "I Understand" you confirm that you have read these notices and
                accept full responsibility for your actions.
              </p>
              <p className="text-xs italic mt-2 text-red-600 dark:text-red-300">
                By clicking "I Understand" you confirm that you have read these notices and accept full responsibility for your actions.
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowLegalDisclaimer(false)}>
              I Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <Button
              variant={genre === "Sports" ? "default" : "secondary"}
              onClick={() => setGenre("Sports")}
              data-testid="button-filter-sports"
            >
              Sports
            </Button>
            <Button
              variant={genre === "Adventure" ? "default" : "secondary"}
              onClick={() => setGenre("Adventure")}
              data-testid="button-filter-adventure"
            >
              Adventure
            </Button>
            <Button
              variant={genre === "Simulation" ? "default" : "secondary"}
              onClick={() => setGenre("Simulation")}
              data-testid="button-filter-simulation"
            >
              Simulation
            </Button>
            <Button
              variant={genre === "Puzzle" ? "default" : "secondary"}
              onClick={() => setGenre("Puzzle")}
              data-testid="button-filter-puzzle"
            >
              Puzzle
            </Button>
            <Button
              variant={genre === "Horror" ? "default" : "secondary"}
              onClick={() => setGenre("Horror")}
              data-testid="button-filter-horror"
            >
              Horror
            </Button>
            <Button
              variant={genre === "FPS" ? "default" : "secondary"}
              onClick={() => setGenre("FPS")}
              data-testid="button-filter-fps"
            >
              FPS
            </Button>
            <Button
              variant={genre === "MOBA" ? "default" : "secondary"}
              onClick={() => setGenre("MOBA")}
              data-testid="button-filter-moba"
            >
              MOBA
            </Button>
            <Button
              variant={genre === "MMO" ? "default" : "secondary"}
              onClick={() => setGenre("MMO")}
              data-testid="button-filter-mmo"
            >
              MMO
            </Button>
            <Button
              variant={genre === "Indie" ? "default" : "secondary"}
              onClick={() => setGenre("Indie")}
              data-testid="button-filter-indie"
            >
              Indie
            </Button>
            <Button
              variant={genre === "Fighting" ? "default" : "secondary"}
              onClick={() => setGenre("Fighting")}
              data-testid="button-filter-fighting"
            >
              Fighting
            </Button>
            <Button
              variant={genre === "Platformer" ? "default" : "secondary"}
              onClick={() => setGenre("Platformer")}
              data-testid="button-filter-platformer"
            >
              Platformer
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