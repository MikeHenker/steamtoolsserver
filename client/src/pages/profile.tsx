import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authenticatedApiRequest, useAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Favorite, Rating } from "@shared/schema";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [avatar, setAvatar] = useState(user?.avatar || "🎮");
  const [bio, setBio] = useState(user?.bio || "");

  const { data: favorites = [] } = useQuery<Favorite[]>({
    queryKey: ["/api/favorites", user?.id],
    enabled: !!user?.id,
  });

  const { data: ratings = [] } = useQuery<Rating[]>({
    queryKey: ["/api/ratings/user", user?.id],
    enabled: !!user?.id,
  });

  const updateProfile = useMutation({
    mutationFn: async (data: { avatar: string; bio: string }) => {
      await authenticatedApiRequest("PATCH", `/api/users/${user?.id}/profile`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ avatar, bio });
  };

  return (
    <main className="pt-16 min-h-screen">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-5xl">{user?.avatar || '🎮'}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1" data-testid="text-profile-username">{user?.username}</h3>
                  <p className="text-sm text-accent font-semibold" data-testid="text-profile-role">{user?.role}</p>
                </div>

                <div className="space-y-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Member Since</span>
                    <span className="text-sm font-semibold">
                      {user?.createdAt && new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Favorites</span>
                    <span className="text-sm font-semibold" data-testid="text-favorites-count">{favorites.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ratings</span>
                    <span className="text-sm font-semibold" data-testid="text-ratings-count">{ratings.length}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Avatar Emoji</label>
                    <Input
                      type="text"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      maxLength={2}
                      data-testid="input-avatar"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      placeholder="Tell us about yourself..."
                      data-testid="textarea-bio"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={updateProfile.isPending} data-testid="button-update-profile">
                    <i className="fas fa-save mr-2"></i>Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">About Me</h3>
                <p className="text-muted-foreground" data-testid="text-profile-bio">
                  {user?.bio || "No bio yet"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Recent Ratings</h3>
                <div className="space-y-3">
                  {ratings.slice(0, 5).map((rating) => (
                    <div key={rating.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg" data-testid={`rating-${rating.id}`}>
                      <div>
                        <h4 className="font-semibold">Game {rating.gameId}</h4>
                        {rating.review && (
                          <p className="text-xs text-muted-foreground mt-1">{rating.review}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <i className="fas fa-star text-chart-4"></i>
                        <span className="font-bold" data-testid={`rating-value-${rating.id}`}>{rating.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
