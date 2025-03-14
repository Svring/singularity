import { ServiceEndpoint, createLocalService } from '../../src/models/service/serviceModel';

// Input/Output types for the Operator service
export type ClickRequest = {
    x: number;
    y: number;
    button?: 'left' | 'right' | 'middle';  // Default is 'left'
}

export type ClickResponse = {
    success: boolean;
    message: string;
}

export type MoveRequest = {
    x: number;
    y: number;
}

export type MoveResponse = {
    success: boolean;
    message: string;
}

export type ScreenSizeResponse = {
    width: number;
    height: number;
}

export type ScreenshotRequest = {
    region?: number[];  // Optional [left, top, width, height]
    format?: string;    // Image format: png, jpg, etc.
    full_screen?: boolean;
}

export type ScreenshotBase64Response = {
    success: boolean;
    format: string;
    base64_image: string;
    is_full_screen: boolean;
}

export type ProbeResponse = {
    message: string;
}

// Default configuration for the Operator service
const DEFAULT_PORT = 8001;
const DEFAULT_HOST = 'localhost';
const DEFAULT_FOLDER_PATH = '/Users/linkling/Services/Operator';
const DEFAULT_INITIATION_COMMAND = 'python app.py';

// Define the endpoints
const operatorEndpoints: ServiceEndpoint[] = [
    {
        path: '/click',
        method: 'POST',
        dataTypes: {
            input: 'ClickRequest',
            output: 'ClickResponse'
        },
        description: 'Perform a mouse click at the specified coordinates'
    },
    {
        path: '/move',
        method: 'POST',
        dataTypes: {
            input: 'MoveRequest',
            output: 'MoveResponse'
        },
        description: 'Move the mouse cursor to the specified coordinates'
    },
    {
        path: '/screen_size',
        method: 'GET',
        dataTypes: {
            output: 'ScreenSizeResponse'
        },
        description: 'Get the screen dimensions'
    },
    {
        path: '/screenshot_base64',
        method: 'POST',
        dataTypes: {
            input: 'ScreenshotRequest',
            output: 'ScreenshotBase64Response'
        },
        description: 'Take a screenshot and return it as a base64 encoded string'
    },
    {
        path: '/',
        method: 'GET',
        dataTypes: {
            output: 'ProbeResponse'
        },
        description: 'Health check endpoint for the Operator service'
    }
];

// Create the Operator service instance
export const operatorService = createLocalService(
    'operator',
    DEFAULT_PORT,
    operatorEndpoints,
    `http://${DEFAULT_HOST}:${DEFAULT_PORT}`,
    DEFAULT_FOLDER_PATH,
    DEFAULT_INITIATION_COMMAND
);

// Configuration type for the Operator service
export type OperatorConfig = {
    host: string;
    port: number;
}
