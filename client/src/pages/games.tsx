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
                WICHTIG: Bitte lesen Sie diese Hinweise sorgfältig durch.
              </p>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-foreground">ℹ️ Nur technische Informationen</p>
                <p>
                  Diese Plattform stellt <strong>KEINE Spiele, Raubkopien oder illegale Inhalte</strong> bereit. 
                  Wir zeigen ausschließlich <strong>technische Informationen</strong> zu Modifikationsdateien und Skripten für Bildungszwecke.
                </p>
                <p className="text-sm italic">
                  We DO NOT provide games, pirated content, or illegal files. This platform displays technical information only.
                </p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-foreground">⚖️ Nutzerverantwortung</p>
                <p>
                  <strong>Jeder Nutzer ist selbst dafür verantwortlich</strong>, wie er die hier angezeigten Informationen verwendet. 
                  Sie müssen sicherstellen, dass Ihre Nutzung:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Mit allen geltenden Gesetzen übereinstimmt</li>
                  <li>Die <a href="https://store.steampowered.com/subscriber_agreement/" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">Steam Nutzungsbedingungen</a> respektiert</li>
                  <li>Keine Urheberrechte oder andere Rechte verletzt</li>
                  <li>Nur für rechtmäßig erworbene Spiele erfolgt</li>
                </ul>
                <p className="text-sm italic mt-2">
                  Each user is solely responsible for how they use the information displayed here.
                </p>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-foreground">🚫 Keine Haftung</p>
                <p>
                  Wir übernehmen <strong>KEINERLEI Haftung</strong> für:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Die Verwendung der angezeigten Informationen</li>
                  <li>Rechtliche Konsequenzen aus Ihrer Nutzung</li>
                  <li>Verstöße gegen Nutzungsbedingungen von Drittanbietern</li>
                  <li>Schäden oder Verluste jeglicher Art</li>
                </ul>
                <p className="text-sm italic mt-2">
                  We assume NO LIABILITY for how you use this information or any consequences thereof.
                </p>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-foreground">📋 Steam Nutzungsbedingungen</p>
                <p>
                  Bevor Sie fortfahren, lesen Sie bitte die offiziellen 
                  <a href="https://store.steampowered.com/subscriber_agreement/" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 font-semibold"> Steam Nutzungsbedingungen</a>, 
                  um zu verstehen, was erlaubt ist und was nicht.
                </p>
                <p className="text-sm">
                  Please read the official <a href="https://store.steampowered.com/subscriber_agreement/" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">Steam Terms of Service</a> to understand what is permitted.
                </p>
              </div>

              <p className="text-sm text-muted-foreground italic text-center pt-2">
                Durch Klicken auf "Verstanden" bestätigen Sie, dass Sie diese Hinweise gelesen haben und die volle Verantwortung für Ihre Handlungen übernehmen.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowLegalDisclaimer(false)} className="w-full">
              Verstanden / I Understand
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
