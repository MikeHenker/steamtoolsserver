import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { authenticatedApiRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
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
    if (game.downloadUrl) {
      window.open(game.downloadUrl, "_blank");
    }
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
              className="w-9 h-9 bg-black/60 hover:bg-primary/80 rounded-lg flex items-center justify-center transition-all backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite.mutate();
              }}
              data-testid={`button-favorite-${game.id}`}
            >
              <i className="fas fa-heart text-white"></i>
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
    </>
  );
}
