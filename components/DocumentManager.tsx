'use client';

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
   * This is a mock implementation - in a real app this would fetch from an API
   */
  static async loadFileSystem(): Promise<FileSystemItem[]> {
    // Mock data
    return [
      {
        id: 'doc1',
        type: 'document',
        title: 'Getting Started Guide',
        plainText: 'This is a guide to help you get started with our platform.',
        sizeInBytes: 2048,
        updatedAt: '2023-04-15T14:30:00Z',
      },
      {
        id: 'doc2',
        type: 'document',
        title: 'API Documentation',
        plainText: 'Comprehensive API documentation with examples and use cases.',
        sizeInBytes: 5120,
        updatedAt: '2023-04-10T09:15:00Z',
      },
      {
        id: 'doc3',
        type: 'document',
        title: 'Project Notes',
        plainText: 'Notes from our last meeting about the project requirements.',
        sizeInBytes: 1024,
        updatedAt: '2023-04-18T16:45:00Z',
      },
    ] as FileSystemItem[];
  }
} 