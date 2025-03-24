import React, { useState, useEffect } from 'react';
import { useServiceStore } from '../../store/service/serviceStore';
import { getEndpointUrl } from '../../models/service/serviceModel';
import { fetch } from '@tauri-apps/plugin-http';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


// Types for the Operator service responses
interface ProbeResponse {
  message: string;
}

interface ClickResponse {
  success: boolean;
  message: string;
}

interface MoveResponse {
  success: boolean;
  message: string;
}

interface ScreenSizeResponse {
  width: number;
  height: number;
}

interface ScreenshotBase64Response {
  success: boolean;
  format: string;
  base64_image: string;
  is_full_screen: boolean;
}

export const OperatorView: React.FC = () => {
  // Mouse control states
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const [buttonType, setButtonType] = useState<'left' | 'right' | 'middle'>('left');
  const [actionResult, setActionResult] = useState<string | null>(null);
  
  // Screen size state
  const [screenSize, setScreenSize] = useState<{ width: number; height: number } | null>(null);
  
  // Screenshot states
  const [screenshotImage, setScreenshotImage] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(true);
  const [region, setRegion] = useState<number[]>([0, 0, 800, 600]);
  const [screenshotFormat, setScreenshotFormat] = useState<string>('png');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // Get the operator service and update function from the store
  const operatorService = useServiceStore(state => state.getService('operator'));
  const updateServiceStatus = useServiceStore(state => state.updateServiceStatus);

  // Check service status periodically
  useEffect(() => {
    const checkServiceStatus = async () => {
      if (!operatorService) return;

      try {
        const probeEndpoint = operatorService.endpoints.find(
          endpoint => endpoint.path === '/probe' && endpoint.method === 'GET'
        );

        if (!probeEndpoint) {
          throw new Error('Probe endpoint not found');
        }

        console.log("Probe endpoint:", getEndpointUrl(operatorService, probeEndpoint));

        const response = await fetch(getEndpointUrl(operatorService, probeEndpoint));
        const data = await response.json() as ProbeResponse;
        console.log("Probe response:", data);
        updateServiceStatus('operator', 'online');
        
        // Get screen size after successful probe
        handleGetScreenSize();
      } catch (err) {
        console.error('Service status check failed:', err);
        updateServiceStatus('operator', 'inactive');
      }
    };

    // Check immediately
    checkServiceStatus();

    // Then check every 30 seconds
    const interval = setInterval(checkServiceStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  // Get screen size
  const handleGetScreenSize = async () => {
    if (!operatorService) return;

    try {
      const screenSizeEndpoint = operatorService.endpoints.find(
        endpoint => endpoint.path === '/screen_size' && endpoint.method === 'GET'
      );

      if (!screenSizeEndpoint) {
        throw new Error('Screen size endpoint not found');
      }

      const response = await fetch(getEndpointUrl(operatorService, screenSizeEndpoint));
      const data = await response.json() as ScreenSizeResponse;
      setScreenSize(data);
      setRegion([0, 0, data.width / 2, data.height / 2]);
    } catch (err) {
      console.error('Screen size error:', err);
    }
  };

  // Handle mouse click
  const handleMouseClick = async () => {
    if (!operatorService) return;

    try {
      const clickEndpoint = operatorService.endpoints.find(
        endpoint => endpoint.path === '/click' && endpoint.method === 'POST'
      );

      if (!clickEndpoint) {
        throw new Error('Click endpoint not found');
      }

      const response = await fetch(getEndpointUrl(operatorService, clickEndpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          x: mouseX, 
          y: mouseY,
          button: buttonType
        }),
      });

      const data = await response.json() as ClickResponse;
      setActionResult(data.message);
    } catch (err) {
      console.error('Click error:', err);
    }
  };

  // Handle mouse move
  const handleMouseMove = async () => {
    if (!operatorService) return;

    try {
      const moveEndpoint = operatorService.endpoints.find(
        endpoint => endpoint.path === '/move' && endpoint.method === 'POST'
      );

      if (!moveEndpoint) {
        throw new Error('Move endpoint not found');
      }

      const response = await fetch(getEndpointUrl(operatorService, moveEndpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          x: mouseX, 
          y: mouseY 
        }),
      });

      const data = await response.json() as MoveResponse;
      setActionResult(data.message);
    } catch (err) {
      console.error('Move error:', err);
    }
  };

  // Handle screenshot capture
  const handleScreenshot = async () => {
    if (!operatorService) return;

    try {
      setIsCapturing(true);
      const screenshotEndpoint = operatorService.endpoints.find(
        endpoint => endpoint.path === '/screenshot_base64' && endpoint.method === 'POST'
      );

      if (!screenshotEndpoint) {
        throw new Error('Screenshot endpoint not found');
      }

      const requestBody: any = {
        format: screenshotFormat,
        full_screen: isFullScreen
      };

      if (!isFullScreen) {
        requestBody.region = region;
      }

      const response = await fetch(getEndpointUrl(operatorService, screenshotEndpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json() as ScreenshotBase64Response;
      setScreenshotImage(`data:image/${data.format};base64,${data.base64_image}`);
    } catch (err) {
      console.error('Screenshot error:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  // Handle region input change
  const handleRegionChange = (index: number, value: string) => {
    const newValue = parseInt(value);
    if (!isNaN(newValue)) {
      const newRegion = [...region];
      newRegion[index] = newValue;
      setRegion(newRegion);
    }
  };

  return (
    <div className="flex flex-col p-6 h-full overflow-y-auto space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">Operator</h1>

        {/* Service Info */}
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span className="font-mono">{operatorService?.baseUrl}:{operatorService?.port}</span>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <div className={`w-1.5 h-1.5 rounded-full ${operatorService?.status === 'online' ? 'bg-green-500' :
              operatorService?.status === 'inactive' ? 'bg-muted' : 'bg-destructive'
              }`}></div>
            <span className="capitalize">{operatorService?.status || 'unknown'}</span>
          </div>
        </div>

        {/* Service Description */}
        <div className="mt-2 text-sm text-muted-foreground">
          <p>
            The Operator service provides mouse control and screen capture capabilities.
            It allows you to move the mouse cursor, perform clicks, and take screenshots of the entire screen or specific regions.
          </p>
        </div>
      </div>

      <Tabs defaultValue="mouse" className="w-full flex-1">
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value="mouse">Mouse Control</TabsTrigger>
          <TabsTrigger value="screenshot">Screenshot</TabsTrigger>
        </TabsList>

        <TabsContent value="mouse" className="space-y-4">
          <div className="flex gap-4">
            {/* Mouse Control Card */}
            <Card className="w-1/2 flex flex-col">
              <CardHeader className="flex-none">
                <CardTitle>Mouse Control</CardTitle>
                <CardDescription>Control mouse movement and clicks</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {/* Coordinates Input */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        X Coordinate
                      </label>
                      <Input
                        value={mouseX}
                        onChange={(e) => setMouseX(parseInt(e.target.value) || 0)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Y Coordinate
                      </label>
                      <Input
                        value={mouseY}
                        onChange={(e) => setMouseY(parseInt(e.target.value) || 0)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  {/* Button Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Button Type
                    </label>
                    <Select value={buttonType} onValueChange={(value: 'left' | 'right' | 'middle') => setButtonType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select button type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left Button</SelectItem>
                        <SelectItem value="right">Right Button</SelectItem>
                        <SelectItem value="middle">Middle Button</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleMouseClick}
                      variant="default"
                      className="flex-1"
                    >
                      Click at Position
                    </Button>
                    
                    <Button
                      onClick={handleMouseMove}
                      variant="secondary"
                      className="flex-1"
                    >
                      Move to Position
                    </Button>
                  </div>

                  {/* Action Result */}
                  {actionResult && (
                    <div className="p-3 bg-muted rounded text-muted-foreground">
                      <p>{actionResult}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Screen Info Card */}
            <Card className="w-1/2 flex flex-col">
              <CardHeader className="flex-none">
                <CardTitle>Screen Information</CardTitle>
                <CardDescription>Current screen dimensions</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {screenSize ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm"><span className="font-medium">Width:</span> {screenSize.width}px</p>
                      <p className="text-sm"><span className="font-medium">Height:</span> {screenSize.height}px</p>
                    </div>
                    <Button 
                      onClick={handleGetScreenSize}
                      variant="outline"
                      className="w-full"
                    >
                      Refresh Screen Size
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Screen size information not available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="screenshot" className="space-y-4">
          <div className="flex gap-4">
            {/* Screenshot Options Card */}
            <Card className="w-1/2 flex flex-col">
              <CardHeader className="flex-none">
                <CardTitle>Screenshot Options</CardTitle>
                <CardDescription>Configure screenshot settings</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {/* Full Screen Option */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fullscreen"
                      checked={isFullScreen}
                      onCheckedChange={(checked) => setIsFullScreen(checked === true)}
                    />
                    <label
                      htmlFor="fullscreen"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Full Screen
                    </label>
                  </div>
                  
                  {/* Region Selection */}
                  {!isFullScreen && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Left (X)
                        </label>
                        <Input
                          type="number"
                          value={region[0]}
                          onChange={(e) => handleRegionChange(0, e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Top (Y)
                        </label>
                        <Input
                          type="number"
                          value={region[1]}
                          onChange={(e) => handleRegionChange(1, e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Width
                        </label>
                        <Input
                          type="number"
                          value={region[2]}
                          onChange={(e) => handleRegionChange(2, e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Height
                        </label>
                        <Input
                          type="number"
                          value={region[3]}
                          onChange={(e) => handleRegionChange(3, e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Format Selection */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Image Format
                    </label>
                    <Select value={screenshotFormat} onValueChange={setScreenshotFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select image format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="jpg">JPG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-none">
                <Button
                  onClick={handleScreenshot}
                  disabled={isCapturing}
                  variant="default"
                  className="w-full"
                >
                  {isCapturing ? 'Capturing...' : 'Take Screenshot'}
                </Button>
              </CardFooter>
            </Card>

            {/* Screenshot Result Card */}
            <Card className="w-1/2 flex flex-col">
              <CardHeader className="flex-none">
                <CardTitle>Screenshot Result</CardTitle>
                <CardDescription>Captured screen image</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {screenshotImage ? (
                  <div className="border border-border rounded p-1">
                    <img 
                      src={screenshotImage} 
                      alt="Screenshot" 
                      className="max-w-full max-h-[400px] object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Take a screenshot to see the result
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OperatorView;
