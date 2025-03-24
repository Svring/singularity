import React from 'react';
import { useServiceStore } from '../../store/service/serviceStore';

interface OutputDisplayProps {
  timestamp: number;
  data: any;
  error?: string;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ timestamp, data, error }) => {
  const date = new Date(timestamp);
  const formattedTime = date.toLocaleTimeString();

  return (
    <div className="border border-gray-700 rounded-lg p-3 mb-2 bg-gray-800/50">
      <div className="text-xs text-gray-500 mb-2">{formattedTime}</div>
      {error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-auto max-h-40">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

export const DockView: React.FC = () => {
  const services = useServiceStore(state => state.services);
  const getEndpointOutputs = useServiceStore(state => state.getEndpointOutputs);
  const clearEndpointOutputs = useServiceStore(state => state.clearEndpointOutputs);

  // Function to get all outputs for a service
  const getServiceOutputs = (serviceName: string) => {
    const service = services[serviceName];
    if (!service) return {};

    return service.endpoints.reduce((acc, endpoint) => {
      acc[endpoint.path] = getEndpointOutputs(serviceName, endpoint.path);
      return acc;
    }, {} as { [key: string]: any[] });
  };

  // Function to handle clearing outputs
  const handleClearOutputs = (serviceName: string, endpointPath?: string) => {
    clearEndpointOutputs(serviceName, endpointPath);
  };

  // Get all service names
  const serviceNames = Object.keys(services);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-black rounded-lg">
      <div className="text-xl font-bold text-white p-4 border-b border-gray-800">
        Service Outputs
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Service Tabs */}
        <div className="flex border-b border-gray-800">
          {serviceNames.map(serviceName => (
            <div key={serviceName} className="px-4 py-2 text-white cursor-pointer hover:bg-gray-800">
              {serviceName}
            </div>
          ))}
        </div>
        
        {/* Service Output Sections */}
        <div className="p-4 flex flex-wrap gap-4">
          {/* Omniparser Section */}
          <div className="flex-1 min-w-[300px] bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Omniparser</h2>
              <button
                onClick={() => handleClearOutputs('omniparser')}
                className="px-2 py-1 text-sm bg-red-600/30 text-red-200 rounded hover:bg-red-600/50"
              >
                Clear All
              </button>
            </div>
            {Object.entries(getServiceOutputs('omniparser')).map(([path, outputs]) => (
              <div key={path} className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-400">{path}</h3>
                  <button
                    onClick={() => handleClearOutputs('omniparser', path)}
                    className="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                  >
                    Clear
                  </button>
                </div>
                {outputs.map((output, index) => (
                  <OutputDisplay
                    key={index}
                    timestamp={output.timestamp}
                    data={output.data}
                    error={output.error}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Operator Section */}
          <div className="flex-1 min-w-[300px] bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Operator</h2>
              <button
                onClick={() => handleClearOutputs('operator')}
                className="px-2 py-1 text-sm bg-red-600/30 text-red-200 rounded hover:bg-red-600/50"
              >
                Clear All
              </button>
            </div>
            {Object.entries(getServiceOutputs('operator')).map(([path, outputs]) => (
              <div key={path} className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-400">{path}</h3>
                  <button
                    onClick={() => handleClearOutputs('operator', path)}
                    className="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                  >
                    Clear
                  </button>
                </div>
                {outputs.map((output, index) => (
                  <OutputDisplay
                    key={index}
                    timestamp={output.timestamp}
                    data={output.data}
                    error={output.error}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Ollama Section */}
          <div className="flex-1 min-w-[300px] bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Ollama</h2>
              <button
                onClick={() => handleClearOutputs('ollama')}
                className="px-2 py-1 text-sm bg-red-600/30 text-red-200 rounded hover:bg-red-600/50"
              >
                Clear All
              </button>
            </div>
            {Object.entries(getServiceOutputs('ollama')).map(([path, outputs]) => (
              <div key={path} className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-400">{path}</h3>
                  <button
                    onClick={() => handleClearOutputs('ollama', path)}
                    className="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                  >
                    Clear
                  </button>
                </div>
                {outputs.map((output, index) => (
                  <OutputDisplay
                    key={index}
                    timestamp={output.timestamp}
                    data={output.data}
                    error={output.error}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DockView;
