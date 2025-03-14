import { create } from 'zustand';
import { LocalService } from '../../models/service/serviceModel';
import { invoke } from '@tauri-apps/api/core';

interface ServiceStore {
    services: {
        [key: string]: LocalService;
    };
    selectedService: string | null;
    getService: (serviceName: string) => LocalService | undefined;
    updateServiceStatus: (serviceName: string, status: LocalService['status']) => void;
    setSelectedService: (serviceName: string | null) => void;
    loadServiceConfig: () => Promise<void>;
}

export const useServiceStore = create<ServiceStore>((set, get) => ({
    services: {},
    selectedService: null,

    getService: (serviceName: string) => {
        return get().services[serviceName];
    },

    updateServiceStatus: (serviceName: string, status: LocalService['status']) => {
        set((state) => ({
            services: {
                ...state.services,
                [serviceName]: {
                    ...state.services[serviceName],
                    status
                }
            }
        }));
    },

    setSelectedService: (serviceName: string | null) => {
        set({ selectedService: serviceName });
    },

    loadServiceConfig: async () => {
        try {
            const config = await invoke('load_service_config');
            const services = parseServiceConfig(config);
            set({ services });
        } catch (error) {
            console.error('Failed to load service configuration:', error);
        }
    }
}));

function parseServiceConfig(config: any): { [key: string]: LocalService } {
    const services: { [key: string]: LocalService } = {};
    
    // The config has a top-level 'services' key
    const servicesConfig = config.services;
    
    // Parse each service from the services object
    for (const [_, serviceConfig] of Object.entries(servicesConfig)) {
        const config = serviceConfig as any;
        services[config.name] = {
            serviceName: config.name,
            port: config.port,
            baseUrl: config.base_url,
            endpoints: parseEndpoints(config.endpoints || []),
            status: config.status || 'stopped',
            folderPath: config.folder_path,
            initiationCommand: config.init_command
        };
    }
    
    return services;
}

function parseEndpoints(endpoints: any[]): LocalService['endpoints'] {
    return endpoints.map(endpoint => ({
        path: endpoint.path,
        method: endpoint.method,
        dataTypes: {
            input: endpoint.data_types?.input,
            output: endpoint.data_types?.output
        },
        description: endpoint.desc
    }));
}
