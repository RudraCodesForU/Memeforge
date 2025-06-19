import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CloudUpload, Wand2, Type } from "lucide-react";
import type { Template, Sticker } from "@shared/schema";
import type { MemeCanvasRef } from "./MemeCanvas";

interface SidebarProps {
  canvasRef: React.RefObject<MemeCanvasRef>;
}

export default function Sidebar({ canvasRef }: SidebarProps) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [textContent, setTextContent] = useState("");
  const [fontSize, setFontSize] = useState("24");
  const [fontWeight, setFontWeight] = useState("700");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textPosition, setTextPosition] = useState("top");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates/popular"],
  });

  // Fetch stickers
  const { data: stickers = [], isLoading: stickersLoading } = useQuery<Sticker[]>({
    queryKey: ["/api/stickers"],
  });

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiRequest("POST", "/api/upload", formData);
      return response.json();
    },
    onSuccess: (data) => {
      canvasRef.current?.addImage(data.url);
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // AI meme generation mutation
  const generateMemeMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest("POST", "/api/generate-meme", { prompt });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.imageUrl) {
        canvasRef.current?.addImage(data.imageUrl);
      }
      if (data.suggestedText) {
        if (data.suggestedText.top) {
          canvasRef.current?.addText(data.suggestedText.top, { top: 50 });
        }
        if (data.suggestedText.bottom) {
          canvasRef.current?.addText(data.suggestedText.bottom, { top: 450 });
        }
      }
      toast({
        title: "Meme Generated!",
        description: "Your AI-powered meme is ready for editing.",
      });
      setAiPrompt("");
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      uploadMutation.mutate(file);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    canvasRef.current?.addImage(template.imageUrl);
    toast({
      title: "Template Added",
      description: `${template.name} template added to canvas.`,
    });
  };

  const handleStickerAdd = (sticker: Sticker) => {
    canvasRef.current?.addImage(sticker.imageUrl, { 
      scaleX: 0.2, 
      scaleY: 0.2,
      left: 400,
      top: 400
    });
    toast({
      title: "Sticker Added",
      description: `${sticker.name} sticker added to canvas.`,
    });
  };

  const handleGenerateMeme = () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for your meme.",
        variant: "destructive",
      });
      return;
    }
    generateMemeMutation.mutate(aiPrompt);
  };

  const handleAddText = () => {
    if (!textContent.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter some text to add.",
        variant: "destructive",
      });
      return;
    }

    const positions = {
      top: { top: 50 },
      center: { top: 250 },
      bottom: { top: 450 }
    };

    canvasRef.current?.addText(textContent, {
      fontSize: parseInt(fontSize),
      fontWeight: parseInt(fontWeight),
      fill: textColor,
      ...positions[textPosition as keyof typeof positions]
    });

    setTextContent("");
    toast({
      title: "Text Added",
      description: "Text layer added to canvas.",
    });
  };

  return (
    <aside className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tools & Assets</h2>
        
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="stickers">Stickers</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6 mt-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Popular Templates</h3>
              {templatesLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-lg p-2 animate-pulse">
                      <div className="w-full h-20 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="p-2">
                        <img
                          src={template.imageUrl}
                          alt={template.name}
                          className="w-full h-20 object-cover rounded mb-1"
                        />
                        <p className="text-xs text-gray-600 text-center truncate">
                          {template.name}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Upload Your Own</h3>
              <Card
                className="border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer transition-colors duration-200"
                onClick={() => fileInputRef.current?.click()}
              >
                <CardContent className="p-6 text-center">
                  <CloudUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Drag & drop or click to upload</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                </CardContent>
              </Card>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* AI Generation */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">AI-Generated Memes</h3>
              <Card className="gradient-brand text-white">
                <CardContent className="p-4">
                  <Wand2 className="w-6 h-6 mb-2" />
                  <p className="text-sm mb-3">Describe your meme idea and let AI create it!</p>
                  <Textarea
                    placeholder="e.g., A cat looking confused at a computer screen..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder-white/70 resize-none"
                    rows={3}
                  />
                  <Button
                    onClick={handleGenerateMeme}
                    disabled={generateMemeMutation.isPending}
                    className="w-full mt-3 bg-white text-primary hover:bg-gray-100"
                  >
                    {generateMemeMutation.isPending ? "Generating..." : "Generate Meme"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Stickers Tab */}
          <TabsContent value="stickers" className="space-y-6 mt-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Funny Stickers</h3>
              {stickersLoading ? (
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-lg p-2 animate-pulse">
                      <div className="w-full h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto custom-scrollbar">
                  {stickers.map((sticker) => (
                    <Card
                      key={sticker.id}
                      className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                      onClick={() => handleStickerAdd(sticker)}
                    >
                      <CardContent className="p-2">
                        <img
                          src={sticker.imageUrl}
                          alt={sticker.name}
                          className="w-full h-16 object-cover rounded"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Text Tab */}
          <TabsContent value="text" className="space-y-4 mt-6">
            <div>
              <Label htmlFor="text-content" className="text-sm font-medium text-gray-700">
                Text Content
              </Label>
              <Textarea
                id="text-content"
                placeholder="Enter your meme text..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="font-size" className="text-sm font-medium text-gray-700">
                  Font Size
                </Label>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16">Small</SelectItem>
                    <SelectItem value="24">Medium</SelectItem>
                    <SelectItem value="32">Large</SelectItem>
                    <SelectItem value="48">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="font-weight" className="text-sm font-medium text-gray-700">
                  Font Weight
                </Label>
                <Select value={fontWeight} onValueChange={setFontWeight}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="400">Normal</SelectItem>
                    <SelectItem value="600">Semi-Bold</SelectItem>
                    <SelectItem value="700">Bold</SelectItem>
                    <SelectItem value="800">Extra Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="text-color" className="text-sm font-medium text-gray-700">
                Text Color
              </Label>
              <div className="flex space-x-2 mt-2">
                {["#ffffff", "#000000", "#ef4444", "#3b82f6", "#10b981"].map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 transition-colors duration-200 ${
                      textColor === color ? "border-primary" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setTextColor(color)}
                  />
                ))}
                <Input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 p-0 border-2 border-gray-300 rounded-full"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Text Position</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { value: "top", label: "Top" },
                  { value: "center", label: "Center" },
                  { value: "bottom", label: "Bottom" }
                ].map((position) => (
                  <Button
                    key={position.value}
                    variant={textPosition === position.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTextPosition(position.value)}
                    className="text-xs"
                  >
                    {position.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button onClick={handleAddText} className="w-full" disabled={!textContent.trim()}>
              <Type className="w-4 h-4 mr-2" />
              Add Text Layer
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}
