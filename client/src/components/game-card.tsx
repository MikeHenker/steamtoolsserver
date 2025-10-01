import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authenticatedApiRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import GameModal from "./game-modal";
import type { Game } from "@shared/schema";

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const [showModal, setShowModal] = useState(false);

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      await authenticatedApiRequest("POST", "/api/favorites", { gameId: game.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  return (
    <>
      <div
        className="game-card bg-card border border-border rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-105"
        onClick={() => setShowModal(true)}
        data-testid={`card-game-${game.id}`}
      >
        <div className="relative h-48">
          <img
            src={game.imageUrl || "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
            alt={game.title}
            className="w-full h-full object-cover"
          />
          {game.featured && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded">Featured</span>
            </div>
          )}
          <div className="absolute top-3 right-3 flex items-center space-x-2">
            <button
              className="w-8 h-8 bg-black/50 hover:bg-black/70 rounded-lg flex items-center justify-center transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite.mutate();
              }}
              data-testid={`button-favorite-${game.id}`}
            >
              <i className="fas fa-heart text-white text-sm"></i>
            </button>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-bold" data-testid={`text-game-title-${game.id}`}>{game.title}</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2" data-testid={`text-game-description-${game.id}`}>
            {game.shortDescription || game.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 bg-secondary text-xs rounded-md">{game.genre}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <i className="fas fa-download"></i>
              <span>Downloads</span>
            </div>
            <Button size="sm" data-testid={`button-download-${game.id}`}>Download</Button>
          </div>
        </div>
      </div>

      {showModal && <GameModal game={game} onClose={() => setShowModal(false)} />}
    </>
  );
}
