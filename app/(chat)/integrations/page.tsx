'use client';

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarToggle } from '@/components/sidebar-toggle';
import AddDataSourceDialog from "@/components/AddDataSourceDialog";
import FileUpload from "@/app/(chat)/documents/FileUpload";
import { formatFileSize } from "@/app/(chat)/documents/fileUtils";
import { DocumentManager, type DocumentItem } from "@/components/DocumentManager";
import HoverPreview from "@/components/HoverPreview";

// Configure axios defaults
axios.defaults.withCredentials = true;

// Search result interface
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

// Define a type for our data sources
interface DataSource {
  id: string;
  name: string;
  description: string;
  buttonText: string | {
    connect: string;
    sync: string;
    disconnect: string;
  };
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderComponent?: (props: any) => JSX.Element;
}

// Expanded data sources with all connection options
const dataSources: DataSource[] = [
  {
    id: "file-upload",
    name: "File Upload",
    description: "Upload files directly from your computer",
    buttonText: "",
    renderComponent: ({ onUpload }: { onUpload: (file: File) => Promise<void> }) => (
      <FileUpload onUpload={onUpload} />
    )
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Connect with Google Drive to import documents and spreadsheets.",
    buttonText: {
      connect: "Connect",
      sync: "Sync Documents",
      disconnect: "Disconnect"
    },
    renderComponent: ({ 
      isConnected, 
      connectedEmail, 
      syncedCount, 
      syncProgress, 
      onConnect, 
      onSync, 
      onDisconnect 
    }: { 
      isConnected: boolean;
      connectedEmail: string | null;
      syncedCount: number;
      syncProgress: number;
      onConnect: () => void;
      onSync: () => void;
      onDisconnect: () => void;
    }) => (
      isConnected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-blue-700">Connected as: <span className="font-medium">{connectedEmail}</span></p>
          </div>
          
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            <p className="text-sm">{syncedCount} files synced</p>
          </div>
          
          {syncProgress > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Syncing in progress...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${syncProgress}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={onSync}
              className="flex-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Sync
            </Button>
            <Button 
              variant="destructive"
              onClick={onDisconnect}
              className="flex-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-md border border-dashed border-gray-300">
            <p className="text-sm text-gray-600">Connect your Google Drive account to access your documents</p>
          </div>
          <Button
            onClick={onConnect}
            className="w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
            </svg>
            Connect with Google
          </Button>
        </div>
      )
    )
  },
  {
    id: "database",
    name: "Database",
    description: "Connect to your database to import documents",
    buttonText: "Coming Soon",
    disabled: true,
  },
  { 
    id: "dropbox", 
    name: "Dropbox", 
    description: "Import files and folders from your Dropbox account.",
    buttonText: "Coming Soon",
    disabled: true,
  },
  {
    id: "sharepoint",
    name: "SharePoint",
    description: "Connect to SharePoint to access your organization's documents.",
    buttonText: "Coming Soon",
    disabled: true,
  },
];

export default function IntegrationsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncedCount, setSyncedCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [apiError, setApiError] = useState(true);
  
  // Search-related state
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedFile, setSelectedFile] = useState<SearchResult | null>(null);
  const [searchMetrics, setSearchMetrics] = useState<{ count: number; time: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [documentResults, setDocumentResults] = useState<DocumentItem[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [documentSearchMetrics, setDocumentSearchMetrics] = useState<{ count: number; time: number } | null>(null);

  // Ensure consistent API base URL usage
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  // Check connection status on mount
  useEffect(() => {
    const checkConnectionStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/google/status`);
        setConnectedEmail(response.data.email);
        setIsConnected(response.data.connected);
        setSyncedCount(response.data.synced_count || 0);
        setApiError(false);
      } catch (error) {
        console.error("Connection status check failed:", error);
        setApiError(true);
        setIsConnected(false);
        setConnectedEmail(null);
      }
    };

    // Comment this out to keep the API error shown for demo purposes
    // checkConnectionStatus();
  }, [API_BASE_URL]);

  // Handle search functionality
  const handleSearch = useCallback(async () => {
    console.log('Search Query:', query);

    setIsLoading(true);
    try {
      // This is a mock implementation - in a real app it would call an API
      await new Promise(r => setTimeout(r, 1000)); // Simulate API call
      
      // Mock search results
      const mockResults = query ? [
        {
          filename: 'annual_report_2023.pdf',
          match: 85,
          content_snippet: `Contains "${query}" in section 3.4 of the annual financial report...`,
          format: 'PDF',
          size: 2500000,
          dateAdded: '2023-12-10',
        },
        {
          filename: 'project_proposal.docx',
          match: 72,
          content_snippet: `Project proposal mentioning "${query}" in context of market analysis...`,
          format: 'DOCX',
          size: 450000,
          dateAdded: '2023-11-15',
        }
      ] as SearchResult[] : [];
      
      setSearchResults(mockResults);
      setSearchMetrics({
        count: mockResults.length,
        time: 120, // Mock time in ms
      });
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setSearchMetrics({ count: 0, time: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  // Search in lexical documents
  const searchDocuments = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setDocumentResults([]);
      setDocumentSearchMetrics(null);
      return;
    }

    setIsLoadingDocuments(true);
    try {
      const startTime = performance.now();
      const fileSystem = await DocumentManager.loadFileSystem();
      
      // Filter documents based on search term
      const results = fileSystem.filter(item => {
        if (item.type !== 'document') return false;
        
        const doc = item as DocumentItem;
        const searchLower = searchQuery.toLowerCase();
        
        // Check title
        if (doc.title.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Check plain text content
        if (doc.plainText && doc.plainText.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        return false;
      }) as DocumentItem[];
      
      const endTime = performance.now();
      
      setDocumentResults(results);
      setDocumentSearchMetrics({
        count: results.length,
        time: Math.round(endTime - startTime)
      });
    } catch (error) {
      console.error("Error searching documents:", error);
    } finally {
      setIsLoadingDocuments(false);
    }
  }, []);

  // Combined search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
        searchDocuments(query);
      } else {
        setSearchResults([]);
        setSearchMetrics(null);
        setDocumentResults([]);
        setDocumentSearchMetrics(null);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query, handleSearch, searchDocuments]);

  // Handle Google Drive connection
  const handleGoogleConnect = async () => {
    try {
      // This would open the Google OAuth flow in a real implementation
      alert("This would redirect to Google auth in a real implementation");
      setIsConnected(true);
      setConnectedEmail("demo@example.com");
      setSyncedCount(12);
    } catch (error) {
      console.error("Failed to get auth URL:", error);
      alert("Could not connect to Google Drive. Please try again later.");
    }
  };

  // Handle manual sync
  const handleSync = async () => {
    try {
      setSyncProgress(10); // Start progress indicator
      
      // Simulate sync process
      for (let i = 20; i <= 90; i += 10) {
        await new Promise(r => setTimeout(r, 300));
        setSyncProgress(i);
      }
      
      // Complete sync
      setSyncedCount(prev => prev + 3);
      setSyncProgress(100);
      
      // Reset progress bar after showing 100%
      setTimeout(() => setSyncProgress(0), 1000);
    } catch (error) {
      console.error("Failed to sync:", error);
      setSyncProgress(0);
    }
  };

  const handleGoogleDisconnect = async () => {
    try {
      // Simulate disconnect
      await new Promise(r => setTimeout(r, 500));
      setIsConnected(false);
      setConnectedEmail(null);
      setSyncedCount(0);
    } catch (error) {
      console.error("Failed to disconnect Google account:", error);
      alert("Could not disconnect account. Please try again later.");
    }
  };

  const handleUpload = async (file: File) => {
    // Simulate upload
    await new Promise(r => setTimeout(r, 2000));
    console.log('File uploaded:', file.name);
    // In a real implementation, this would send the file to your backend
  };

  const handleFileClick = async (filename: string) => {
    try {
      // Simulate API call to get file content
      await new Promise(r => setTimeout(r, 500));
      
      // Mock file content
      const mockFile = {
        ...searchResults.find(r => r.filename === filename)!,
        content: `This is the simulated content of ${filename}.\n\nIt would contain the full text of the document in a real implementation.\n\nThe actual content would be retrieved from your database or storage system.`
      };
      
      setSelectedFile(mockFile);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching file:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFile(null);
  };

  const handleAddDataSource = (dataSource: { name: string; type: string }) => {
    // Here you would typically call an API to add a new data source
    console.log("Adding data source:", dataSource);
    setIsAddDialogOpen(false);
  };

  // Handler for source connections based on source ID
  const handleSourceAction = (sourceId: string) => {
    switch (sourceId) {
      case "google-drive":
        return isConnected ? handleGoogleDisconnect : handleGoogleConnect;
      case "dropbox":
      case "sharepoint":
        return () => console.log(`Connect to ${sourceId} clicked`);
      default:
        return () => console.log(`Action for ${sourceId} not implemented`);
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle document click
  const handleDocumentClick = (documentId: string) => {
    window.location.href = `/editor?document=${encodeURIComponent(documentId)}`;
  };

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
        <SidebarToggle />
        <h1 className="text-xl font-semibold">Data Management</h1>
      </header>

      <div className="flex-1 overflow-auto px-4 md:px-6 py-4 max-w-5xl mx-auto w-full">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Search your documents and connect to data sources</p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Add Data Source
            </Button>
          </div>

          {apiError && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-yellow-800 mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              API connection error. Some features may not work properly.
            </div>
          )}

          {/* Combined Search Section */}
          <div className="border rounded-lg p-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full"
            />

            <div className="flex flex-wrap gap-2 mt-1">
              {searchMetrics && (
                <div className="text-xs text-gray-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                    <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                    <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                  </svg>
                  <span>Database: {searchMetrics.count} {searchMetrics.count === 1 ? "result" : "results"} in {searchMetrics.time}ms</span>
                </div>
              )}
              {documentSearchMetrics && (
                <div className="text-xs text-gray-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <span>Documents: {documentSearchMetrics.count} {documentSearchMetrics.count === 1 ? "result" : "results"} in {documentSearchMetrics.time}ms</span>
                </div>
              )}
            </div>

            <div className="mt-3 space-y-2">
              {/* Database search results */}
              {(isLoading || searchResults.length > 0) && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Database Results</h3>
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
                    </div>
                  ) : (
                    searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <Card key={result.filename} className="cursor-pointer hover:bg-gray-50 transition-colors duration-200 mb-2" onClick={() => handleFileClick(result.filename)}>
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                                <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                                <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                              </svg>
                              <div className="flex flex-col md:flex-row md:items-center md:gap-3 w-full min-w-0">
                                <h3 className="font-medium text-sm truncate">{result.filename}</h3>
                                <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 flex-1 min-w-0">
                                  <span className="truncate">{result.content_snippet}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                                  <span>{result.format}</span>
                                  <span>•</span>
                                  <span>{formatFileSize(result.size)}</span>
                                  <span>•</span>
                                  <span>Added: {result.dateAdded}</span>
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                    {result.match}% Match
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="md:hidden mt-1">
                              <p className="text-xs text-gray-600 line-clamp-1">{result.content_snippet}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : query.trim() ? (
                      <div className="text-center py-2 text-gray-500 text-sm">
                        No database results found.
                      </div>
                    ) : null
                  )}
                </div>
              )}

              {/* Document search results */}
              {(isLoadingDocuments || documentResults.length > 0) && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Document Results</h3>
                  {isLoadingDocuments ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
                    </div>
                  ) : (
                    documentResults.length > 0 ? (
                      documentResults.map((doc) => (
                        <HoverPreview key={doc.id} content={doc.plainText || 'No content'}>
                          <Card className="cursor-pointer hover:bg-gray-50 transition-colors duration-200 mb-2" onClick={() => handleDocumentClick(doc.id)}>
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                                <div className="flex flex-col md:flex-row md:items-center md:gap-3 w-full min-w-0">
                                  <h3 className="font-medium text-sm truncate">{doc.title}</h3>
                                  <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 flex-1 min-w-0">
                                    <span className="truncate">{doc.plainText?.substring(0, 100) || 'No content'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                                    <span>Document</span>
                                    <span>•</span>
                                    <span>Size: {formatFileSize(doc.sizeInBytes || 0)}</span>
                                    <span>•</span>
                                    <span>Updated: {formatDate(doc.updatedAt)}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </HoverPreview>
                      ))
                    ) : query.trim() ? (
                      <div className="text-center py-2 text-gray-500 text-sm">
                        No document results found.
                      </div>
                    ) : null
                  )}
                </div>
              )}

              {/* No results message */}
              {query.trim() && !isLoading && !isLoadingDocuments && searchResults.length === 0 && documentResults.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No results found. Try a different search term.
                </div>
              )}
            </div>
          </div>

          {/* Data sources grid - more compact */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Connect Your Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {dataSources.map((source) => (
                <Card key={source.id} className={`hover:shadow-sm transition-shadow duration-200 ${source.disabled ? 'opacity-70' : ''}`}>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-base">{source.name}</CardTitle>
                    <CardDescription className="text-xs">{source.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {source.renderComponent ? (
                      source.id === "google-drive" ? (
                        source.renderComponent({
                          isConnected,
                          connectedEmail,
                          syncedCount,
                          syncProgress,
                          onConnect: handleGoogleConnect,
                          onSync: handleSync,
                          onDisconnect: handleGoogleDisconnect
                        })
                      ) : source.id === "file-upload" ? (
                        source.renderComponent({ onUpload: handleUpload })
                      ) : null
                    ) : (
                      <Button 
                        className="w-full" 
                        disabled={source.disabled}
                        variant={source.disabled ? "outline" : "default"}
                        onClick={source.disabled ? undefined : handleSourceAction(source.id)}
                      >
                        {typeof source.buttonText === 'string' ? source.buttonText : 'Connect'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <AddDataSourceDialog
            isOpen={isAddDialogOpen}
            onClose={() => setIsAddDialogOpen(false)}
            onAddDataSource={handleAddDataSource}
          />

          {/* File View Modal */}
          {showModal && selectedFile && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeModal}>
              <div className="bg-white dark:bg-gray-800 rounded-lg w-3/4 max-h-[80vh] overflow-auto p-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-bold">{selectedFile.filename}</h2>
                  <Button variant="ghost" size="sm" onClick={closeModal}>
                    Close
                  </Button>
                </div>
                <div className="border rounded p-3 bg-gray-50 dark:bg-gray-900 overflow-auto">
                  <pre className="whitespace-pre-wrap text-sm">{selectedFile.content}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 