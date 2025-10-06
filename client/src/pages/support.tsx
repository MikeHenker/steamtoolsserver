import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authenticatedApiRequest, useAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  userId: string;
  status: string;
  priority: string;
  createdAt: string;
  completedAt: string | null;
}

interface SupportTicketMessage {
  id: string;
  content: string;
  ticketId: string;
  userId: string;
  isAdminReply: boolean;
  createdAt: string;
}

export default function Support() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  const { data: tickets = [] } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support"],
  });

  const { data: messages = [] } = useQuery<SupportTicketMessage[]>({
    queryKey: ["/api/support", selectedTicket, "messages"],
    enabled: !!selectedTicket,
  });

  const createTicket = useMutation({
    mutationFn: async (data: { title: string; description: string; priority: string }) => {
      await authenticatedApiRequest("POST", "/api/support", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support"] });
      setTitle("");
      setDescription("");
      setPriority("medium");
      toast({
        title: "Ticket created",
        description: "Your support ticket has been submitted",
      });
    },
  });

  const updateTicketStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await authenticatedApiRequest("PATCH", `/api/support/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support"] });
      toast({
        title: "Status updated",
        description: "Ticket status has been updated",
      });
    },
  });

  const sendMessage = useMutation({
    mutationFn: async ({ ticketId, content }: { ticketId: string; content: string }) => {
      await authenticatedApiRequest("POST", `/api/support/${ticketId}/messages`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support", selectedTicket, "messages"] });
      setReplyMessage("");
      toast({
        title: "Message sent",
        description: "Your reply has been added to the ticket",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket.mutate({ title, description, priority });
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    sendMessage.mutate({ ticketId: selectedTicket, content: replyMessage });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-orange-500";
      case "in_progress":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <main className="pt-16 min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-purple-500 to-orange-500 bg-clip-text text-transparent mb-2">
            🎃 Support Center 🎃
          </h1>
          <p className="text-muted-foreground">Get help from our support team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="border-2 border-orange-500/30 shadow-lg shadow-orange-500/10 sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 text-orange-500">Create New Ticket</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      type="text"
                      placeholder="Brief description of your issue"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="border-orange-500/30 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      placeholder="Provide details about your issue..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className="min-h-[100px] border-orange-500/30 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full rounded-md border border-orange-500/30 bg-background px-3 py-2"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    disabled={createTicket.isPending}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    {createTicket.isPending ? "Creating..." : "Create Ticket 🎃"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className={`border-2 ${
                    selectedTicket === ticket.id ? "border-orange-500" : "border-orange-500/30"
                  } shadow-lg shadow-orange-500/10 cursor-pointer hover:border-orange-500 transition-colors`}
                  onClick={() => setSelectedTicket(ticket.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{ticket.title}</h3>
                        <p className="text-muted-foreground mb-3">{ticket.description}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant="outline">{new Date(ticket.createdAt).toLocaleDateString()}</Badge>
                        </div>
                      </div>
                      {isAdmin && ticket.status !== "completed" && (
                        <div className="flex gap-2 ml-4">
                          {ticket.status === "open" && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTicketStatus.mutate({ id: ticket.id, status: "in_progress" });
                              }}
                              className="bg-yellow-500 hover:bg-yellow-600"
                            >
                              In Progress
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTicketStatus.mutate({ id: ticket.id, status: "completed" });
                            }}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Complete
                          </Button>
                        </div>
                      )}
                    </div>

                    {selectedTicket === ticket.id && (
                      <div className="mt-6 pt-6 border-t border-border">
                        <h4 className="font-semibold mb-4 text-orange-500">Messages</h4>
                        <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`p-3 rounded-lg ${
                                msg.isAdminReply ? "bg-orange-500/20 ml-8" : "bg-secondary mr-8"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-semibold">
                                  {msg.isAdminReply ? "🎃 Admin" : "You"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(msg.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm">{msg.content}</p>
                            </div>
                          ))}
                        </div>

                        <form onSubmit={handleReply} className="flex gap-2">
                          <Textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Type your reply..."
                            className="flex-1 min-h-[60px] border-orange-500/30 focus:border-orange-500"
                          />
                          <Button
                            type="submit"
                            disabled={!replyMessage.trim() || sendMessage.isPending}
                            className="self-end bg-orange-500 hover:bg-orange-600"
                          >
                            Send
                          </Button>
                        </form>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {tickets.length === 0 && (
                <Card className="border-2 border-orange-500/30">
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">No support tickets yet. Create one to get started!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
