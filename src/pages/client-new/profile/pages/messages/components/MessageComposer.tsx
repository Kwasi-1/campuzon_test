import { ImagePlus, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SelectedImage } from "./types";

type MessageComposerProps = {
  newMessage: string;
  selectedImage: SelectedImage | null;
  isSending: boolean;
  onChangeMessage: (value: string) => void;
  onSendMessage: () => void;
  onPickImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
};

export function MessageComposer({
  newMessage,
  selectedImage,
  isSending,
  onChangeMessage,
  onSendMessage,
  onPickImage,
  onRemoveImage,
  fileInputRef,
}: MessageComposerProps) {
  return (
    <div className="p-4 bg-background border-t">
      {selectedImage && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-border p-2 bg-muted/40">
          <img
            src={selectedImage.previewUrl}
            alt="Attachment preview"
            className="h-12 w-12 rounded object-cover"
          />
          <span className="text-xs text-muted-foreground max-w-[180px] truncate">
            {selectedImage.file.name}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          aria-label="Attach an image"
          title="Attach an image"
          className="hidden"
          onChange={onPickImage}
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
        >
          <ImagePlus className="h-4 w-4" />
        </Button>

        <Input
          value={newMessage}
          onChange={(e) => onChangeMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSendMessage();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 rounded-full"
        />

        <Button
          onClick={onSendMessage}
          disabled={isSending || (!newMessage.trim() && !selectedImage)}
          className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
