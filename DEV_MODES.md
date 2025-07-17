# Development Modes

This crossword application supports two different development modes for testing and development purposes.

## Available Modes

### 1. Mock Mode (Default)
Uses the `MockPuzzleService` which returns hardcoded puzzle data from the service file.

**To run:**
```bash
npm run dev:mock
# or simply
npm run dev
```

**Environment:** Uses `.env.development.mock`
- `VITE_USE_MOCK_DATA=true`
- `VITE_API_BASE_URL=http://localhost:3000/api` (not used in mock mode)

### 2. API Mode
Uses the `PuzzleService` which fetches puzzle data from a real API endpoint.

**To run:**
```bash
npm run dev:api
```

**Environment:** Uses `.env.development.api`
- `VITE_USE_MOCK_DATA=false`
- `VITE_API_BASE_URL=http://localhost:3000/api`

## How It Works

The application uses a service factory (`src/services/serviceFactory.ts`) that checks the `VITE_USE_MOCK_DATA` environment variable to determine which service to instantiate:

- **When `VITE_USE_MOCK_DATA=true`**: Returns `MockPuzzleService` instance
- **When `VITE_USE_MOCK_DATA=false`**: Returns `PuzzleService` instance with the configured API base URL

## Environment Files

- `.env.development.mock` - Configuration for mock mode
- `.env.development.api` - Configuration for API mode  
- `.env.development` - Active development configuration (copied from one of the above)

## Manual Configuration

You can also manually switch modes by:
1. Copying the desired environment file: `cp .env.development.mock .env.development`
2. Or directly editing `.env.development` to change `VITE_USE_MOCK_DATA`

## Console Logging

The service factory logs which service is being used when the application starts:
- `🔧 Using MockPuzzleService` - Mock mode active
- `🌐 Using ApiPuzzleService with baseUrl: [url]` - API mode active 