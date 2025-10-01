import React, { useRef } from "react";
import { useSlidingDoor, difficultyPresets, DifficultyLevel } from "@/lib/stores/useSlidingDoor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Upload, Settings as SettingsIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const GameSettings: React.FC = () => {
  const houseInputRef = useRef<HTMLInputElement>(null);
  const doorInputRef = useRef<HTMLInputElement>(null);
  
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

  const handleSaveAndPlay = () => {
    if (!settings.houseImageUrl || !settings.doorImageUrl) {
      alert("Please upload both house and door images before playing!");
      return;
    }
    setGamePhase("ready");
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
            Upload images and configure the sliding door game settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
          <div className="flex gap-4 pt-4">
            <Button onClick={handleSaveAndPlay} size="lg" className="flex-1">
              Save & Play Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
