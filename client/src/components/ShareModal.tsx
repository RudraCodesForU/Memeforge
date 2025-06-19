import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Share2, Link, Twitter, Facebook, MessageCircle, Copy } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasData?: string;
}

export default function ShareModal({ isOpen, onClose, canvasData }: ShareModalProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleShareToTwitter = async () => {
    setIsSharing(true);
    try {
      const text = "Check out this awesome meme I created with MemeForge! 🔥";
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
      
      toast({
        title: "Shared to Twitter",
        description: "Your meme is ready to be tweeted!",
      });
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Unable to share to Twitter.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareToFacebook = async () => {
    setIsSharing(true);
    try {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
      window.open(url, "_blank");
      
      toast({
        title: "Shared to Facebook",
        description: "Your meme is ready to be shared!",
      });
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Unable to share to Facebook.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareToReddit = async () => {
    setIsSharing(true);
    try {
      const title = "Check out this meme I made!";
      const url = `https://www.reddit.com/submit?title=${encodeURIComponent(title)}`;
      window.open(url, "_blank");
      
      toast({
        title: "Shared to Reddit",
        description: "Your meme is ready to be posted!",
      });
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Unable to share to Reddit.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Meme link copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadAndShare = async () => {
    if (!canvasData) return;
    
    try {
      // Convert data URL to blob
      const response = await fetch(canvasData);
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meme.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Your meme is being downloaded!",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download meme.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 gradient-brand rounded-full flex items-center justify-center">
              <Share2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            Share Your Meme
          </DialogTitle>
          <p className="text-center text-gray-600">
            Spread the laughter across the internet!
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Social Media Sharing */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Share on Social Media</h4>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto space-y-2 hover:bg-blue-50 hover:border-blue-200"
                onClick={handleShareToTwitter}
                disabled={isSharing}
              >
                <Twitter className="w-6 h-6 text-blue-500" />
                <span className="text-xs">Twitter</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto space-y-2 hover:bg-blue-50 hover:border-blue-200"
                onClick={handleShareToFacebook}
                disabled={isSharing}
              >
                <Facebook className="w-6 h-6 text-blue-600" />
                <span className="text-xs">Facebook</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto space-y-2 hover:bg-orange-50 hover:border-orange-200"
                onClick={handleShareToReddit}
                disabled={isSharing}
              >
                <MessageCircle className="w-6 h-6 text-orange-500" />
                <span className="text-xs">Reddit</span>
              </Button>
            </div>
          </div>

          {/* Direct Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full"
            >
              <Link className="w-4 h-4 mr-2" />
              Copy Link
            </Button>

            {canvasData && (
              <Button
                onClick={handleDownloadAndShare}
                className="w-full bg-success hover:bg-success/90 text-success-foreground"
              >
                <Copy className="w-4 h-4 mr-2" />
                Download & Share
              </Button>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
