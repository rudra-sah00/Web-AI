# Ollama AI - Web UI Interface

A modern web interface for interacting with the [Ollama](https://ollama.ai/) API. This application provides a user-friendly way to manage, configure, and chat with AI models running through Ollama.

![Ollama AI Web Interface](https://github.com/ollama/ollama/raw/main/docs/ollama.png)

## Features

- 🤖 **Model Management**: Browse, download, and manage Ollama models
- 💬 **Chat Interface**: Interact with AI models using a modern chat UI
- ⚙️ **Customizable Settings**: Configure API endpoints, model parameters, and chat behavior
- 🔄 **Streaming Responses**: Get real-time streaming responses from models
- 📋 **Chat History**: Save and browse your conversation history
- 🎛️ **Model Parameters**: Fine-tune temperature, top_p, and other generation parameters

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) or [bun](https://bun.sh/)
- [Ollama](https://ollama.ai/download) - The core Ollama application must be installed and running

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ollama-ai.git
cd ollama-ai
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

To create a production build:

```bash
npm run build
npm run start
# or
yarn build
yarn start
# or
bun run build
bun run start
```

## Configuration

### Ollama Service Configuration

Ollama AI Web UI connects to the Ollama service running on your system. By default, it connects to `http://localhost:11434`. You can change this in the application settings.

1. Make sure you have Ollama installed and running on your system
2. If running Ollama on a different host or port, update the API endpoint in the settings

### Initial Setup

1. Launch the application and navigate to the Settings page
2. Configure the API endpoint (default: http://localhost:11434)
3. Select a default model for chat interactions
4. Adjust chat settings according to your preferences

### Model Configuration

Models can be configured with custom parameters that will be used during generation:

1. Navigate to Settings > Models
2. Select a model to configure
3. Adjust parameters:
   - **temperature**: Controls randomness (higher = more random, lower = more focused)
   - **top_p**: Nucleus sampling parameter
   - **max_tokens**: Maximum length of generated text

### Chat Settings

Configure chat behavior:

1. Navigate to Settings
2. Adjust the following options:
   - **Stream Responses**: Enable/disable streaming mode
   - **Save History**: Enable/disable saving chat history
   - **Max History Items**: Configure the number of chat sessions to keep

## File Structure

The Ollama AI Web UI has the following structure:

```
data/
  chat-index.json      # Index of chat sessions
  runtime-config.json  # Runtime configuration
  chats/               # Stored chat sessions
src/
  app/                 # Next.js app router files
  components/          # UI components
    chat/              # Chat interface components
    setting/           # Settings components
    sidebar/           # Sidebar components
    ui/                # UI component library
  config/              # Default configuration
  lib/                 # Utility functions
  services/            # Core services for API interaction
```

### Key Configuration Files

- `src/config/config.json`: Default application configuration
- `data/runtime-config.json`: Runtime configuration that stores user settings

## Using Models

### Installing Models

1. Navigate to Models in the sidebar
2. Browse available models
3. Click "Install" next to the model you want to use
4. Wait for the download to complete

### Chatting with Models

1. Select a chat from the sidebar or create a new one
2. Choose a model (or use the default model)
3. Type your prompt in the input area and press Enter
4. View the AI's response in the chat area

### Model Parameters

Adjust the following parameters to control model behavior:

- **temperature**: Controls randomness (0.0 to 1.0)
- **top_p**: Nucleus sampling threshold (0.0 to 1.0)
- **max_tokens**: Maximum generation length

## Troubleshooting

### Connection Issues

If the application can't connect to Ollama:

1. Verify that Ollama is running:
   ```bash
   # Check Ollama status
   ollama ps
   ```
2. Check that the API endpoint is correctly configured
3. Ensure no firewall is blocking the connection

### Model Installation Issues

If model installation fails:

1. Check your internet connection
2. Verify that Ollama has sufficient permissions
3. Ensure you have enough disk space

### Generation Issues

If model responses seem incorrect:

1. Try adjusting the temperature parameter
2. Check that you're using the expected model
3. Verify that your prompt is clear and well-formatted

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)
