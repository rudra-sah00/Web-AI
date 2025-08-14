<div align="center">
  <h1>🚀 Ollama Web AI</h1>
  <p><em>A sophisticated web interface for seamless AI model interaction through Ollama</em></p>
  
  <div>
    <img src="https://img.shields.io/badge/Next.js-15.3.1-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
    <img src="https://img.shields.io/badge/Ollama-AI-FF6B35?style=for-the-badge&logo=artificial-intelligence&logoColor=white" alt="Ollama" />
  </div>
  
  <br />
  
  <p>
    <strong>Transform your local AI experience</strong> with this production-ready web application that bridges the gap between powerful Ollama models and intuitive user interaction.
  </p>
</div>

---

## 🌟 Key Features

<table>
  <tr>
    <td>🤖 <strong>Advanced Model Management</strong></td>
    <td>Browse, install, and configure AI models with real-time progress tracking</td>
  </tr>
  <tr>
    <td>💬 <strong>Intelligent Chat Interface</strong></td>
    <td>Modern, responsive chat UI with streaming responses and conversation history</td>
  </tr>
  <tr>
    <td>⚙️ <strong>Granular Configuration</strong></td>
    <td>Fine-tune model parameters, API endpoints, and application behavior</td>
  </tr>
  <tr>
    <td>🎨 <strong>Dynamic Theming</strong></td>
    <td>Dark/light mode support with system preference detection</td>
  </tr>
  <tr>
    <td>📱 <strong>Responsive Design</strong></td>
    <td>Optimized for desktop, tablet, and mobile devices</td>
  </tr>
  <tr>
    <td>🔄 <strong>Real-time Updates</strong></td>
    <td>Live streaming responses with progress indicators and error handling</td>
  </tr>
  <tr>
    <td>� <strong>Persistent Storage</strong></td>
    <td>Local chat history and configuration management</td>
  </tr>
  <tr>
    <td>🛡️ <strong>Type Safety</strong></td>
    <td>Full TypeScript implementation with comprehensive error handling</td>
  </tr>
</table>

## 🏗️ Technical Architecture

### Core Technologies
- **Frontend Framework**: Next.js 15.3.1 (App Router)
- **Language**: TypeScript 5.0 with strict type checking
- **UI Framework**: React 19.0 with modern hooks
- **Styling**: TailwindCSS 4.0 + shadcn/ui components
- **State Management**: React Context + Custom hooks
- **API Integration**: RESTful APIs with streaming support
- **Build Tool**: Turbopack for ultra-fast development

### Component Architecture
```
📦 Modular Component Structure
├── 🎯 AppLayout (Main application shell)
├── 💬 ChatModule (Core chat functionality)
├── 🎛️ SettingsDialog (Configuration management)
├── 📱 Sidebar (Navigation & chat history)
├── 🎨 ThemeProvider (Dark/light mode)
└── 🧩 UI Components (Reusable design system)
```

### Service Layer
- **OllamaService**: Direct API communication with Ollama
- **ChatService**: Chat session management and persistence
- **ConfigService**: Application configuration handling
- **ModelParameterService**: Model configuration management

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0+ ([Download](https://nodejs.org/))
- **Package Manager**: npm, yarn, or bun
- **Ollama**: Latest version ([Download](https://ollama.ai/download))

### Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/rudra-sah00/Web-AI.git
cd Web-AI

# 2. Install dependencies
npm install
# or using yarn
yarn install
# or using bun
bun install

# 3. Start Ollama service (in separate terminal)
ollama serve

# 4. Run development server
npm run dev
# or
yarn dev
# or
bun dev

# 5. Open your browser
# Navigate to http://localhost:3000
```

### Production Deployment

```bash
# Build optimized production bundle
npm run build

# Start production server
npm run start
```

## 🎯 Project Highlights

### 1. **Modern Next.js Implementation**
- **App Router**: Utilizing Next.js 15's latest routing paradigm
- **Server Components**: Optimized rendering with React Server Components
- **Turbopack**: Lightning-fast development with next-generation bundling
- **API Routes**: RESTful endpoints for chat management and configuration

### 2. **Advanced TypeScript Architecture**
```typescript
// Type-safe service layer with comprehensive interfaces
interface OllamaModel {
  id: string;
  name: string;
  description: string;
  parameters: ModelParameters;
  installed: boolean;
}

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  model?: string;
}
```

### 3. **Sophisticated UI/UX Design**
- **shadcn/ui**: Professional component library implementation
- **Radix UI**: Accessible, unstyled component primitives
- **Framer Motion**: Smooth animations and transitions
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Theme System**: Dynamic dark/light mode with system preference detection

### 4. **Real-time Features**
- **Streaming Responses**: Live AI response generation with progress indicators
- **WebSocket-like Experience**: Seamless real-time communication
- **Progress Tracking**: Model installation and download progress
- **Error Handling**: Comprehensive error boundaries and user feedback

### 5. **State Management & Performance**
- **Custom Hooks**: Reusable logic with `useOllamaModels`, `useModelSearch`
- **Context API**: Global state management for themes and configuration
- **Memoization**: Optimized re-rendering with React.memo and useMemo
- **Lazy Loading**: Code splitting for optimal bundle sizes

## 📁 Project Structure

```
Web-AI/
├── 📂 src/
│   ├── 📂 app/                 # Next.js App Router
│   │   ├── 📄 layout.tsx       # Root layout with providers
│   │   ├── 📄 page.tsx         # Main application page
│   │   └── 📂 api/             # API routes
│   │       ├── 📂 chats/       # Chat management endpoints
│   │       └── 📂 config/      # Configuration endpoints
│   ├── 📂 components/
│   │   ├── 📂 chat/            # Chat interface components
│   │   │   ├── 📄 ChatModule.tsx
│   │   │   ├── 📄 ChatHeader.tsx
│   │   │   ├── 📄 MessageInput.tsx
│   │   │   └── 📄 MessageItem.tsx
│   │   ├── 📂 setting/         # Settings components
│   │   ├── 📂 sidebar/         # Navigation components
│   │   ├── 📂 theme/           # Theme system
│   │   └── 📂 ui/              # Reusable UI components
│   ├── 📂 services/            # Business logic layer
│   │   ├── 📄 OllamaService.ts # Ollama API integration
│   │   ├── 📄 ChatService.ts   # Chat management
│   │   └── 📄 ConfigService.ts # Configuration handling
│   └── 📂 lib/                 # Utilities and helpers
├── 📂 data/                    # Application data
│   ├── 📄 runtime-config.json  # Runtime configuration
│   └── 📂 chats/               # Stored conversations
└── 📄 components.json          # shadcn/ui configuration
```

## 🛠️ Technical Implementation Details

### API Integration
```typescript
class OllamaService {
  private apiUrl: string;
  private modelInstallProgress: Map<string, ProgressData>;
  
  async streamGeneration(prompt: string, model: string): Promise<ReadableStream> {
    // Implementation of streaming responses with error handling
  }
  
  async pullModel(modelName: string, onProgress: ProgressCallback): Promise<void> {
    // Real-time model installation with progress tracking
  }
}
```

### Component Architecture
- **Compound Components**: Flexible, composable UI patterns
- **Render Props**: Dynamic component composition
- **Custom Hooks**: Reusable stateful logic
- **Higher-Order Components**: Cross-cutting concerns

### State Management Pattern
```typescript
// Custom hook for Ollama models
const useOllamaModels = () => {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Comprehensive state management with error boundaries
};
```

## 📊 Features Showcase

### 1. **Dynamic Model Management**
- Real-time model discovery and installation
- Progress tracking with visual indicators
- Model parameter fine-tuning interface
- Automatic model updates and health checks

### 2. **Advanced Chat Interface**
- Stream-based response rendering
- Message history with search and filtering
- Conversation branching and management
- Prompt template system for common use cases

### 3. **Configuration Management**
- Runtime configuration updates
- API endpoint management
- Model parameter presets
- Export/import settings functionality

### 4. **Performance Optimizations**
- Code splitting with dynamic imports
- Image optimization with Next.js Image component
- Bundle analysis and size optimization
- Efficient re-rendering with React.memo

## 🔧 Configuration & Customization

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_OLLAMA_API_URL=http://localhost:11434
NEXT_PUBLIC_APP_NAME=Ollama Web AI
NEXT_PUBLIC_MAX_CHAT_HISTORY=100
```

### Model Configuration
```json
{
  "ollamaModels": [
    {
      "id": "qwen:0.5b",
      "name": "Qwen 2.5 (0.5B)",
      "description": "Efficient small language model",
      "parameters": {
        "temperature": 0.9,
        "top_p": 0.5,
        "max_tokens": 4070
      }
    }
  ]
}
```

## 🚀 Development Workflow

### Code Quality & Standards
- **ESLint**: Strict linting with Next.js recommended rules
- **TypeScript**: Full type coverage with strict mode
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality assurance

### Testing Strategy
- **Unit Tests**: Component testing with Jest & React Testing Library
- **Integration Tests**: API route testing
- **E2E Tests**: User journey validation with Playwright
- **Type Safety**: Comprehensive TypeScript coverage

### Performance Monitoring
- **Lighthouse**: Performance, accessibility, and SEO optimization
- **Bundle Analyzer**: Code splitting optimization
- **Core Web Vitals**: Real user metrics tracking

## 🌐 Deployment Options

### Vercel (Recommended)
```bash
# One-click deployment
npx vercel

# Or connect your GitHub repository for automatic deployments
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Self-hosted
```bash
# Production build
npm run build

# Start with PM2
pm2 start npm --name "ollama-web-ai" -- start
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Fork the repository
git clone https://github.com/your-username/Web-AI.git

# Create feature branch
git checkout -b feature/amazing-feature

# Make your changes and commit
git commit -m "Add amazing feature"

# Push to your fork and create PR
git push origin feature/amazing-feature
```

## 📈 Roadmap

- [ ] **Multi-language Support** - Internationalization (i18n)
- [ ] **Plugin System** - Extensible architecture for custom integrations
- [ ] **Advanced Analytics** - Usage statistics and performance metrics
- [ ] **Team Collaboration** - Shared workspaces and chat rooms
- [ ] **API Documentation** - Interactive OpenAPI documentation
- [ ] **Mobile App** - React Native companion application

## 🏆 Technical Skills Demonstrated

<div align="center">
  <table>
    <tr>
      <th>Category</th>
      <th>Technologies</th>
      <th>Implementation</th>
    </tr>
    <tr>
      <td><strong>Frontend</strong></td>
      <td>React 19, Next.js 15, TypeScript</td>
      <td>Modern React patterns, Server Components, App Router</td>
    </tr>
    <tr>
      <td><strong>Styling</strong></td>
      <td>TailwindCSS, shadcn/ui, Framer Motion</td>
      <td>Design system, responsive design, animations</td>
    </tr>
    <tr>
      <td><strong>State Management</strong></td>
      <td>Context API, Custom Hooks</td>
      <td>Global state, local state optimization</td>
    </tr>
    <tr>
      <td><strong>API Integration</strong></td>
      <td>REST APIs, Streaming, WebSockets</td>
      <td>Real-time communication, error handling</td>
    </tr>
    <tr>
      <td><strong>Performance</strong></td>
      <td>Code Splitting, Lazy Loading, Memoization</td>
      <td>Bundle optimization, render optimization</td>
    </tr>
    <tr>
      <td><strong>Developer Experience</strong></td>
      <td>TypeScript, ESLint, Hot Reload</td>
      <td>Type safety, code quality, fast development</td>
    </tr>
  </table>
</div>

## 📞 Contact & Support

<div align="center">
  <p>
    <strong>Developed with ❤️ by Rudra Sah</strong>
  </p>
  
  <p>
    <a href="https://github.com/rudra-sah00">
      <img src="https://img.shields.io/badge/GitHub-rudra--sah00-181717?style=for-the-badge&logo=github" alt="GitHub" />
    </a>
    <a href="mailto:your.email@example.com">
      <img src="https://img.shields.io/badge/Email-Contact-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" />
    </a>
    <a href="https://linkedin.com/in/rudra-sah">
      <img src="https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
    </a>
  </p>
</div>

---

<div align="center">
  <p><strong>⭐ Star this repository if you find it helpful!</strong></p>
  <p><em>This project showcases modern web development practices and is actively maintained.</em></p>
</div>
