import { ServiceEndpoint, createLocalService } from '../../src/models/service/serviceModel';

// Default configuration for the Ollama service
const DEFAULT_PORT = 11434;
const DEFAULT_HOST = 'localhost';
const DEFAULT_FOLDER_PATH = '';
const DEFAULT_INITIATION_COMMAND = '';

// Define the endpoints (currently empty)
const ollamaEndpoints: ServiceEndpoint[] = [
    {
        path: '/api/generate',
        method: 'POST',
        dataTypes: {
            input: 'GenerateRequest',
            output: 'GenerateResponse'
        },
        description: 'Generate text using the specified model and prompt'
    }
];

// Create the Ollama service instance
export const ollamaService = createLocalService(
    'ollama',
    DEFAULT_PORT,
    ollamaEndpoints,
    `http://${DEFAULT_HOST}:${DEFAULT_PORT}`,
    DEFAULT_FOLDER_PATH,
    DEFAULT_INITIATION_COMMAND
);

// Configuration type for the Ollama service
export type OllamaConfig = {
    host: string;
    port: number;
}

// Define the request and response types for the /api/generate endpoint
export type GenerateRequest = {
    model: string;
    prompt: string;
    format: string;
    stream: boolean;
};

export type GenerateResponse = {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
    context: number[];
    total_duration: number;
    load_duration: number;
    prompt_eval_count: number;
    prompt_eval_duration: number;
    eval_count: number;
    eval_duration: number;
};
