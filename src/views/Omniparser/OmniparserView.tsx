import React, { useState, useEffect, useRef } from 'react';
import { useServiceStore } from '../../store/service/serviceStore';
import { getEndpointUrl } from '../../models/service/serviceModel';
import { fetch } from '@tauri-apps/plugin-http';

// Types for the Omniparser service responses
interface ProbeResponse {
  message: string;
}

interface ParseResponse {
  som_image_base64: string;
  parsed_content_list: any[];
  latency: number;
}

export const OmniparserView: React.FC = () => {
  const [probeStatus, setProbeStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Parse endpoint states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get the omniparser service and store functions
  const omniparserService = useServiceStore(state => state.getService('omniparser'));
  const updateServiceStatus = useServiceStore(state => state.updateServiceStatus);
  const addEndpointOutput = useServiceStore(state => state.addEndpointOutput);
  const getEndpointOutputs = useServiceStore(state => state.getEndpointOutputs);

  // Get the latest parse result
  const getLatestParseResult = () => {
    if (!omniparserService) return null;
    const outputs = getEndpointOutputs('omniparser', '/parse/');
    return outputs.length > 0 ? outputs[outputs.length - 1] : null;
  };

  // Automatically check service status when component mounts
  useEffect(() => {
    if (omniparserService) {
      handleProbe();
    }
  }, []);

  // Send request to the probe endpoint
  const handleProbe = async () => {
    if (!omniparserService) {
      setError('Service not available');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const probeEndpoint = omniparserService.endpoints.find(
        endpoint => endpoint.path === '/probe/' && endpoint.method === 'GET'
      );

      if (!probeEndpoint) {
        throw new Error('Probe endpoint not found');
      }

      const response = await fetch(getEndpointUrl(omniparserService, probeEndpoint));
      const data = await response.json() as ProbeResponse;
      
      setProbeStatus(data.message);
      updateServiceStatus('omniparser', 'running');
      addEndpointOutput('omniparser', '/probe/', data);
      
      console.log('Probe successful:', data);
    } catch (err) {
      console.error('Probe error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      updateServiceStatus('omniparser', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setError(null);
    }
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64 = base64String.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Send request to the parse endpoint
  const handleParse = async () => {
    if (!selectedFile || !omniparserService) {
      setError('No file selected or service not available');
      return;
    }

    try {
      setIsParsing(true);
      setError(null);

      const parseEndpoint = omniparserService.endpoints.find(
        endpoint => endpoint.path === '/parse/' && endpoint.method === 'POST'
      );

      if (!parseEndpoint) {
        throw new Error('Parse endpoint not found');
      }

      const base64Image = await fileToBase64(selectedFile);

      const response = await fetch(getEndpointUrl(omniparserService, parseEndpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ base64_image: base64Image }),
      });

      const data = await response.json() as ParseResponse;
      
      // Store the parse result in the service store
      addEndpointOutput('omniparser', '/parse/', data);
      
      console.log('Parse successful:', data);
    } catch (err) {
      console.error('Parse error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      addEndpointOutput('omniparser', '/parse/', null, errorMessage);
    } finally {
      setIsParsing(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get the latest parse result for display
  const latestParseResult = getLatestParseResult();
  const parsedImage = latestParseResult?.data ? `data:image/jpeg;base64,${latestParseResult.data.som_image_base64}` : null;
  const parsedContent = latestParseResult?.data?.parsed_content_list;
  const parseLatency = latestParseResult?.data?.latency;

  return (
    <div className="flex flex-col p-6 h-full overflow-y-auto">
      <h1 className="text-xl font-bold text-white mb-6">Omniparser Service</h1>
      
      {/* Service Status */}
      <div className="bg-gray-700 rounded-lg p-4 shadow mb-4">
        <h2 className="text-lg font-semibold text-white mb-3">Service Status</h2>
        
        <div className="flex items-center mb-4">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            omniparserService?.status === 'running' ? 'bg-green-500' : 
            omniparserService?.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
          }`}></div>
          <span className="text-gray-300">{omniparserService?.status || 'unknown'}</span>
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
      
      {/* Parse Image Section */}
      {omniparserService?.status === 'running' && (
        <div className="bg-gray-700 rounded-lg p-4 shadow mb-4">
          <h2 className="text-lg font-semibold text-white mb-3">Parse Image</h2>
          
          {/* File Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-900 file:text-blue-100
                        hover:file:bg-blue-800"
            />
          </div>

          {/* Preview Image */}
          {previewImage && (
            <div className="mb-4">
              <h3 className="text-md font-medium text-gray-300 mb-2">Preview</h3>
              <img 
                src={previewImage} 
                alt="Preview" 
                className="max-w-md max-h-64 object-contain border border-gray-600 rounded"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={handleParse}
              disabled={isParsing || !selectedFile}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isParsing ? 'Parsing...' : 'Parse Image'}
            </button>
            
            <button
              onClick={handleReset}
              disabled={isParsing || (!selectedFile && !parsedImage)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3 p-3 bg-red-900/50 text-red-200 rounded">
              <p>{error}</p>
            </div>
          )}

          {/* Parse Results */}
          {parsedImage && (
            <div className="mt-4">
              <h3 className="text-md font-medium text-gray-300 mb-2">Parse Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Parsed Image */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Processed Image</h4>
                  <img 
                    src={parsedImage} 
                    alt="Parsed" 
                    className="max-w-full max-h-64 object-contain border border-gray-600 rounded"
                  />
                </div>
                
                {/* Parsed Content */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Parsed Content</h4>
                  <div className="bg-gray-800 p-3 rounded max-h-64 overflow-y-auto">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                      {JSON.stringify(parsedContent, null, 2)}
                    </pre>
                  </div>
                  {parseLatency !== null && (
                    <p className="mt-2 text-xs text-gray-400">
                      Processing time: {parseLatency.toFixed(2)}ms
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Service Info */}
      <div className="text-gray-400 text-sm">
        <p>Port: {omniparserService?.port}</p>
        <p>Base URL: {omniparserService?.baseUrl}</p>
      </div>
    </div>
  );
};

export default OmniparserView;
