import { Link, useLocation } from "wouter";
import { useAuth, logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/o_1j3u27o5h1gih1k92joq1ne07q2r_1759348995794.gif";

export default function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border backdrop-blur-lg bg-opacity-90">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src={logoImage} alt="Steamtools Logo" className="w-10 h-10 rounded-lg object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Steamtools</h1>
              <p className="text-xs text-muted-foreground">Gaming Platform</p>
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