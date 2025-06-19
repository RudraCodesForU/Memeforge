import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Save, Trash2, Eye, EyeOff, Type, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { MemeCanvasRef } from "./MemeCanvas";

interface PropertiesPanelProps {
  selectedObject: any;
  canvasRef: React.RefObject<MemeCanvasRef>;
  onSave: () => void;
  onClear: () => void;
}

export default function PropertiesPanel({ 
  selectedObject, 
  canvasRef, 
  onSave, 
  onClear 
}: PropertiesPanelProps) {
  const [exportFormat, setExportFormat] = useState<"png" | "jpg" | "gif">("png");
  const [exportQuality, setExportQuality] = useState<"low" | "medium" | "high">("medium");
  const [optimizeFor, setOptimizeFor] = useState<"social" | "print">("social");
  const [layers, setLayers] = useState<any[]>([]);
  
  const { toast } = useToast();

  // Object properties state
  const [objProps, setObjProps] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    rotation: 0,
    opacity: 100
  });

  useEffect(() => {
    if (selectedObject) {
      setObjProps({
        left: Math.round(selectedObject.left || 0),
        top: Math.round(selectedObject.top || 0),
        width: Math.round((selectedObject.width || 0) * (selectedObject.scaleX || 1)),
        height: Math.round((selectedObject.height || 0) * (selectedObject.scaleY || 1)),
        rotation: Math.round(selectedObject.angle || 0),
        opacity: Math.round((selectedObject.opacity || 1) * 100)
      });
    }
  }, [selectedObject]);

  useEffect(() => {
    const canvas = canvasRef.current?.getCanvas();
    if (canvas) {
      const updateLayers = () => {
        const objects = canvas.getObjects();
        setLayers(objects.map((obj, index) => ({
          id: index,
          type: obj.type,
          name: obj.type === 'text' ? `Text: ${(obj as any).text?.substring(0, 20)}...` : `${obj.type} ${index + 1}`,
          visible: obj.visible !== false,
          object: obj
        })));
      };

      canvas.on('object:added', updateLayers);
      canvas.on('object:removed', updateLayers);
      updateLayers();

      return () => {
        canvas.off('object:added', updateLayers);
        canvas.off('object:removed', updateLayers);
      };
    }
  }, [canvasRef]);

  const updateObjectProperty = (property: string, value: number) => {
    const canvas = canvasRef.current?.getCanvas();
    if (canvas && selectedObject) {
      const updates: any = {};
      
      if (property === 'left' || property === 'top') {
        updates[property] = value;
      } else if (property === 'width' || property === 'height') {
        const currentScale = property === 'width' ? selectedObject.scaleX : selectedObject.scaleY;
        const originalSize = property === 'width' ? selectedObject.width : selectedObject.height;
        updates[property === 'width' ? 'scaleX' : 'scaleY'] = value / originalSize;
      } else if (property === 'rotation') {
        updates.angle = value;
      } else if (property === 'opacity') {
        updates.opacity = value / 100;
      }

      selectedObject.set(updates);
      canvas.renderAll();
      setObjProps(prev => ({ ...prev, [property]: value }));
    }
  };

  const toggleLayerVisibility = (layer: any) => {
    const canvas = canvasRef.current?.getCanvas();
    if (canvas) {
      layer.object.visible = !layer.object.visible;
      canvas.renderAll();
      setLayers(prev => prev.map(l => 
        l.id === layer.id ? { ...l, visible: layer.object.visible } : l
      ));
    }
  };

  const deleteLayer = (layer: any) => {
    const canvas = canvasRef.current?.getCanvas();
    if (canvas) {
      canvas.remove(layer.object);
      canvas.renderAll();
      toast({
        title: "Layer Deleted",
        description: "Layer has been removed from the canvas.",
      });
    }
  };

  const selectLayer = (layer: any) => {
    const canvas = canvasRef.current?.getCanvas();
    if (canvas) {
      canvas.setActiveObject(layer.object);
      canvas.renderAll();
    }
  };

  const handleOptimizeFor = (platform: "social" | "print") => {
    setOptimizeFor(platform);
    toast({
      title: "Export Settings Updated",
      description: `Optimized for ${platform === "social" ? "social media" : "print"}.`,
    });
  };

  return (
    <aside className="w-80 bg-white shadow-lg border-l border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Properties</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* Layer Management */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Layers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {layers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No layers yet</p>
            ) : (
              layers.map((layer) => (
                <div
                  key={layer.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                    selectedObject === layer.object
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                  }`}
                  onClick={() => selectLayer(layer)}
                >
                  <div className="flex items-center space-x-3">
                    {layer.type === "text" ? (
                      <Type className="w-4 h-4 text-primary" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {layer.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerVisibility(layer);
                      }}
                      className="w-6 h-6 p-0"
                    >
                      {layer.visible ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLayer(layer);
                      }}
                      className="w-6 h-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Element Properties */}
        {selectedObject && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                Selected Element
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="pos-x" className="text-xs font-medium text-gray-600">
                    X Position
                  </Label>
                  <Input
                    id="pos-x"
                    type="number"
                    value={objProps.left}
                    onChange={(e) => updateObjectProperty('left', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="pos-y" className="text-xs font-medium text-gray-600">
                    Y Position
                  </Label>
                  <Input
                    id="pos-y"
                    type="number"
                    value={objProps.top}
                    onChange={(e) => updateObjectProperty('top', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="width" className="text-xs font-medium text-gray-600">
                    Width
                  </Label>
                  <Input
                    id="width"
                    type="number"
                    value={objProps.width}
                    onChange={(e) => updateObjectProperty('width', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-xs font-medium text-gray-600">
                    Height
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={objProps.height}
                    onChange={(e) => updateObjectProperty('height', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-600 mb-2 block">
                  Rotation: {objProps.rotation}°
                </Label>
                <Slider
                  value={[objProps.rotation]}
                  onValueChange={([value]) => updateObjectProperty('rotation', value)}
                  max={360}
                  min={0}
                  step={1}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-600 mb-2 block">
                  Opacity: {objProps.opacity}%
                </Label>
                <Slider
                  value={[objProps.opacity]}
                  onValueChange={([value]) => updateObjectProperty('opacity', value)}
                  max={100}
                  min={0}
                  step={1}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Export Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="format" className="text-xs font-medium text-gray-600">
                Format
              </Label>
              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG (Best Quality)</SelectItem>
                  <SelectItem value="jpg">JPG (Smaller Size)</SelectItem>
                  <SelectItem value="gif">GIF (Animated)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quality" className="text-xs font-medium text-gray-600">
                Quality
              </Label>
              <Select value={exportQuality} onValueChange={(value: any) => setExportQuality(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High (Large file)</SelectItem>
                  <SelectItem value="medium">Medium (Balanced)</SelectItem>
                  <SelectItem value="low">Low (Small file)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-600 mb-2 block">
                Optimize for
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={optimizeFor === "social" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleOptimizeFor("social")}
                  className="text-xs"
                >
                  Social Media
                </Button>
                <Button
                  variant={optimizeFor === "print" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleOptimizeFor("print")}
                  className="text-xs"
                >
                  Print
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button onClick={onSave} className="w-full bg-gray-600 hover:bg-gray-700">
            <Save className="w-4 h-4 mr-2" />
            Save Project
          </Button>
          
          <Button 
            onClick={onClear} 
            variant="outline" 
            className="w-full border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Canvas
          </Button>
        </div>
      </div>
    </aside>
  );
}
