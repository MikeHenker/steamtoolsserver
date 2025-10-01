import { useQuery, useMutation } from "@tanstack/react-query";
import { authenticatedApiRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import type { Request as GameRequest } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

export default function AdminPanel() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  const { data: requests = [], isLoading } = useQuery<(GameRequest & { user?: { username: string } })[]>({
    queryKey: ["/api/admin/requests"],
  });

  const updateRequestStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await authenticatedApiRequest("PATCH", `/api/requests/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      toast({
        title: "Request updated",
        description: "Request status has been updated successfully",
      });
    },
  });

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  return (
    <main className="pt-16 min-h-screen bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-admin-title">Admin Panel</h1>
          <p className="text-muted-foreground">Manage game requests and platform content</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-4" data-testid="text-pending-count">{pendingRequests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-3" data-testid="text-approved-count">{approvedRequests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive" data-testid="text-rejected-count">{rejectedRequests.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No requests found</div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-border rounded-lg p-4 hover:bg-accent/5 transition-colors"
                    data-testid={`card-admin-request-${request.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">
                            🎮
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg" data-testid={`text-admin-game-name-${request.id}`}>
                              {request.gameName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Requested by {request.user?.username || 'Unknown user'}
                            </p>
                          </div>
                          <Badge
                            variant={
                              request.status === 'approved' ? 'default' :
                              request.status === 'rejected' ? 'destructive' :
                              'secondary'
                            }
                            data-testid={`badge-status-${request.id}`}
                          >
                            {request.status}
                          </Badge>
                        </div>

                        {request.steamId && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <i className="fas fa-steam"></i>
                            <span>Steam ID: {request.steamId}</span>
                          </div>
                        )}

                        {request.description && (
                          <p className="text-sm text-muted-foreground" data-testid={`text-admin-description-${request.id}`}>
                            {request.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(request.createdAt!).toLocaleString()}
                          </span>

                          {request.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-chart-3 hover:bg-chart-3/90"
                                onClick={() => updateRequestStatus.mutate({ id: request.id, status: 'approved' })}
                                disabled={updateRequestStatus.isPending}
                                data-testid={`button-admin-approve-${request.id}`}
                              >
                                <i className="fas fa-check mr-2"></i>Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateRequestStatus.mutate({ id: request.id, status: 'rejected' })}
                                disabled={updateRequestStatus.isPending}
                                data-testid={`button-admin-reject-${request.id}`}
                              >
                                <i className="fas fa-times mr-2"></i>Decline
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
