import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authenticatedApiRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import type { Request as GameRequest } from "@shared/schema";

export default function Requests() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [gameName, setGameName] = useState("");
  const [steamId, setSteamId] = useState("");
  const [description, setDescription] = useState("");

  const { data: requests = [] } = useQuery<GameRequest[]>({
    queryKey: ["/api/requests"],
  });

  const createRequest = useMutation({
    mutationFn: async (data: { gameName: string; steamId?: string; description?: string }) => {
      await authenticatedApiRequest("POST", "/api/requests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      setGameName("");
      setSteamId("");
      setDescription("");
      toast({
        title: "Request submitted",
        description: "Your game request has been submitted successfully",
      });
    },
  });

  const updateRequestStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await authenticatedApiRequest("PATCH", `/api/requests/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      toast({
        title: "Request updated",
        description: "Request status has been updated",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest.mutate({ gameName, steamId, description });
  };

  const isAdmin = user?.role === "admin";

  return (
    <main className="pt-16 min-h-screen">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Request a Game</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Game Name</label>
                    <Input
                      type="text"
                      placeholder="Enter game name"
                      value={gameName}
                      onChange={(e) => setGameName(e.target.value)}
                      required
                      data-testid="input-game-name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Steam ID (Optional)</label>
                    <Input
                      type="text"
                      placeholder="e.g., 730"
                      value={steamId}
                      onChange={(e) => setSteamId(e.target.value)}
                      data-testid="input-steam-id"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      rows={4}
                      placeholder="Tell us why you want this game..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      data-testid="textarea-description"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={createRequest.isPending} data-testid="button-submit-request">
                    <i className="fas fa-paper-plane mr-2"></i>Submit Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Game Requests</h3>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {requests.map((request) => (
                    <div key={request.id} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors" data-testid={`card-request-${request.id}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">🎮</span>
                          </div>
                          <div>
                            <h4 className="font-semibold" data-testid={`text-game-name-${request.id}`}>{request.gameName}</h4>
                            <p className="text-sm text-muted-foreground">Requested by user</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          request.status === 'approved' ? 'bg-chart-3/20 text-chart-3' :
                          request.status === 'rejected' ? 'bg-destructive/20 text-destructive' :
                          'bg-chart-4/20 text-chart-4'
                        }`} data-testid={`text-status-${request.id}`}>
                          {request.status}
                        </span>
                      </div>
                      {request.description && (
                        <p className="text-sm text-muted-foreground mb-3" data-testid={`text-description-${request.id}`}>
                          {request.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(request.createdAt!).toLocaleDateString()}
                        </span>
                        {isAdmin && request.status === 'pending' && (
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              className="bg-chart-3 text-white"
                              onClick={() => updateRequestStatus.mutate({ id: request.id, status: 'approved' })}
                              data-testid={`button-approve-${request.id}`}
                            >
                              <i className="fas fa-check mr-1"></i>Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateRequestStatus.mutate({ id: request.id, status: 'rejected' })}
                              data-testid={`button-reject-${request.id}`}
                            >
                              <i className="fas fa-times mr-1"></i>Reject
                            </Button>
                          </div>
                        )}
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
