import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authenticatedApiRequest, useAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StarRating from "@/components/star-rating";
import CommentSection from "@/components/comment-section";
import { useToast } from "@/hooks/use-toast";
import type { Game, Rating } from "@shared/schema";

interface GameModalProps {
  game: Game;
  onClose: () => void;
}

interface RatingsData {
  ratings: Rating[];
  average: number;
}

export default function GameModal({ game, onClose }: GameModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userRating, setUserRating] = useState(0);
  const [review, setReview] = useState("");
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const { data: ratingsData } = useQuery<RatingsData>({
    queryKey: ["/api/ratings", game.id],
  });

  const { data: userRatingsData } = useQuery<Rating[]>({
    queryKey: ["/api/ratings/user", user?.id],
    enabled: !!user,
  });

  const existingRating = userRatingsData?.find(r => r.gameId === game.id);

  const submitRating = useMutation({
    mutationFn: async () => {
      await authenticatedApiRequest("POST", "/api/ratings", {
        gameId: game.id,
        rating: userRating,
        review: review || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ratings"] });
      toast({
        title: "Rating submitted",
        description: "Your rating has been saved",
      });
      setShowRatingForm(false);
      setReview("");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to submit rating",
        description: error.message,
      });
    },
  });

  const handleDownload = () => {
    setShowDisclaimer(true);
  };

  const proceedDownload = () => {
    if (game.downloadUrl) {
      window.open(game.downloadUrl, "_blank");
    }
    setShowDisclaimer(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        data-testid={`modal-game-${game.id}`}
      >
        <div className="relative h-64">
          <img
            src={game.imageUrl || "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400"}
            alt={game.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent"></div>
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-lg flex items-center justify-center transition-colors"
            onClick={onClose}
            data-testid="button-close-modal"
          >
            <i className="fas fa-times text-white"></i>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2" data-testid="text-modal-title">{game.title}</h2>
            </div>
            <Button onClick={handleDownload} data-testid="button-modal-download">
              <i className="fas fa-download mr-2"></i>Download
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-lg">{game.genre}</span>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Description</h3>
            <p className="text-muted-foreground" data-testid="text-modal-description">{game.description}</p>
          </div>

          {(game.minRequirements || game.recRequirements) && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">System Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {game.minRequirements && (
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Minimum</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{game.minRequirements}</p>
                  </div>
                )}
                {game.recRequirements && (
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Recommended</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{game.recRequirements}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <CommentSection gameId={game.id} />
        </div>
      </div>

      <AlertDialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-yellow-500"></i>
              Legal Disclaimer & Terms of Use
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left space-y-4 text-base">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="font-semibold text-foreground mb-2">⚠️ IMPORTANT - READ CAREFULLY</p>
                <p>By proceeding with this download, you acknowledge and agree to the following terms:</p>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-foreground">📚 Educational & Viewing Purposes Only</p>
                  <p className="text-sm">This content is provided strictly for educational, research, and personal viewing purposes. It is intended for learning and reference only.</p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">🚫 Anti-Piracy Statement</p>
                  <p className="text-sm">We do NOT condone, support, or encourage piracy in any form. We strongly oppose copyright infringement and illegal distribution of protected content. Users must own legitimate licenses for any software they download.</p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">⚖️ User Responsibility & Liability</p>
                  <p className="text-sm">You are solely responsible for how you use the downloaded content. We are NOT liable for any actions you take with this content. We expressly disclaim all responsibility for any misuse, illegal activities, or copyright violations committed by users.</p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">🛡️ Legal Compliance</p>
                  <p className="text-sm">You must comply with all applicable laws, including copyright laws, in your jurisdiction. Downloading or using copyrighted material without proper authorization may be illegal in your country.</p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">📝 No Warranty or Guarantee</p>
                  <p className="text-sm">Content is provided "AS IS" without any warranties. We make no guarantees about accuracy, safety, or legality of the content. Use at your own risk.</p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">🔒 Indemnification</p>
                  <p className="text-sm">By downloading, you agree to indemnify and hold harmless this platform, its operators, and affiliates from any claims, damages, or legal actions arising from your use of the downloaded content.</p>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="font-semibold text-foreground text-sm">🚨 Final Warning</p>
                  <p className="text-sm">If you do not agree with these terms or cannot legally download this content in your jurisdiction, you must NOT proceed. Clicking "I Agree" confirms your acceptance of full responsibility.</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>I Do Not Agree</AlertDialogCancel>
            <AlertDialogAction onClick={proceedDownload}>
              I Agree & Accept Full Responsibility
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
