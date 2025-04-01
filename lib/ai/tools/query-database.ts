import { tool } from 'ai';
import { z } from 'zod';
import axios from 'axios';

// Interface for search results
interface SearchResult {
  filename: string;
  match: number;
  content_snippet: string;
  format: string;
  size: number;
  dateAdded: string;
  content?: string;
  source?: string;
}

export const queryDatabase = tool({
  description: 'Search the database for documents matching a query',
  parameters: z.object({
    query: z.string().describe('The search query to find documents'),
  }),
  execute: async ({ query }) => {
    if (!query.trim()) {
      return {
        success: false,
        message: 'Query cannot be empty',
        results: [],
      };
    }

    try {
      // Use the same API base URL as in the integrations page
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      
      console.log(`Searching database for: "${query}"`);
      
      const response = await axios.get(`${API_BASE_URL}/api/search`, {
        params: { q: query },
      });
      
      // Deduplicate results based on filename
      const results = response.data.results || [] as SearchResult[];
      const uniqueResults = Array.from(
        new Map(results.map((result: SearchResult) => [result.filename, result])).values()
      ) as SearchResult[];
      
      return {
        success: true,
        count: uniqueResults.length,
        time: response.data.time || 0,
        results: uniqueResults,
        message: `Found ${uniqueResults.length} document(s) matching "${query}"`,
      };
    } catch (error) {
      console.error('Database search error:', error);
      return {
        success: false,
        message: 'An error occurred while searching the database',
        results: [],
      };
    }
  },
}); 