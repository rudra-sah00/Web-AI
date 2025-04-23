export interface ModelParameters {
  temperature: number;
  top_p: number;
  max_tokens: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface OllamaModel {
  id: string;
  name: string;
  description: string;
  parameters: ModelParameters;
  installed: boolean;
}

export interface ChatSettings {
  streamResponses: boolean;
  saveHistory: boolean;
  maxHistoryItems: number;
}

export interface AppSettings {
  apiEndpoint: string;
  defaultModel: string;
  chatSettings: ChatSettings;
}

export interface AppConfig {
  ollamaModels: OllamaModel[];
  defaultSettings: AppSettings;
}

export interface ModelResponse {
  models: OllamaModel[];
}

export interface StatusResponse {
  status: "success" | "error";
  message: string;
}

export interface GenerationOptions {
  model: string;
  prompt: string;
  stream?: boolean;
  context?: number[];  
  system?: string;    
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
    max_tokens?: number;
    stop?: string[];
  };
}

export interface ModelPullOptions {
  name: string;
  stream?: boolean;
}

export interface ModelListResponse {
  models: {
    name: string;
    modified_at: string;
    size: number;
    digest: string;
    details: {
      format: string;
      family: string;
      families: string[];
      parameter_size: string;
      quantization_level: string;
    };
  }[];
}