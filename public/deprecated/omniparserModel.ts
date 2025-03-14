import { ServiceEndpoint, createLocalService } from '../../src/models/service/serviceModel';

// Input/Output types for the Omniparser service
export type ParseRequest = {
    base64_image: string;
}

export type ParseResponse = {
    som_image_base64: string;
    parsed_content_list: any[];  // You might want to type this more specifically based on the actual content
    latency: number;
}

export type ProbeResponse = {
    message: string;
}

// Default configuration for the Omniparser service
const DEFAULT_PORT = 8000;
const DEFAULT_HOST = 'localhost';
const DEFAULT_FOLDER_PATH = '/Users/linkling/Services/OmniParser';
const DEFAULT_INITIATION_COMMAND = 'python -m ./omnitool/omniparserserver/omniparserserver';

// Define the endpoints
const omniparserEndpoints: ServiceEndpoint[] = [
    {
        path: '/parse/',
        method: 'POST',
        dataTypes: {
            input: 'ParseRequest',
            output: 'ParseResponse'
        },
        description: 'Parse an image and return the analysis results'
    },
    {
        path: '/probe/',
        method: 'GET',
        dataTypes: {
            output: 'ProbeResponse'
        },
        description: 'Health check endpoint for the Omniparser service'
    }
];

// Create the Omniparser service instance
export const omniparserService = createLocalService(
    'omniparser',
    DEFAULT_PORT,
    omniparserEndpoints,
    `http://${DEFAULT_HOST}:${DEFAULT_PORT}`,
    DEFAULT_FOLDER_PATH,
    DEFAULT_INITIATION_COMMAND
);

// Configuration type for the Omniparser service
export type OmniparserConfig = {
    som_model_path: string;
    caption_model_name: string;
    caption_model_path: string;
    device: string;
    BOX_TRESHOLD: number;
    host: string;
    port: number;
}
