import React from 'react';
import { useServiceStore } from '../../store/service/serviceStore';
import { OmniparserView } from '../Omniparser/OmniparserView';
import { OperatorView } from '../Operator/OperatorView';
import { OllamaView } from '../Ollama/OllamaView';

export const OperationView: React.FC = () => {
    const selectedService = useServiceStore(state => state.selectedService);
    const services = useServiceStore(state => state.services);

    // Render the appropriate view based on the selected service
    const renderServiceView = () => {
        if (!selectedService) {
            return (
                <div className="flex items-center justify-center h-full text-gray-400">
                    <p>Select a service from the sidebar to get started</p>
                </div>
            );
        }

        // Get the selected service object
        const service = services[selectedService];
        
        if (!service) {
            return (
                <div className="flex items-center justify-center h-full text-gray-400">
                    <p>Selected service not found</p>
                </div>
            );
        }

        // Render the appropriate view based on service name
        switch (service.serviceName) {
            case 'omniparser':
                return <OmniparserView />;
            case 'operator':
                return <OperatorView />;
            case 'ollama':
                return <OllamaView />;
            default:
                return (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p>No view available for {service.serviceName}</p>
                    </div>
                );
        }
    };

    return (
        <div data-tauri-drag-region className="flex-1 h-full bg-black rounded-lg overflow-hidden">
            {renderServiceView()}
        </div>
    );
};

export default OperationView;
