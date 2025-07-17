import { PuzzleService as ApiPuzzleService } from './puzzleService';
import { MockPuzzleService } from './mockPuzzleService';
import type { PuzzleService } from './types';

// Helper function to get environment variables (can be mocked in tests)
export function getEnvironmentConfig() {
  // In test environment, import.meta might not be available
  const env = typeof import.meta !== 'undefined' ? import.meta.env : {};
  return {
    useMockData: env.VITE_USE_MOCK_DATA === 'true',
    apiBaseUrl: env.VITE_API_BASE_URL || 'http://localhost:3000/api'
  };
}

export function createPuzzleService(config?: { useMockData?: boolean; apiBaseUrl?: string }): PuzzleService {
  const envConfig = config || getEnvironmentConfig();
  const useMockData = envConfig.useMockData ?? true; // Default to mock data
  
  if (useMockData) {
    console.log('🔧 Using MockPuzzleService');
    return new MockPuzzleService();
  } else {
    const baseUrl = envConfig.apiBaseUrl || 'http://localhost:3000/api';
    console.log('🌐 Using ApiPuzzleService with baseUrl:', baseUrl);
    return new ApiPuzzleService(baseUrl);
  }
}

export const puzzleService = createPuzzleService(); 