import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authenticatedApiRequest, useAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface GlobalChatMessage {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
}

export default function GlobalChat() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [isHeading, setIsHeading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery<GlobalChatMessage[]>({
    queryKey: ["/api/chat/global"],
    refetchInterval: 3000,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      await authenticatedApiRequest("POST", "/api/chat/global", { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/global"] });
      setMessage("");
      setIsBold(false);
      setIsHeading(false);
      toast({
        title: "Message sent",
        description: "Your message has been sent to the global chat",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    let formattedMessage = message;
    
    if (isHeading) {
      formattedMessage = `## ${formattedMessage}`;
    }
    if (isBold) {
      formattedMessage = `**${formattedMessage}**`;
    }

    sendMessage.mutate(formattedMessage);
  };

  const renderMessage = (content: string) => {
    if (content.startsWith("## ")) {
      const text = content.slice(3);
      if (text.includes("**") && text.startsWith("**") && text.endsWith("**")) {
        return <h2 className="text-2xl font-bold">{text.slice(2, -2)}</h2>;
      }
      return <h2 className="text-2xl font-semibold">{text}</h2>;
    }
    
    if (content.startsWith("**") && content.endsWith("**")) {
      return <p className="font-bold">{content.slice(2, -2)}</p>;
    }
    
    return <p>{content}</p>;
  };

  return (
    <main className="pt-16 min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-purple-500 to-orange-500 bg-clip-text text-transparent mb-2">
            🎃 Global Chat 🎃
          </h1>
          <p className="text-muted-foreground">Chat with everyone in the community</p>
        </div>

        <Card className="border-2 border-orange-500/30 shadow-lg shadow-orange-500/10">
          <CardContent className="p-6">
            <div className="h-[500px] overflow-y-auto mb-6 space-y-4 bg-secondary/30 rounded-lg p-4">
              {messages.slice().reverse().map((msg) => (
                <div key={msg.id} className="bg-card rounded-lg p-4 border border-border hover:border-orange-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-orange-500">User #{msg.userId.slice(0, 8)}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-foreground">
                    {renderMessage(msg.content)}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  variant={isBold ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsBold(!isBold)}
                  className={isBold ? "bg-orange-500 hover:bg-orange-600" : ""}
                >
                  <strong>B</strong>
                </Button>
                <Button
                  type="button"
                  variant={isHeading ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsHeading(!isHeading)}
                  className={isHeading ? "bg-orange-500 hover:bg-orange-600" : ""}
                >
                  <strong>H</strong>
                </Button>
              </div>

              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 min-h-[80px] border-orange-500/30 focus:border-orange-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={!message.trim() || sendMessage.isPending}
                  className="self-end bg-orange-500 hover:bg-orange-600"
                >
                  Send 🎃
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
