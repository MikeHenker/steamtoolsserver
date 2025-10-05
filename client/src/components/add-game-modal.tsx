import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authenticatedApiRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AddGameModalProps {
  onClose: () => void;
}

export default function AddGameModal({ onClose }: AddGameModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    genre: "Action",
    imageUrl: "",
    downloadUrl: "",
    steamId: "",
    minRequirements: "",
    recRequirements: "",
    verified: true,
    featured: false,
  });

  const createGame = useMutation({
    mutationFn: async (data: typeof formData) => {
      await authenticatedApiRequest("POST", "/api/games", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({
        title: "Game added",
        description: "The game has been added successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to add game",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGame.mutate(formData);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        data-testid="modal-add-game"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-2xl font-bold">Add New Game</h2>
          <button
            className="w-10 h-10 hover:bg-secondary rounded-lg flex items-center justify-center transition-colors"
            onClick={onClose}
            data-testid="button-close-modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                data-testid="input-title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Short Description</label>
              <Input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                data-testid="input-short-description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Full Description *</label>
              <Textarea
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                data-testid="textarea-description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Genre *</label>
              <Select
                value={formData.genre}
                onValueChange={(value) => setFormData({ ...formData, genre: value })}
              >
                <SelectTrigger data-testid="select-genre">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Action">Action</SelectItem>
                  <SelectItem value="RPG">RPG</SelectItem>
                  <SelectItem value="Strategy">Strategy</SelectItem>
                  <SelectItem value="Racing">Racing</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Adventure">Adventure</SelectItem>
                  <SelectItem value="Simulation">Simulation</SelectItem>
                  <SelectItem value="Puzzle">Puzzle</SelectItem>
                  <SelectItem value="Horror">Horror</SelectItem>
                  <SelectItem value="FPS">FPS</SelectItem>
                  <SelectItem value="MOBA">MOBA</SelectItem>
                  <SelectItem value="MMO">MMO</SelectItem>
                  <SelectItem value="Indie">Indie</SelectItem>
                  <SelectItem value="Fighting">Fighting</SelectItem>
                  <SelectItem value="Platformer">Platformer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Image URL *</label>
              <Input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                required
                placeholder="https://example.com/image.jpg"
                data-testid="input-image-url"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Download URL *</label>
              <Input
                type="url"
                value={formData.downloadUrl}
                onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                required
                placeholder="https://example.com/download"
                data-testid="input-download-url"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Steam ID (Optional)</label>
              <Input
                type="text"
                value={formData.steamId}
                onChange={(e) => setFormData({ ...formData, steamId: e.target.value })}
                placeholder="e.g., 730"
                data-testid="input-steam-id"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Minimum Requirements</label>
              <Textarea
                rows={4}
                value={formData.minRequirements}
                onChange={(e) => setFormData({ ...formData, minRequirements: e.target.value })}
                placeholder="OS: Windows 10&#10;CPU: Intel i5&#10;RAM: 8GB&#10;GPU: GTX 1060"
                data-testid="textarea-min-requirements"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Recommended Requirements</label>
              <Textarea
                rows={4}
                value={formData.recRequirements}
                onChange={(e) => setFormData({ ...formData, recRequirements: e.target.value })}
                placeholder="OS: Windows 11&#10;CPU: Intel i7&#10;RAM: 16GB&#10;GPU: RTX 3060"
                data-testid="textarea-rec-requirements"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4"
                  data-testid="checkbox-featured"
                />
                <span className="text-sm">Featured Game</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6">
            <Button type="button" variant="ghost" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button type="submit" disabled={createGame.isPending} data-testid="button-submit-game">
              {createGame.isPending ? "Adding..." : "Add Game"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
