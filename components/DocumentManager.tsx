'use client';

import axios from 'axios';

export interface DocumentItem {
  id: string;
  type: 'document';
  title: string;
  plainText?: string;
  sizeInBytes?: number;
  updatedAt?: string;
}

interface FileSystemItem {
  id: string;
  type: 'folder' | 'document';
  title: string;
}

/**
 * Document Manager for handling documents in the application
 */
export class DocumentManager {
  /**
   * Load the file system with documents and folders
   */
  static async loadFileSystem(): Promise<FileSystemItem[]> {
    // Get API base URL from environment or use fallback
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/documents/`);
      return response.data.documents || [];
    } catch (error) {
      console.error("Error loading documents:", error);
      return [];
    }
  }
} 