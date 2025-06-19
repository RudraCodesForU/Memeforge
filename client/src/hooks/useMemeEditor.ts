import { useRef, useState, useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { MemeCanvasRef } from "@/components/MemeCanvas";

interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
}

export function useMemeEditor() {
  const canvasRef = useRef<MemeCanvasRef>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [canvasData, setCanvasData] = useState<string>("");
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<HistoryState>({ canUndo: false, canRedo: false });
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Save meme mutation
  const saveMutation = useMutation({
    mutationFn: async (memeData: any) => {
      const response = await apiRequest("POST", "/api/memes", memeData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Meme Saved",
        description: "Your meme has been saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/memes"] });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Export meme mutation
  const exportMutation = useMutation({
    mutationFn: async (exportData: any) => {
      const response = await apiRequest("POST", "/api/export-meme", exportData);
      const blob = await response.blob();
      
      // Create download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meme.${exportData.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: "Export Complete",
        description: "Your meme has been downloaded!",
      });
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Set up canvas listeners (simplified for HTML5 canvas)
  useEffect(() => {
    // For the simplified canvas implementation, we'll handle updates differently
    const updateCanvasData = () => {
      const dataUrl = canvasRef.current?.exportAsDataURL();
      if (dataUrl) {
        setCanvasData(dataUrl);
      }
      
      setHistory({
        canUndo: true,
        canRedo: false
      });
    };

    // Update canvas data periodically or on user interactions
    const interval = setInterval(updateCanvasData, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const undo = useCallback(() => {
    // In a real implementation, you'd maintain a history stack
    toast({
      title: "Undo",
      description: "Undo functionality would be implemented with proper history management.",
    });
  }, [toast]);

  const redo = useCallback(() => {
    // In a real implementation, you'd maintain a history stack
    toast({
      title: "Redo",
      description: "Redo functionality would be implemented with proper history management.",
    });
  }, [toast]);

  const zoomIn = useCallback(() => {
    const newZoom = Math.min(zoom * 1.2, 3);
    setZoom(newZoom);
    
    toast({
      title: "Zoomed In",
      description: `Zoom level: ${Math.round(newZoom * 100)}%`,
    });
  }, [zoom, toast]);

  const zoomOut = useCallback(() => {
    const newZoom = Math.max(zoom / 1.2, 0.1);
    setZoom(newZoom);
    
    toast({
      title: "Zoomed Out", 
      description: `Zoom level: ${Math.round(newZoom * 100)}%`,
    });
  }, [zoom, toast]);

  const exportMeme = useCallback(async (options = {}) => {
    const dataUrl = canvasRef.current?.exportAsDataURL();
    if (!dataUrl) {
      toast({
        title: "Export Failed",
        description: "No canvas data to export.",
        variant: "destructive",
      });
      return;
    }

    const exportData = {
      canvasData: dataUrl,
      format: "png",
      quality: "medium",
      optimizeFor: "social",
      ...options
    };

    exportMutation.mutate(exportData);
  }, [exportMutation, toast]);

  const saveMeme = useCallback(async () => {
    const dataUrl = canvasRef.current?.exportAsDataURL();
    if (!dataUrl) {
      toast({
        title: "Save Failed",
        description: "No canvas data to save.",
        variant: "destructive",
      });
      return;
    }

    const canvas = canvasRef.current?.getCanvas();
    const memeData = {
      title: `Meme ${new Date().toLocaleString()}`,
      imageUrl: dataUrl,
      canvasData: dataUrl, // Use the canvas data URL directly
      metadata: {
        width: canvas?.width || 500,
        height: canvas?.height || 500,
        zoom
      },
      tags: ["custom"],
      isPublic: false
    };

    saveMutation.mutate(memeData);
  }, [saveMutation, toast, zoom]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas();
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#f3f4f6";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      setSelectedObject(null);
      setCanvasData("");
      
      toast({
        title: "Canvas Cleared",
        description: "Canvas has been reset.",
      });
    }
  }, [toast]);

  return {
    canvasRef,
    selectedObject,
    canvasData,
    zoom,
    history,
    isLoading: isLoading || saveMutation.isPending || exportMutation.isPending,
    undo,
    redo,
    zoomIn,
    zoomOut,
    exportMeme,
    saveMeme,
    clearCanvas,
  };
}
