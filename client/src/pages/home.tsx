import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import GameCard from "@/components/game-card";
import type { Game, Announcement } from "@shared/schema";

interface Stats {
  totalGames: number;
  totalUsers: number;
  totalDownloads: number;
  averageRating: number;
}

export default function Home() {
  const [, setLocation] = useLocation();
  
  const { data: featuredGames = [] } = useQuery<Game[]>({
    queryKey: ["/api/games?featured=true"],
  });

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: announcement } = useQuery<Announcement | null>({
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
            src="https://imgs.search.brave.com/OF2ko0gCbnzSRvgQhN7YbrhoaWLayr4xQGM0l7gGMhA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzNhLzJl/LzMxLzNhMmUzMTE2/NGM2YWNlZWUxYTZk/YzQxYTExM2ZjYzYz/LmpwZw"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                <i className="fas fa-fire text-chart-3 text-xl"></i>
              </div>
              <span className="text-sm text-muted-foreground">Popular</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">{featuredGames.length || 0}</h3>
            <p className="text-sm text-muted-foreground">Featured Games</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-border rounded-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">🎮 Ultimate Games Package</h2>
            <p className="text-muted-foreground">Get instant access to our complete collection</p>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-8 text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-bold text-white">1299</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Games Included</h3>
            <p className="text-muted-foreground mb-6">Download all Lua scripts and manifest files in one package</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
              <div className="flex items-start space-x-3">
                <i className="fas fa-check-circle text-primary text-xl mt-1"></i>
                <div>
                  <h4 className="font-semibold">Instant Access</h4>
                  <p className="text-sm text-muted-foreground">Download immediately</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <i className="fas fa-download text-accent text-xl mt-1"></i>
                <div>
                  <h4 className="font-semibold">All Files</h4>
                  <p className="text-sm text-muted-foreground">Complete package</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <i className="fas fa-infinity text-chart-3 text-xl mt-1"></i>
                <div>
                  <h4 className="font-semibold">Lifetime Access</h4>
                  <p className="text-sm text-muted-foreground">One-time purchase</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={() => window.open('https://payhip.com/b/p6Ohu', '_blank')}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-lg px-8 py-6"
              data-testid="button-get-package"
            >
              <i className="fas fa-shopping-cart mr-2"></i>Get 1299 Games Package
            </Button>
          </div>
        </div>

      </div>
    </main>
  );
}
