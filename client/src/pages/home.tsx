import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import GameCard from "@/components/game-card";
import type { Game } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  
  const { data: featuredGames = [] } = useQuery<Game[]>({
    queryKey: ["/api/games?featured=true"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: announcement } = useQuery({
    queryKey: ["/api/announcements/active"],
  });

  return (
    <main className="pt-16 min-h-screen">
      {announcement && (
        <div className="bg-gradient-to-r from-primary to-accent py-3 px-4">
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className="fas fa-bullhorn text-white"></i>
              <p className="text-sm text-white font-medium" data-testid="text-announcement">
                {announcement.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative rounded-2xl overflow-hidden mb-8 h-80">
          <img
            src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600"
            alt="Gaming setup"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h2 className="text-4xl font-bold mb-3">Discover Amazing Games</h2>
            <p className="text-lg text-muted-foreground mb-6">Browse our collection of Lua scripts and manifest files</p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setLocation("/games")} data-testid="button-browse-games">
                Browse Games
              </Button>
              <Button variant="secondary" onClick={() => setLocation("/requests")} data-testid="button-request-game">
                <i className="fas fa-plus-circle mr-2"></i>Request Game
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-gamepad text-primary text-xl"></i>
              </div>
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <h3 className="text-3xl font-bold mb-1" data-testid="text-total-games">{stats?.totalGames || 0}</h3>
            <p className="text-sm text-muted-foreground">Games Available</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-accent text-xl"></i>
              </div>
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <h3 className="text-3xl font-bold mb-1" data-testid="text-total-users">{stats?.totalUsers || 0}</h3>
            <p className="text-sm text-muted-foreground">Community Members</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-chart-3/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-download text-chart-3 text-xl"></i>
              </div>
              <span className="text-sm text-muted-foreground">This Month</span>
            </div>
            <h3 className="text-3xl font-bold mb-1" data-testid="text-total-downloads">{stats?.totalDownloads || 0}</h3>
            <p className="text-sm text-muted-foreground">Total Downloads</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-chart-4/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-star text-chart-4 text-xl"></i>
              </div>
              <span className="text-sm text-muted-foreground">Average</span>
            </div>
            <h3 className="text-3xl font-bold mb-1" data-testid="text-average-rating">{stats?.averageRating?.toFixed(1) || 0}</h3>
            <p className="text-sm text-muted-foreground">User Rating</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Featured Games</h3>
            <Button variant="ghost" onClick={() => setLocation("/games")} data-testid="button-view-all">
              View All <i className="fas fa-arrow-right ml-2"></i>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
