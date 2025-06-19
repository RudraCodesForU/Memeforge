import { forwardRef, useEffect, useRef, useImperativeHandle, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface MemeCanvasProps {
  className?: string;
}

export interface MemeCanvasRef {
  getCanvas: () => HTMLCanvasElement | null;
  addText: (text: string, options?: any) => void;
  addImage: (imageUrl: string, options?: any) => void;
  exportAsDataURL: (format?: string) => string;
  setDimensions: (dimensions: { width: number; height: number }) => void;
  renderAll: () => void;
}

interface CanvasElement {
  type: 'text' | 'image';
  content: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  width?: number;
  height?: number;
}

const MemeCanvas = forwardRef<MemeCanvasRef, MemeCanvasProps>(({ className }, ref) => {
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const { toast } = useToast();

  const drawCanvas = () => {
    if (!canvasElementRef.current) return;
    
    const canvas = canvasElementRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background image if exists
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }
    
    // Draw elements
    elements.forEach(element => {
      if (element.type === 'text') {
        ctx.save();
        ctx.fillStyle = element.color || "#ffffff";
        ctx.font = `${element.fontSize || 32}px Inter, Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Draw stroke if specified
        if (element.strokeColor && element.strokeWidth) {
          ctx.strokeStyle = element.strokeColor;
          ctx.lineWidth = element.strokeWidth;
          ctx.strokeText(element.content, element.x, element.y);
        }
        
        ctx.fillText(element.content, element.x, element.y);
        ctx.restore();
      }
    });
    
    // Show placeholder if no elements
    if (elements.length === 0 && !backgroundImage) {
      ctx.fillStyle = "#6b7280";
      ctx.font = "24px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Start creating your meme!", canvas.width / 2, canvas.height / 2 - 25);
      
      ctx.fillStyle = "#9ca3af";
      ctx.font = "16px Inter, sans-serif";
      ctx.fillText("Select a template or upload your own image", canvas.width / 2, canvas.height / 2 + 25);
    }
  };

  useEffect(() => {
    if (!canvasElementRef.current) return;
    
    const canvas = canvasElementRef.current;
    canvas.width = 500;
    canvas.height = 500;
    
    drawCanvas();
  }, [elements, backgroundImage]);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasElementRef.current,
    
    addText: (text: string, options = {}) => {
      const newElement: CanvasElement = {
        type: 'text',
        content: text,
        x: 250,
        y: 100 + (elements.filter(e => e.type === 'text').length * 80),
        fontSize: 32,
        color: "#ffffff",
        strokeColor: "#000000",
        strokeWidth: 2,
        ...options,
      };
      
      setElements(prev => [...prev, newElement]);
      toast({
        title: "Text added",
        description: "Text has been added to your meme",
      });
    },
    
    addImage: (imageUrl: string, options = {}) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        setBackgroundImage(img);
        toast({
          title: "Image added",
          description: "Image has been added to your meme",
        });
      };
      img.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to load image",
          variant: "destructive",
        });
      };
      img.src = imageUrl;
    },
    
    exportAsDataURL: (format = 'png') => {
      if (!canvasElementRef.current) return '';
      return canvasElementRef.current.toDataURL(`image/${format}`);
    },
    
    setDimensions: (dimensions: { width: number; height: number }) => {
      if (!canvasElementRef.current) return;
      canvasElementRef.current.width = dimensions.width;
      canvasElementRef.current.height = dimensions.height;
      drawCanvas();
    },
    
    renderAll: () => {
      drawCanvas();
    },
  }));

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className || ''}`}>
      <canvas
        ref={canvasElementRef}
        className="block max-w-full h-auto"
        style={{ background: '#f3f4f6' }}
      />
    </div>
  );
});

MemeCanvas.displayName = "MemeCanvas";

export default MemeCanvas;