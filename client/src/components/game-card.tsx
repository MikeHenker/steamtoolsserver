import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { authenticatedApiRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StarRating from "@/components/star-rating";
import GameModal from "@/components/game-modal";
import type { Game, Rating } from "@shared/schema";

interface RatingsData {
  ratings: Rating[];
  average: number;
}

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const { data: ratingsData } = useQuery<RatingsData>({
    queryKey: ["/api/ratings", game.id],
  });

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      await authenticatedApiRequest("POST", "/api/favorites", { gameId: game.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDisclaimer(true);
  };

  const proceedDownload = () => {
    if (game.downloadUrl) {
      window.open(game.downloadUrl, "_blank");
    }
    setShowDisclaimer(false);
  };

  return (
    <>
      <div
        className="game-card bg-card border border-border rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
        onClick={() => setShowModal(true)}
        data-testid={`card-game-${game.id}`}
      >
        <div className="relative h-52">
          <img
            src={game.imageUrl || "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
            alt={game.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          {game.featured && (
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-lg">
                <i className="fas fa-fire mr-1"></i>Featured
              </span>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <button
              className="w-9 h-9 bg-black/60 hover:bg-primary/80 rounded-lg flex items-center justify-center transition-all backdrop-blur-sm relative overflow-hidden"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite.mutate();
              }}
              data-testid={`button-favorite-${game.id}`}
            >
              <img 
                src="/attached_assets/o_1j3u27o5h1gih1k92joq1ne07q2r_1759346178377.gif" 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              <i className="fas fa-heart text-white relative z-10"></i>
            </button>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <h4 className="text-lg font-bold text-white drop-shadow-lg" data-testid={`text-game-title-${game.id}`}>{game.title}</h4>
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 min-h-[2.5rem]" data-testid={`text-game-description-${game.id}`}>
            {game.shortDescription || game.description}
          </p>
          <div className="flex items-center justify-between gap-3">
            <span className="px-3 py-1.5 bg-secondary text-xs font-medium rounded-lg">{game.genre}</span>
            <Button size="sm" className="flex-1" onClick={handleDownload} data-testid={`button-download-${game.id}`}>
              <i className="fas fa-download mr-2"></i>Download
            </Button>
          </div>
        </div>
      </div>

      {showModal && <GameModal game={game} onClose={() => setShowModal(false)} />}

      <AlertDialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-yellow-500"></i>
              Legal Disclaimer & Terms of Use
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left space-y-4 text-base">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="font-semibold text-foreground mb-2">⚠️ IMPORTANT - READ CAREFULLY</p>
                <p>By proceeding with this download, you acknowledge and agree to the following terms:</p>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-foreground">📚 Educational & Viewing Purposes Only</p>
                  <p className="text-sm">This content is provided strictly for educational, research, and personal viewing purposes. It is intended for learning and reference only.</p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">🚫 Anti-Piracy Statement</p>
                  <p className="text-sm">We do NOT condone, support, or encourage piracy in any form. We strongly oppose copyright infringement and illegal distribution of protected content. Users must own legitimate licenses for any software they download.</p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">⚖️ User Responsibility & Liability</p>
                  <p className="text-sm">You are solely responsible for how you use the downloaded content. We are NOT liable for any actions you take with this content. We expressly disclaim all responsibility for any misuse, illegal activities, or copyright violations committed by users.</p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">🛡️ Legal Compliance</p>
                  <p className="text-sm">You must comply with all applicable laws, including copyright laws, in your jurisdiction. Downloading or using copyrighted material without proper authorization may be illegal in your country.</p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">📝 No Warranty or Guarantee</p>
                  <p className="text-sm">Content is provided "AS IS" without any warranties. We make no guarantees about accuracy, safety, or legality of the content. Use at your own risk.</p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">🔒 Indemnification</p>
                  <p className="text-sm">By downloading, you agree to indemnify and hold harmless this platform, its operators, and affiliates from any claims, damages, or legal actions arising from your use of the downloaded content.</p>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="font-semibold text-foreground text-sm">🚨 Final Warning</p>
                  <p className="text-sm">If you do not agree with these terms or cannot legally download this content in your jurisdiction, you must NOT proceed. Clicking "I Agree" confirms your acceptance of full responsibility.</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>I Do Not Agree</AlertDialogCancel>
            <AlertDialogAction onClick={proceedDownload}>
              I Agree & Accept Full Responsibility
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
