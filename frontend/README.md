# gitagu Frontend

This is the frontend for gitagu, an open-source utility under Microsoft that helps developers leverage AI agents for their Software Development Life Cycle (SDLC).

## Features

- Elegant dark theme UI with Microsoft's Fluent design system
- Homepage showcasing different AI agents and their capabilities
- Repository-specific pages showing how agents can work with GitHub repositories
- Repository analysis feature using Azure AI Agents

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/microsoft/gitagu.git
cd gitagu/frontend

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The application will be available at http://localhost:5173

### Environment Variables

Create a `.env.development` file in the root directory with the following variables:

```
VITE_API_URL=http://localhost:8000
```

For production, create a `.env.production` file:

```
VITE_API_URL=https://api.gitagu.com
```

## Building for Production

```bash
npm run build
```

This will generate a `dist` directory with the production build.

## Project Structure

- `src/App.tsx` - Main application component with routing
- `src/components/` - Reusable UI components
- `src/assets/` - Static assets like images and icons

## Learn More

Visit [gitagu.com](https://gitagu.com) to see the live application and explore how AI agents can enhance your development workflow.

---

© 2025 Microsoft Corporation. gitagu is an open source project.
