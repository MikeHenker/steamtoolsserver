import { Link, useLocation } from "wouter";
import { useAuth, logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/o_1j3u27o5h1gih1k92joq1ne07q2r_1759348995794.gif";
import { useState } from "react";

export default function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [bats, setBats] = useState<{ id: number; x: number; y: number }[]>([]);

  const isActive = (path: string) => location === path;

  const handlePumpkinClick = () => {
    const newBats = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
    }));
    setBats(newBats);
    setTimeout(() => setBats([]), 1500);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border backdrop-blur-lg bg-opacity-90">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center relative">
              <img src={logoImage} alt="Steamtools Logo" className="w-10 h-10 rounded-lg object-cover" />
              <button 
                onClick={handlePumpkinClick}
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-3xl cursor-pointer hover:scale-110 transition-transform z-10"
                title="Click me! 🎃"
              >
                🎃
              </button>
              {bats.map((bat) => (
                <span
                  key={bat.id}
                  className="absolute text-2xl pointer-events-none animate-bat-fly"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(${bat.x}px, ${bat.y}px)`,
                    animation: 'bat-fly 1.5s ease-out forwards',
                  }}
                >
                  🦇
                </span>
              ))}
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent">Steamtools</h1>
              <p className="text-xs text-muted-foreground">Gaming Platform 🎃</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className={`py-2 px-3 text-sm font-semibold transition-colors ${isActive('/') ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`} 
              data-testid="link-home"
            >
              <i className="fas fa-home mr-2"></i>Home
            </Link>
            <Link 
              href="/games"
              className={`py-2 px-3 text-sm font-semibold transition-colors ${isActive('/games') ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`} 
              data-testid="link-games"
            >
              <i className="fas fa-gamepad mr-2"></i>Games
            </Link>
            <Link 
              href="/requests"
              className={`py-2 px-3 text-sm font-semibold transition-colors ${isActive('/requests') ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`} 
              data-testid="link-requests"
            >
              <i className="fas fa-paper-plane mr-2"></i>Requests
            </Link>
            <Link 
              href="/chat"
              className={`py-2 px-3 text-sm font-semibold transition-colors ${isActive('/chat') ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`} 
              data-testid="link-chat"
            >
              <i className="fas fa-comments mr-2"></i>Chat
            </Link>
            <Link 
              href="/support"
              className={`py-2 px-3 text-sm font-semibold transition-colors ${isActive('/support') ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`} 
              data-testid="link-support"
            >
              <i className="fas fa-life-ring mr-2"></i>Support
            </Link>
            {user?.role === "admin" && (
              <>
                <Link 
                  href="/admin"
                  className={`py-2 px-3 text-sm font-semibold transition-colors ${isActive('/admin') ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`} 
                  data-testid="link-admin"
                >
                  <i className="fas fa-shield-alt mr-2"></i>Admin
                </Link>
                <Link 
                  href="/users"
                  className={`py-2 px-3 text-sm font-semibold transition-colors ${isActive('/users') ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`} 
                  data-testid="link-users"
                >
                  <i className="fas fa-users mr-2"></i>Users
                </Link>
              </>
            )}
            <Link 
              href="/profile"
              className={`py-2 px-3 text-sm font-semibold transition-colors ${isActive('/profile') ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`} 
              data-testid="link-profile"
            >
              <i className="fas fa-user mr-2"></i>Profile
            </Link>

            <div className="flex items-center space-x-2 px-3 py-1.5 bg-secondary rounded-lg">
              <span className="text-2xl">{user?.avatar || '🎮'}</span>
              <div className="text-sm">
                <p className="font-semibold" data-testid="text-username">{user?.username}</p>
                <p className="text-xs text-accent" data-testid="text-role">{user?.role}</p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={logout} data-testid="button-logout">
              <i className="fas fa-sign-out-alt"></i>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}