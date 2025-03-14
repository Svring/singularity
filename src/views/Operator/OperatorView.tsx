import React, { useState, useEffect } from 'react';
import { useServiceStore } from '../../store/service/serviceStore';
import { getEndpointUrl } from '../../models/service/serviceModel';
import { fetch } from '@tauri-apps/plugin-http';

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
  const [probeStatus, setProbeStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
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

  // Automatically check service status when component mounts
  useEffect(() => {
    if (operatorService) {
      handleProbe();
    }
  }, []);

  // Send request to the probe endpoint
  const handleProbe = async () => {
    if (!operatorService) {
      setError('Service not available');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get the probe endpoint
      const probeEndpoint = operatorService.endpoints.find(
        endpoint => endpoint.path === '/' && endpoint.method === 'GET'
      );

      if (!probeEndpoint) {
        throw new Error('Probe endpoint not found');
      }

      // Use Tauri's fetch which bypasses CORS
      const response = await fetch(getEndpointUrl(operatorService, probeEndpoint));
      
      const data = await response.json() as ProbeResponse;
      setProbeStatus(data.message);
      
      // Update service status to running in the store
      updateServiceStatus('operator', 'running');
      
      console.log('Probe successful:', data);
      
      // Get screen size after successful probe
      handleGetScreenSize();
    } catch (err) {
      console.error('Probe error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // Update service status to error in the store
      updateServiceStatus('operator', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Get screen size
  const handleGetScreenSize = async () => {
    if (!operatorService) {
      setError('Service not available');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get the screen_size endpoint
      const screenSizeEndpoint = operatorService.endpoints.find(
        endpoint => endpoint.path === '/screen_size' && endpoint.method === 'GET'
      );

      if (!screenSizeEndpoint) {
        throw new Error('Screen size endpoint not found');
      }

      // Use Tauri's fetch which bypasses CORS
      const response = await fetch(getEndpointUrl(operatorService, screenSizeEndpoint));
      
      const data = await response.json() as ScreenSizeResponse;
      setScreenSize(data);
      
      // Update region with screen size
      setRegion([0, 0, data.width / 2, data.height / 2]);
      
      console.log('Screen size retrieved:', data);
    } catch (err) {
      console.error('Screen size error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle mouse click
  const handleMouseClick = async () => {
    if (!operatorService) {
      setError('Service not available');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setActionResult(null);

      // Get the click endpoint
      const clickEndpoint = operatorService.endpoints.find(
        endpoint => endpoint.path === '/click' && endpoint.method === 'POST'
      );

      if (!clickEndpoint) {
        throw new Error('Click endpoint not found');
      }

      // Use Tauri's fetch which bypasses CORS
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
      
      console.log('Click successful:', data);
    } catch (err) {
      console.error('Click error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle mouse move
  const handleMouseMove = async () => {
    if (!operatorService) {
      setError('Service not available');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setActionResult(null);

      // Get the move endpoint
      const moveEndpoint = operatorService.endpoints.find(
        endpoint => endpoint.path === '/move' && endpoint.method === 'POST'
      );

      if (!moveEndpoint) {
        throw new Error('Move endpoint not found');
      }

      // Use Tauri's fetch which bypasses CORS
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
      
      console.log('Move successful:', data);
    } catch (err) {
      console.error('Move error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle screenshot capture
  const handleScreenshot = async () => {
    if (!operatorService) {
      setError('Service not available');
      return;
    }

    try {
      setIsCapturing(true);
      setError(null);

      // Get the screenshot_base64 endpoint
      const screenshotEndpoint = operatorService.endpoints.find(
        endpoint => endpoint.path === '/screenshot_base64' && endpoint.method === 'POST'
      );

      if (!screenshotEndpoint) {
        throw new Error('Screenshot endpoint not found');
      }

      // Prepare request body
      const requestBody: any = {
        format: screenshotFormat,
        full_screen: isFullScreen
      };

      // Add region if not full screen
      if (!isFullScreen) {
        requestBody.region = region;
      }

      // Use Tauri's fetch which bypasses CORS
      const response = await fetch(getEndpointUrl(operatorService, screenshotEndpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json() as ScreenshotBase64Response;
      
      // Set the screenshot image with the correct data URL format
      setScreenshotImage(`data:image/${data.format};base64,${data.base64_image}`);
      
      console.log('Screenshot successful:', data);
    } catch (err) {
      console.error('Screenshot error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
    <div className="flex flex-col p-6 h-full overflow-y-auto">
      <h1 className="text-xl font-bold text-white mb-6">Operator Service</h1>
      
      {/* Service Status */}
      <div className="bg-gray-700 rounded-lg p-4 shadow mb-4">
        <h2 className="text-lg font-semibold text-white mb-3">Service Status</h2>
        
        <div className="flex items-center mb-4">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            operatorService?.status === 'running' ? 'bg-green-500' : 
            operatorService?.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
          }`}></div>
          <span className="text-gray-300">{operatorService?.status || 'unknown'}</span>
        </div>
        
        <button 
          onClick={handleProbe}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Checking...' : 'Check Service Health'}
        </button>
        
        {probeStatus && (
          <div className="mt-3 p-3 bg-gray-600 rounded text-gray-200">
            <p><strong>Status:</strong> {probeStatus}</p>
          </div>
        )}
      </div>
      
      {/* Screen Size Information */}
      {operatorService?.status === 'running' && screenSize && (
        <div className="bg-gray-700 rounded-lg p-4 shadow mb-4">
          <h2 className="text-lg font-semibold text-white mb-3">Screen Information</h2>
          <div className="p-3 bg-gray-600 rounded text-gray-200">
            <p><strong>Width:</strong> {screenSize.width}px</p>
            <p><strong>Height:</strong> {screenSize.height}px</p>
          </div>
          <button 
            onClick={handleGetScreenSize}
            disabled={isLoading}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Refresh Screen Size
          </button>
        </div>
      )}
      
      {/* Mouse Control Section */}
      {operatorService?.status === 'running' && (
        <div className="bg-gray-700 rounded-lg p-4 shadow mb-4">
          <h2 className="text-lg font-semibold text-white mb-3">Mouse Control</h2>
          
          {/* Coordinates Input */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                X Coordinate
              </label>
              <input
                type="number"
                value={mouseX}
                onChange={(e) => setMouseX(parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Y Coordinate
              </label>
              <input
                type="number"
                value={mouseY}
                onChange={(e) => setMouseY(parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
              />
            </div>
          </div>
          
          {/* Button Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Button Type
            </label>
            <select
              value={buttonType}
              onChange={(e) => setButtonType(e.target.value as 'left' | 'right' | 'middle')}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            >
              <option value="left">Left Button</option>
              <option value="right">Right Button</option>
              <option value="middle">Middle Button</option>
            </select>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={handleMouseClick}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Click at Position
            </button>
            
            <button
              onClick={handleMouseMove}
              disabled={isLoading}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Move to Position
            </button>
          </div>

          {/* Action Result */}
          {actionResult && (
            <div className="mt-3 p-3 bg-gray-600 rounded text-gray-200">
              <p>{actionResult}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Screenshot Section */}
      {operatorService?.status === 'running' && (
        <div className="bg-gray-700 rounded-lg p-4 shadow mb-4">
          <h2 className="text-lg font-semibold text-white mb-3">Take Screenshot</h2>
          
          {/* Screenshot Options */}
          <div className="mb-4">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="fullscreen"
                checked={isFullScreen}
                onChange={(e) => setIsFullScreen(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="fullscreen" className="text-sm font-medium text-gray-300">
                Full Screen
              </label>
            </div>
            
            {/* Region Selection (when not full screen) */}
            {!isFullScreen && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Left (X)
                  </label>
                  <input
                    type="number"
                    value={region[0]}
                    onChange={(e) => handleRegionChange(0, e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Top (Y)
                  </label>
                  <input
                    type="number"
                    value={region[1]}
                    onChange={(e) => handleRegionChange(1, e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Width
                  </label>
                  <input
                    type="number"
                    value={region[2]}
                    onChange={(e) => handleRegionChange(2, e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Height
                  </label>
                  <input
                    type="number"
                    value={region[3]}
                    onChange={(e) => handleRegionChange(3, e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                  />
                </div>
              </div>
            )}
            
            {/* Format Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Image Format
              </label>
              <select
                value={screenshotFormat}
                onChange={(e) => setScreenshotFormat(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
              >
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
              </select>
            </div>
          </div>
          
          {/* Capture Button */}
          <button
            onClick={handleScreenshot}
            disabled={isCapturing}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {isCapturing ? 'Capturing...' : 'Take Screenshot'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-3 p-3 bg-red-900/50 text-red-200 rounded">
              <p>{error}</p>
            </div>
          )}

          {/* Screenshot Result */}
          {screenshotImage && (
            <div className="mt-4">
              <h3 className="text-md font-medium text-gray-300 mb-2">Screenshot Result</h3>
              <img 
                src={screenshotImage} 
                alt="Screenshot" 
                className="max-w-full border border-gray-600 rounded"
              />
            </div>
          )}
        </div>
      )}
      
      {/* Service Info */}
      <div className="text-gray-400 text-sm">
        <p>Port: {operatorService?.port}</p>
        <p>Base URL: {operatorService?.baseUrl}</p>
      </div>
    </div>
  );
};

export default OperatorView;
