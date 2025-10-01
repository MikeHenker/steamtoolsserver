import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authenticatedApiRequest, useAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Comment } from "@shared/schema";

interface CommentSectionProps {
  gameId: string;
}

export default function CommentSection({ gameId }: CommentSectionProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/comments", gameId],
  });

  const createComment = useMutation({
    mutationFn: async (content: string) => {
      await authenticatedApiRequest("POST", "/api/comments", { gameId, content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", gameId] });
      setContent("");
    },
  });

  const likeComment = useMutation({
    mutationFn: async (commentId: string) => {
      await authenticatedApiRequest("POST", `/api/comments/${commentId}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", gameId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      createComment.mutate(content);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Comments</h3>

      <div className="bg-secondary/50 rounded-lg p-4 mb-4">
        <form onSubmit={handleSubmit}>
          <Textarea
            placeholder="Share your thoughts..."
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-transparent border-none focus:outline-none resize-none"
            data-testid="textarea-comment"
          />
          <div className="flex items-center justify-end mt-2">
            <Button type="submit" size="sm" disabled={createComment.isPending} data-testid="button-post-comment">
              Post Comment
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start space-x-3" data-testid={`comment-${comment.id}`}>
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🎮</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold">User</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt!).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2" data-testid={`comment-content-${comment.id}`}>
                {comment.content}
              </p>
              <div className="flex items-center space-x-3">
                <button
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => likeComment.mutate(comment.id)}
                  data-testid={`button-like-${comment.id}`}
                >
                  <i className="fas fa-thumbs-up mr-1"></i>
                  {comment.likes || 0}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
