import { forwardRef, useEffect, useRef, useImperativeHandle } from "react";
import { fabric } from "fabric";
import { useToast } from "@/hooks/use-toast";

interface MemeCanvasProps {
  className?: string;
}

export interface MemeCanvasRef {
  getCanvas: () => fabric.Canvas | null;
  addText: (text: string, options?: any) => void;
  addImage: (imageUrl: string, options?: any) => void;
  exportAsDataURL: (format?: string) => string;
  setDimensions: (dimensions: { width: number; height: number }) => void;
  renderAll: () => void;
}

const MemeCanvas = forwardRef<MemeCanvasRef, MemeCanvasProps>(({ className }, ref) => {
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!canvasElementRef.current) return;

    // Initialize Fabric.js canvas
    const canvas = new fabric.Canvas(canvasElementRef.current, {
      width: 500,
      height: 500,
      backgroundColor: "#f3f4f6",
      selection: true,
      preserveObjectStacking: true,
    });

    canvasRef.current = canvas;

    // Add default placeholder
    const placeholderText = new fabric.Text("Start creating your meme!", {
      left: 250,
      top: 200,
      originX: "center",
      originY: "center",
      fontSize: 24,
      fontFamily: "Inter",
      fill: "#6b7280",
      selectable: false,
    });

    const instructionText = new fabric.Text("Select a template or upload your own image", {
      left: 250,
      top: 240,
      originX: "center",
      originY: "center",
      fontSize: 14,
      fontFamily: "Inter",
      fill: "#9ca3af",
      selectable: false,
    });

    canvas.add(placeholderText, instructionText);
    canvas.renderAll();

    // Event listeners
    canvas.on("selection:created", (e) => {
      const activeObject = e.selected?.[0];
      if (activeObject) {
        canvas.fire("object:selected", { target: activeObject });
      }
    });

    canvas.on("selection:updated", (e) => {
      const activeObject = e.selected?.[0];
      if (activeObject) {
        canvas.fire("object:selected", { target: activeObject });
      }
    });

    canvas.on("selection:cleared", () => {
      canvas.fire("object:deselected");
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    
    addText: (text: string, options = {}) => {
      if (!canvasRef.current) return;

      // Remove placeholder texts if they exist
      const objects = canvasRef.current.getObjects();
      objects.forEach(obj => {
        if (obj.selectable === false && obj.type === "text") {
          canvasRef.current?.remove(obj);
        }
      });

      const textObject = new fabric.Text(text, {
        left: 250,
        top: 100,
        originX: "center",
        originY: "center",
        fontSize: 32,
        fontFamily: "Inter",
        fontWeight: "bold",
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 2,
        textAlign: "center",
        ...options,
      });

      canvasRef.current.add(textObject);
      canvasRef.current.setActiveObject(textObject);
      canvasRef.current.renderAll();
    },
    
    addImage: (imageUrl: string, options = {}) => {
      if (!canvasRef.current) return;

      // Remove placeholder texts if they exist
      const objects = canvasRef.current.getObjects();
      objects.forEach(obj => {
        if (obj.selectable === false && obj.type === "text") {
          canvasRef.current?.remove(obj);
        }
      });

      fabric.Image.fromURL(
        imageUrl,
        (img) => {
          if (!canvasRef.current || !img) return;

          // Scale image to fit canvas
          const canvasWidth = canvasRef.current.getWidth();
          const canvasHeight = canvasRef.current.getHeight();
          
          const scale = Math.min(
            canvasWidth / (img.width || 1),
            canvasHeight / (img.height || 1)
          );

          img.set({
            scaleX: scale,
            scaleY: scale,
            left: canvasWidth / 2,
            top: canvasHeight / 2,
            originX: "center",
            originY: "center",
            ...options,
          });

          canvasRef.current.add(img);
          canvasRef.current.sendToBack(img);
          canvasRef.current.renderAll();
        },
        { crossOrigin: "anonymous" }
      );
    },
    
    exportAsDataURL: (format = "png") => {
      if (!canvasRef.current) return "";
      return canvasRef.current.toDataURL({ format, quality: 1 });
    },
    
    setDimensions: (dimensions: { width: number; height: number }) => {
      if (!canvasRef.current) return;
      canvasRef.current.setDimensions(dimensions);
    },
    
    renderAll: () => {
      if (canvasRef.current) {
        canvasRef.current.renderAll();
      }
    },
  }));

  return (
    <div className={`bg-white rounded-lg shadow-xl ${className}`}>
      <canvas ref={canvasElementRef} className="rounded-lg" />
    </div>
  );
});

MemeCanvas.displayName = "MemeCanvas";

export default MemeCanvas;
