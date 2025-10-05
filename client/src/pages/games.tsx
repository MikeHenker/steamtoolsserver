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
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-center">
              ⚠️ Legal Disclaimer & Terms of Use
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-4 pt-4">
              <p className="font-semibold text-foreground">
                IMPORTANT: Please read this disclaimer carefully before proceeding.
              </p>
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-foreground">📚 Educational & Viewing Purposes Only</p>
                <p>
                  All content provided on this platform is strictly for <strong>educational and viewing purposes only</strong>. 
                  This library is intended to showcase game modification files, scripts, and related content for learning purposes.
                </p>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-foreground">🚫 Anti-Piracy Statement</p>
                <p>
                  We <strong>do NOT condone, support, or encourage piracy</strong> in any form. Users are responsible for ensuring 
                  they own legitimate copies of any games before using modification files. Piracy is illegal and violates copyright laws.
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-foreground">⚖️ User Responsibility & Liability</p>
                <p>
                  By using this platform, you acknowledge that:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>You are solely responsible for your use of any downloaded content</li>
                  <li>We are NOT liable for how you use the files or any consequences thereof</li>
                  <li>You agree to comply with all applicable local, national, and international laws</li>
                  <li>Any misuse of content is entirely your responsibility</li>
                  <li>We assume no responsibility for user actions or legal issues arising from misuse</li>
                </ul>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-foreground">📋 Terms & Conditions</p>
                <p>
                  By clicking "I Understand and Agree" below, you confirm that you:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Have read and understood this disclaimer</li>
                  <li>Will use content for educational/viewing purposes only</li>
                  <li>Own legitimate copies of games before using modifications</li>
                  <li>Accept full responsibility for your actions</li>
                  <li>Agree to hold this platform harmless from any legal issues</li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground italic text-center pt-2">
                This platform is provided "as is" without warranties. We disclaim all liability for user actions.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowLegalDisclaimer(false)} className="w-full">
              I Understand and Agree to These Terms
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
