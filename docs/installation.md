# Installation Guide

## Prerequisites

Before setting up Web-AI, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

## Step 1: Install Ollama

Ollama is required to run local AI models. Follow the installation steps for your operating system:

### macOS
```bash
# Install using Homebrew
brew install ollama

# Or download from official website
curl -fsSL https://ollama.ai/install.sh | sh
```

### Windows
1. Download Ollama installer from [ollama.ai](https://ollama.ai)
2. Run the installer and follow the setup wizard
3. Ollama will be available in your system PATH

### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Verify Installation
```bash
ollama --version
```

## Step 2: Start Ollama Service

```bash
# Start Ollama service (runs in background)
ollama serve
```

Keep this terminal open or run Ollama as a service. The default server runs on `http://localhost:11434`.

## Step 3: Download AI Models

Download at least one AI model to get started:

### Recommended Models

#### For Beginners (Smaller Models)
```bash
# Llama 3.2 (3B parameters - faster, good for testing)
ollama pull llama3.2:3b

# Phi 3 Mini (3.8B parameters - efficient)
ollama pull phi3:mini
```

#### For Better Performance (Larger Models)
```bash
# Llama 3.2 (11B parameters - balanced performance)
ollama pull llama3.2:11b

# Llama 3.1 (8B parameters - good balance)
ollama pull llama3.1:8b
```

#### For Maximum Quality (Requires more RAM)
```bash
# Llama 3.1 (70B parameters - highest quality)
ollama pull llama3.1:70b

# Code Llama (specialized for coding)
ollama pull codellama:13b
```

### Verify Model Installation
```bash
# List installed models
ollama list
```

## Step 4: Clone and Setup Web-AI

```bash
# Clone the repository
git clone https://github.com/rudra-sah00/Web-AI.git
cd Web-AI

# Install dependencies
npm install

# Or using yarn
yarn install
```

## Step 5: Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434

# Application Configuration
NEXT_PUBLIC_APP_NAME=Web-AI
NEXT_PUBLIC_APP_VERSION=1.0.0

# Optional: Custom model endpoint
NEXT_PUBLIC_OLLAMA_ENDPOINT=http://localhost:11434
```

## Step 6: Run the Application

### Development Mode
```bash
npm run dev
# Or
yarn dev
```

### Production Build
```bash
# Build the application
npm run build

# Start the production server
npm run start
```

The application will be available at `http://localhost:3000`.

## Step 7: Initial Configuration

1. **Open the application** in your browser
2. **Go to Settings** (gear icon in sidebar)
3. **Select a Model** in the Models section
4. **Configure Chat Settings** as needed
5. **Start your first conversation**

## Troubleshooting

### Common Issues

#### Ollama Connection Error
- Ensure Ollama service is running: `ollama serve`
- Check if Ollama is accessible: `curl http://localhost:11434/api/tags`
- Verify firewall isn't blocking port 11434

#### No Models Available
- Install at least one model: `ollama pull llama3.2:3b`
- Check installed models: `ollama list`
- Restart Web-AI after installing new models

#### Port Already in Use
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

#### Memory Issues with Large Models
- Use smaller models (3B-8B parameters) for systems with limited RAM
- Close other applications to free up memory
- Consider using quantized models (Q4, Q5 variants)

## Performance Tips

1. **Choose the right model size** for your hardware
2. **Keep Ollama running** in the background for faster responses
3. **Use SSD storage** for better model loading times
4. **Allocate sufficient RAM** (minimum 8GB for 7B models)

## Next Steps

- Read the [Architecture Guide](./architecture.md)
- Explore the [API Documentation](./api.md)
- Check out [Usage Examples](./examples.md)
