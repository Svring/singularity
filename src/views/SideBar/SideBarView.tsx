import React, { useEffect } from 'react';
import { useServiceStore } from '../../store/service/serviceStore';
import { SideBarItem } from './SideBarItem';
import { LocalService } from '../../models/service/serviceModel';

export const SideBarView: React.FC = () => {
    const services = useServiceStore(state => state.services);
    const selectedService = useServiceStore(state => state.selectedService);
    const setSelectedService = useServiceStore(state => state.setSelectedService);
    const loadServiceConfig = useServiceStore(state => state.loadServiceConfig);

    useEffect(() => {
        loadServiceConfig();
    }, [loadServiceConfig]);
    
    // Convert services object to array for rendering
    const serviceList = Object.values(services);

    const handleServiceClick = (serviceName: string) => {
        setSelectedService(serviceName);
    };

    // Create a special service item for the Dock
    const dockService: LocalService = {
        serviceName: 'dock',
        port: 0,
        baseUrl: '',
        status: 'running',
        endpoints: [],
        folderPath: '',
        initiationCommand: ''
    };

    return (
        <div className="w-1/5 h-full bg-black rounded-lg p-4 overflow-y-auto" data-tauri-drag-region>            
            {/* Regular Services */}
            <div className="space-y-2 mb-4">
                <h2 className="text-sm font-semibold text-gray-400 mb-2 uppercase">Services</h2>
                {serviceList.length === 0 ? (
                    <div className="text-gray-400 text-center py-4">
                        No services available
                    </div>
                ) : (
                    serviceList.map((service: LocalService) => (
                        <SideBarItem 
                            key={service.serviceName}
                            service={service}
                            isSelected={selectedService === service.serviceName}
                            onClick={() => handleServiceClick(service.serviceName)}
                        />
                    ))
                )}
            </div>

            {/* Dock Section */}
            <div className="space-y-2 pt-4 border-t border-gray-800">
                <h2 className="text-sm font-semibold text-gray-400 mb-2 uppercase">Tools</h2>
                <SideBarItem 
                    service={dockService}
                    isSelected={selectedService === 'dock'}
                    onClick={() => handleServiceClick('dock')}
                />
            </div>
        </div>
    );
};

export default SideBarView;
