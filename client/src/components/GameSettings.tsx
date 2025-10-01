import React, { useRef, useState, useEffect } from "react";
import { useSlidingDoor, difficultyPresets, DifficultyLevel, GameMode } from "@/lib/stores/useSlidingDoor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Upload, Settings as SettingsIcon, Code, Copy, Check } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const GameSettings: React.FC = () => {
  const houseInputRef = useRef<HTMLInputElement>(null);
  const doorInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  
  const {
    settings,
    updateSettings,
    uploadHouseImage,
    uploadDoorImage,
    setGamePhase,
  } = useSlidingDoor();

  const handleHouseImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadHouseImage(file);
    }
  };

  const handleDoorImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadDoorImage(file);
    }
  };

  const handleDifficultyChange = (value: DifficultyLevel) => {
    const preset = difficultyPresets[value];
    updateSettings({
      difficulty: value,
      doorSpeed: preset.doorSpeed,
      successThreshold: preset.successThreshold,
    });
  };

  // Settings are hardcoded in the store, so no need to save

  const iframeCode = `<iframe src="https://noahung.github.io/door-fit-game/#/game" width="800" height="600" frameborder="0" style="border: none; border-radius: 8px;"></iframe>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(iframeCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Draw preview canvas
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw house if available
    if (settings.houseImageUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, settings.houseWidth, settings.houseHeight);
        drawSuccessArea(ctx);
      };
      img.src = settings.houseImageUrl;
    } else {
      // Draw placeholder
      ctx.fillStyle = "#e0e0e0";
      ctx.fillRect(0, 0, settings.houseWidth, settings.houseHeight);
      ctx.fillStyle = "#666";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Upload house image", settings.houseWidth / 2, settings.houseHeight / 2);
      drawSuccessArea(ctx);
    }
  }, [settings.houseImageUrl, settings.houseWidth, settings.houseHeight, settings.successAreaX, settings.successAreaY, settings.successAreaWidth, settings.successAreaHeight]);

  const drawSuccessArea = (ctx: CanvasRenderingContext2D) => {
    // Draw success area
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(settings.successAreaX, settings.successAreaY, settings.successAreaWidth, settings.successAreaHeight);
    ctx.setLineDash([]);
    
    // Draw resize handle
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(
      settings.successAreaX + settings.successAreaWidth - 8,
      settings.successAreaY + settings.successAreaHeight - 8,
      16,
      16
    );
    
    // Draw door outline
    const doorY = settings.successAreaY + (settings.successAreaHeight - settings.doorHeight) / 2;
    ctx.strokeStyle = "#ff6600";
    ctx.lineWidth = 2;
    ctx.strokeRect(settings.successAreaX + 10, doorY, settings.doorWidth, settings.doorHeight);
    
    // Label
    ctx.fillStyle = "#00ff00";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Success Area (drag to move, bottom-right to resize)", settings.successAreaX, settings.successAreaY - 5);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking resize handle
    const handleX = settings.successAreaX + settings.successAreaWidth;
    const handleY = settings.successAreaY + settings.successAreaHeight;
    
    if (x >= handleX - 8 && x <= handleX + 8 && y >= handleY - 8 && y <= handleY + 8) {
      setIsResizing(true);
      setDragStart({ x, y });
    }
    // Check if clicking inside success area
    else if (
      x >= settings.successAreaX && x <= settings.successAreaX + settings.successAreaWidth &&
      y >= settings.successAreaY && y <= settings.successAreaY + settings.successAreaHeight
    ) {
      setIsDragging(true);
      setDragStart({
        x: x - settings.successAreaX,
        y: y - settings.successAreaY
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isDragging) {
      const newX = Math.max(0, Math.min(x - dragStart.x, settings.houseWidth - settings.successAreaWidth));
      const newY = Math.max(0, Math.min(y - dragStart.y, settings.houseHeight - settings.successAreaHeight));
      updateSettings({ successAreaX: Math.round(newX), successAreaY: Math.round(newY) });
    } else if (isResizing) {
      const newWidth = Math.max(50, Math.min(x - settings.successAreaX, settings.houseWidth - settings.successAreaX));
      const newHeight = Math.max(50, Math.min(y - settings.successAreaY, settings.houseHeight - settings.successAreaY));
      updateSettings({ successAreaWidth: Math.round(newWidth), successAreaHeight: Math.round(newHeight) });
    }
    
    // Update cursor
    const handleX = settings.successAreaX + settings.successAreaWidth;
    const handleY = settings.successAreaY + settings.successAreaHeight;
    
    if (x >= handleX - 8 && x <= handleX + 8 && y >= handleY - 8 && y <= handleY + 8) {
      canvas.style.cursor = "nwse-resize";
    } else if (
      x >= settings.successAreaX && x <= settings.successAreaX + settings.successAreaWidth &&
      y >= settings.successAreaY && y <= settings.successAreaY + settings.successAreaHeight
    ) {
      canvas.style.cursor = "move";
    } else {
      canvas.style.cursor = "default";
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            Game Configuration
          </CardTitle>
          <CardDescription>
            Game settings reference - Click "Get Iframe Code" below to embed the game on your website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visual Editor Preview */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Visual Editor - Position Success Area</h3>
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
              <canvas
                ref={previewCanvasRef}
                width={settings.houseWidth}
                height={settings.houseHeight}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                className="max-w-full h-auto cursor-default"
                style={{ display: "block", margin: "0 auto" }}
              />
            </div>
            <p className="text-sm text-gray-600">
              • Drag the green area to reposition<br/>
              • Drag the bottom-right corner to resize<br/>
              • Orange outline shows door size
            </p>
          </div>

          {/* Image Uploads */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="house-upload" className="text-lg font-semibold">
                House Image
              </Label>
              <div className="flex flex-col gap-2">
                <input
                  ref={houseInputRef}
                  id="house-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleHouseImageUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => houseInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload House Image
                </Button>
                {settings.houseImageUrl && (
                  <div className="border rounded p-2">
                    <img
                      src={settings.houseImageUrl}
                      alt="House preview"
                      className="w-full h-32 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="door-upload" className="text-lg font-semibold">
                Door Image
              </Label>
              <div className="flex flex-col gap-2">
                <input
                  ref={doorInputRef}
                  id="door-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleDoorImageUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => doorInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Door Image
                </Button>
                {settings.doorImageUrl && (
                  <div className="border rounded p-2">
                    <img
                      src={settings.doorImageUrl}
                      alt="Door preview"
                      className="w-full h-32 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Canvas Dimensions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Canvas Dimensions</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="house-width">House Width (px)</Label>
                <Input
                  id="house-width"
                  type="number"
                  value={settings.houseWidth}
                  onChange={(e) =>
                    updateSettings({ houseWidth: parseInt(e.target.value) || 600 })
                  }
                  min="400"
                  max="1200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="house-height">House Height (px)</Label>
                <Input
                  id="house-height"
                  type="number"
                  value={settings.houseHeight}
                  onChange={(e) =>
                    updateSettings({ houseHeight: parseInt(e.target.value) || 400 })
                  }
                  min="300"
                  max="800"
                />
              </div>
            </div>
          </div>

          {/* Door Dimensions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Door Dimensions</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="door-width">Door Width (px)</Label>
                <Input
                  id="door-width"
                  type="number"
                  value={settings.doorWidth}
                  onChange={(e) =>
                    updateSettings({ doorWidth: parseInt(e.target.value) || 150 })
                  }
                  min="50"
                  max="400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="door-height">Door Height (px)</Label>
                <Input
                  id="door-height"
                  type="number"
                  value={settings.doorHeight}
                  onChange={(e) =>
                    updateSettings({ doorHeight: parseInt(e.target.value) || 200 })
                  }
                  min="50"
                  max="400"
                />
              </div>
            </div>
          </div>

          {/* Success Area Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Success Area (Green Zone)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="success-x">X Position (px)</Label>
                <Input
                  id="success-x"
                  type="number"
                  value={settings.successAreaX}
                  onChange={(e) =>
                    updateSettings({ successAreaX: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  max={settings.houseWidth - settings.successAreaWidth}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="success-y">Y Position (px)</Label>
                <Input
                  id="success-y"
                  type="number"
                  value={settings.successAreaY}
                  onChange={(e) =>
                    updateSettings({ successAreaY: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  max={settings.houseHeight - settings.successAreaHeight}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="success-width">Width (px)</Label>
                <Input
                  id="success-width"
                  type="number"
                  value={settings.successAreaWidth}
                  onChange={(e) =>
                    updateSettings({ successAreaWidth: parseInt(e.target.value) || 150 })
                  }
                  min="50"
                  max="400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="success-height">Height (px)</Label>
                <Input
                  id="success-height"
                  type="number"
                  value={settings.successAreaHeight}
                  onChange={(e) =>
                    updateSettings({ successAreaHeight: parseInt(e.target.value) || 200 })
                  }
                  min="50"
                  max="400"
                />
              </div>
            </div>
          </div>

          {/* Game Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Game Settings</h3>
            
            <div className="space-y-3">
              <Label>Game Mode</Label>
              <RadioGroup
                value={settings.gameMode}
                onValueChange={(value) => updateSettings({ gameMode: value as GameMode })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="classic" id="classic" />
                  <Label htmlFor="classic" className="font-normal cursor-pointer">
                    Classic - Play freely with no time or attempt limits
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="timed" id="timed" />
                  <Label htmlFor="timed" className="font-normal cursor-pointer">
                    Timed Challenge - Score as many successes as possible within the time limit
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="limited" id="limited" />
                  <Label htmlFor="limited" className="font-normal cursor-pointer">
                    Limited Attempts - Achieve the best success rate with limited tries
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {settings.gameMode === "timed" && (
              <div className="space-y-2">
                <Label htmlFor="timed-duration">Time Limit (seconds)</Label>
                <Input
                  id="timed-duration"
                  type="number"
                  value={settings.timedModeDuration}
                  onChange={(e) =>
                    updateSettings({ timedModeDuration: parseInt(e.target.value) || 30 })
                  }
                  min="10"
                  max="120"
                />
              </div>
            )}

            {settings.gameMode === "limited" && (
              <div className="space-y-2">
                <Label htmlFor="limited-attempts">Maximum Attempts</Label>
                <Input
                  id="limited-attempts"
                  type="number"
                  value={settings.limitedModeAttempts}
                  onChange={(e) =>
                    updateSettings({ limitedModeAttempts: parseInt(e.target.value) || 5 })
                  }
                  min="1"
                  max="20"
                />
              </div>
            )}
            
            <div className="space-y-3">
              <Label>Difficulty Level</Label>
              <RadioGroup
                value={settings.difficulty}
                onValueChange={(value) => handleDifficultyChange(value as DifficultyLevel)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="easy" id="easy" />
                  <Label htmlFor="easy" className="font-normal cursor-pointer">
                    Easy (Slower speed, 70% accuracy required)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="font-normal cursor-pointer">
                    Medium (Normal speed, 80% accuracy required)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hard" id="hard" />
                  <Label htmlFor="hard" className="font-normal cursor-pointer">
                    Hard (Fast speed, 90% accuracy required)
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="door-speed">
                Door Speed: {settings.doorSpeed} px/frame
              </Label>
              <Slider
                id="door-speed"
                min={1}
                max={10}
                step={0.5}
                value={[settings.doorSpeed]}
                onValueChange={(value) => updateSettings({ doorSpeed: value[0] })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="success-threshold">
                Success Threshold: {settings.successThreshold}% overlap required
              </Label>
              <Slider
                id="success-threshold"
                min={50}
                max={100}
                step={5}
                value={[settings.successThreshold]}
                onValueChange={(value) =>
                  updateSettings({ successThreshold: value[0] })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirect-url">Success Redirect URL (optional)</Label>
              <Input
                id="redirect-url"
                type="url"
                placeholder="https://example.com/success"
                value={settings.successRedirectUrl}
                onChange={(e) =>
                  updateSettings({ successRedirectUrl: e.target.value })
                }
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full bg-[#f47421] hover:bg-[#e56610]">
                  <Code className="w-4 h-4 mr-2" />
                  Get Iframe Code
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Embed Game on Your Website</DialogTitle>
                  <DialogDescription>
                    Copy this iframe code and paste it into your WordPress page or any website.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <code className="text-sm text-gray-800 break-all">
                      {iframeCode}
                    </code>
                  </div>
                  <Button
                    onClick={copyToClipboard}
                    className="w-full"
                    variant={copied ? "default" : "outline"}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p><strong>Note:</strong> You can customize the width and height in the iframe code:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><code>width="800"</code> - adjust the width in pixels</li>
                      <li><code>height="600"</code> - adjust the height in pixels</li>
                      <li>Or use <code>width="100%"</code> for responsive width</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
