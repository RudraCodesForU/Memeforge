import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import MemeCanvas from "@/components/MemeCanvas";
import Sidebar from "@/components/Sidebar";
import PropertiesPanel from "@/components/PropertiesPanel";
import ShareModal from "@/components/ShareModal";
import { useMemeEditor } from "@/hooks/useMemeEditor";
import { Download, Share2, User, Undo, Redo, ZoomIn, ZoomOut } from "lucide-react";

export default function MemeEditor() {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [canvasSize, setCanvasSize] = useState<"square" | "landscape" | "portrait">("square");
  
  const {
    canvasRef,
    selectedObject,
    canvasData,
    zoom,
    history,
    undo,
    redo,
    zoomIn,
    zoomOut,
    exportMeme,
    saveMeme,
    clearCanvas,
    isLoading
  } = useMemeEditor();

  const handleExport = async () => {
    try {
      await exportMeme();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleCanvasSizeChange = (size: "square" | "landscape" | "portrait") => {
    setCanvasSize(size);
    if (canvasRef.current) {
      const dimensions = {
        square: { width: 500, height: 500 },
        landscape: { width: 600, height: 400 },
        portrait: { width: 400, height: 600 }
      };
      
      const { width, height } = dimensions[size];
      canvasRef.current.setDimensions({ width, height });
      canvasRef.current.renderAll();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">M</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                MemeForge
              </h1>
            </div>

            {/* Main Actions */}
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleExport}
                className="bg-success hover:bg-success/90 text-success-foreground"
                disabled={isLoading}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                onClick={handleShare}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="icon" className="w-10 h-10">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar canvasRef={canvasRef} />

        {/* Main Editor */}
        <main className="flex-1 flex flex-col">
          {/* Editor Toolbar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={undo}
                  disabled={!history.canUndo}
                  className="text-gray-600 hover:text-primary"
                >
                  <Undo className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={redo}
                  disabled={!history.canRedo}
                  className="text-gray-600 hover:text-primary"
                >
                  <Redo className="w-5 h-5" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={zoomOut}
                  className="text-gray-600 hover:text-primary"
                >
                  <ZoomOut className="w-5 h-5" />
                </Button>
                <span className="text-sm text-gray-600 font-medium min-w-[4rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={zoomIn}
                  className="text-gray-600 hover:text-primary"
                >
                  <ZoomIn className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={canvasSize === "square" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleCanvasSizeChange("square")}
                    className="text-xs"
                  >
                    Square
                  </Button>
                  <Button
                    variant={canvasSize === "landscape" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleCanvasSizeChange("landscape")}
                    className="text-xs"
                  >
                    Landscape
                  </Button>
                  <Button
                    variant={canvasSize === "portrait" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleCanvasSizeChange("portrait")}
                    className="text-xs"
                  >
                    Portrait
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 canvas-container bg-gray-100 p-8 overflow-auto">
            <div className="flex items-center justify-center min-h-full">
              <MemeCanvas ref={canvasRef} />
            </div>
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center animate-fade-in">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Generating Your Meme</h3>
                <p className="text-gray-600 text-sm">AI is working its magic...</p>
              </div>
            </div>
          )}
        </main>

        {/* Properties Panel */}
        <PropertiesPanel 
          selectedObject={selectedObject}
          canvasRef={canvasRef}
          onSave={saveMeme}
          onClear={clearCanvas}
        />
      </div>

      {/* Share Modal */}
      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        canvasData={canvasData}
      />
    </div>
  );
}
