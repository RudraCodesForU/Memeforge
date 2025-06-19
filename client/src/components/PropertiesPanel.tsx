import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Save, 
  Trash2, 
  Download, 
  Share2, 
  Eye, 
  Palette, 
  Type, 
  Image,
  Zap,
  Crown,
  Target,
  Megaphone,
  Calendar,
  TrendingUp,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube
} from "lucide-react";
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
  // Basic properties
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState("#ffffff");
  const [fontWeight, setFontWeight] = useState("700");
  const [textAlign, setTextAlign] = useState("center");
  const [opacity, setOpacity] = useState([100]);
  
  // Business properties
  const [brandName, setBrandName] = useState("");
  const [brandColor, setBrandColor] = useState("#3b82f6");
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkOpacity, setWatermarkOpacity] = useState([30]);
  
  // Social media optimization
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [campaignName, setCampaignName] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [callToAction, setCallToAction] = useState("");
  
  // Export settings
  const [exportFormat, setExportFormat] = useState("png");
  const [exportQuality, setExportQuality] = useState("high");
  const [exportSize, setExportSize] = useState("original");
  
  // Analytics tracking
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [campaignId, setCampaignId] = useState("");
  
  const platformDimensions = {
    instagram: { width: 1080, height: 1080, label: "Instagram Square" },
    facebook: { width: 1200, height: 630, label: "Facebook Post" },
    twitter: { width: 1200, height: 675, label: "Twitter Post" },
    linkedin: { width: 1200, height: 627, label: "LinkedIn Post" },
    youtube: { width: 1280, height: 720, label: "YouTube Thumbnail" },
    story: { width: 1080, height: 1920, label: "Instagram Story" },
    pinterest: { width: 1000, height: 1500, label: "Pinterest Pin" }
  };

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    const dimensions = platformDimensions[platform as keyof typeof platformDimensions];
    if (dimensions && canvasRef.current) {
      canvasRef.current.setDimensions(dimensions);
    }
  };

  const handleWatermarkToggle = (enabled: boolean) => {
    setWatermarkEnabled(enabled);
    if (enabled && watermarkText && canvasRef.current) {
      canvasRef.current.addText(watermarkText, {
        x: 20,
        y: 20,
        fontSize: 12,
        color: brandColor,
        opacity: watermarkOpacity[0] / 100
      });
    }
  };

  const handleBrandingApply = () => {
    if (!canvasRef.current) return;
    
    // Apply brand colors and styling
    if (brandColor) {
      // This would update selected text objects with brand colors
    }
    
    if (watermarkEnabled && watermarkText) {
      canvasRef.current.addText(watermarkText, {
        x: 20,
        y: 20,
        fontSize: 12,
        color: brandColor,
        opacity: watermarkOpacity[0] / 100
      });
    }
  };

  const handleExportForPlatform = async () => {
    if (!canvasRef.current) return;
    
    const dimensions = platformDimensions[selectedPlatform as keyof typeof platformDimensions];
    canvasRef.current.setDimensions(dimensions);
    
    // Export with platform-specific settings
    const dataUrl = canvasRef.current.exportAsDataURL(exportFormat);
    
    // Create download link
    const link = document.createElement('a');
    link.download = `${campaignName || 'meme'}_${selectedPlatform}.${exportFormat}`;
    link.href = dataUrl;
    link.click();
  };

  const generateHashtags = () => {
    const suggestions = [
      "#meme", "#viral", "#funny", "#trending", "#marketing",
      "#socialmedia", "#content", "#branding", "#digital", "#engagement"
    ];
    setHashtags(suggestions.slice(0, 5).join(" "));
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Properties</h2>
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Crown className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={onSave} size="sm" className="flex-1">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button 
            onClick={onClear} 
            variant="outline" 
            size="sm" 
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="design" className="w-full">
          <TabsList className="grid w-full grid-cols-4 m-2">
            <TabsTrigger value="design" className="text-xs">
              <Palette className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="branding" className="text-xs">
              <Crown className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="social" className="text-xs">
              <Megaphone className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs">
              <Download className="w-3 h-3" />
            </TabsTrigger>
          </TabsList>

          {/* Design Tab */}
          <TabsContent value="design" className="p-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Type className="w-4 h-4 mr-2" />
                  Text Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600">Font Size</Label>
                  <Slider
                    value={[fontSize]}
                    onValueChange={(value) => setFontSize(value[0])}
                    max={72}
                    min={8}
                    step={1}
                    className="mt-1"
                  />
                  <span className="text-xs text-gray-500">{fontSize}px</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-600">Color</Label>
                    <div className="flex items-center mt-1">
                      <input
                        type="color"
                        value={fontColor}
                        onChange={(e) => setFontColor(e.target.value)}
                        className="w-8 h-8 rounded border"
                      />
                      <Input
                        value={fontColor}
                        onChange={(e) => setFontColor(e.target.value)}
                        className="ml-2 text-xs"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Weight</Label>
                    <Select value={fontWeight} onValueChange={setFontWeight}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="400">Normal</SelectItem>
                        <SelectItem value="600">Semi Bold</SelectItem>
                        <SelectItem value="700">Bold</SelectItem>
                        <SelectItem value="800">Extra Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Alignment</Label>
                  <Select value={textAlign} onValueChange={setTextAlign}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Opacity</Label>
                  <Slider
                    value={opacity}
                    onValueChange={setOpacity}
                    max={100}
                    min={0}
                    step={5}
                    className="mt-1"
                  />
                  <span className="text-xs text-gray-500">{opacity[0]}%</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="p-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Crown className="w-4 h-4 mr-2" />
                  Brand Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600">Brand Name</Label>
                  <Input
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Your Brand Name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Brand Color</Label>
                  <div className="flex items-center mt-1">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-8 h-8 rounded border"
                    />
                    <Input
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="ml-2 text-xs"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label className="text-xs text-gray-600">Watermark</Label>
                  <Switch
                    checked={watermarkEnabled}
                    onCheckedChange={handleWatermarkToggle}
                  />
                </div>

                {watermarkEnabled && (
                  <>
                    <div>
                      <Label className="text-xs text-gray-600">Watermark Text</Label>
                      <Input
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        placeholder="© Your Brand"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-gray-600">Watermark Opacity</Label>
                      <Slider
                        value={watermarkOpacity}
                        onValueChange={setWatermarkOpacity}
                        max={100}
                        min={10}
                        step={5}
                        className="mt-1"
                      />
                      <span className="text-xs text-gray-500">{watermarkOpacity[0]}%</span>
                    </div>
                  </>
                )}

                <Button 
                  onClick={handleBrandingApply}
                  className="w-full mt-3"
                  size="sm"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Apply Branding
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social" className="p-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Platform Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600">Target Platform</Label>
                  <Select value={selectedPlatform} onValueChange={handlePlatformChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">
                        <div className="flex items-center">
                          <Instagram className="w-4 h-4 mr-2" />
                          Instagram Square
                        </div>
                      </SelectItem>
                      <SelectItem value="facebook">
                        <div className="flex items-center">
                          <Facebook className="w-4 h-4 mr-2" />
                          Facebook Post
                        </div>
                      </SelectItem>
                      <SelectItem value="twitter">
                        <div className="flex items-center">
                          <Twitter className="w-4 h-4 mr-2" />
                          Twitter Post
                        </div>
                      </SelectItem>
                      <SelectItem value="linkedin">
                        <div className="flex items-center">
                          <Linkedin className="w-4 h-4 mr-2" />
                          LinkedIn Post
                        </div>
                      </SelectItem>
                      <SelectItem value="youtube">
                        <div className="flex items-center">
                          <Youtube className="w-4 h-4 mr-2" />
                          YouTube Thumbnail
                        </div>
                      </SelectItem>
                      <SelectItem value="story">Instagram Story</SelectItem>
                      <SelectItem value="pinterest">Pinterest Pin</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {platformDimensions[selectedPlatform as keyof typeof platformDimensions]?.width} × {platformDimensions[selectedPlatform as keyof typeof platformDimensions]?.height}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Campaign Name</Label>
                  <Input
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Summer Sale 2024"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Target Audience</Label>
                  <Input
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Young professionals, 25-35"
                    className="mt-1"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-gray-600">Hashtags</Label>
                    <Button 
                      onClick={generateHashtags}
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Generate
                    </Button>
                  </div>
                  <Textarea
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="#meme #viral #trending"
                    className="mt-1 h-16 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Call to Action</Label>
                  <Select value={callToAction} onValueChange={setCallToAction}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select CTA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visit">Visit Our Website</SelectItem>
                      <SelectItem value="shop">Shop Now</SelectItem>
                      <SelectItem value="learn">Learn More</SelectItem>
                      <SelectItem value="signup">Sign Up Today</SelectItem>
                      <SelectItem value="follow">Follow Us</SelectItem>
                      <SelectItem value="share">Share This</SelectItem>
                      <SelectItem value="custom">Custom...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Campaign Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-gray-600">Enable Tracking</Label>
                  <Switch
                    checked={trackingEnabled}
                    onCheckedChange={setTrackingEnabled}
                  />
                </div>

                {trackingEnabled && (
                  <div>
                    <Label className="text-xs text-gray-600">Campaign ID</Label>
                    <Input
                      value={campaignId}
                      onChange={(e) => setCampaignId(e.target.value)}
                      placeholder="summer-2024-meme-01"
                      className="mt-1"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="p-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-600">Format</Label>
                    <Select value={exportFormat} onValueChange={setExportFormat}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="jpg">JPG</SelectItem>
                        <SelectItem value="webp">WebP</SelectItem>
                        <SelectItem value="svg">SVG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Quality</Label>
                    <Select value={exportQuality} onValueChange={setExportQuality}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Fast)</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High (Best)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Size</Label>
                  <Select value={exportSize} onValueChange={setExportSize}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Original Size</SelectItem>
                      <SelectItem value="2x">2× Retina</SelectItem>
                      <SelectItem value="0.5x">50% Smaller</SelectItem>
                      <SelectItem value="custom">Custom Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button 
                    onClick={handleExportForPlatform}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export for {platformDimensions[selectedPlatform as keyof typeof platformDimensions]?.label}
                  </Button>

                  <Button 
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share to Platform
                  </Button>

                  <Button 
                    variant="ghost"
                    className="w-full"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Export Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Platform:</span>
                  <span>{platformDimensions[selectedPlatform as keyof typeof platformDimensions]?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimensions:</span>
                  <span>{platformDimensions[selectedPlatform as keyof typeof platformDimensions]?.width} × {platformDimensions[selectedPlatform as keyof typeof platformDimensions]?.height}</span>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span>{exportFormat.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quality:</span>
                  <span>{exportQuality}</span>
                </div>
                {watermarkEnabled && (
                  <div className="flex justify-between">
                    <span>Watermark:</span>
                    <span>✓ Enabled</span>
                  </div>
                )}
                {trackingEnabled && (
                  <div className="flex justify-between">
                    <span>Tracking:</span>
                    <span>✓ Enabled</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}