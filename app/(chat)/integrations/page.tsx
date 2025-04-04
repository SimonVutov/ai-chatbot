'use client';

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, File, Database } from "lucide-react";
import AddDataSourceDialog from "@/components/AddDataSourceDialog";
import FileUpload from "@/app/(chat)/documents/FileUpload";
import { formatFileSize } from "@/app/(chat)/documents/fileUtils";
import { DocumentManager, type DocumentItem } from "@/components/DocumentManager";
import HoverPreview from "@/components/HoverPreview";
import { GoogleIcon } from "@/components/icons";
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
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-gray-800 dark:text-gray-200">Connected as: <span className="font-medium">{connectedEmail}</span></p>
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
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
            <GoogleIcon />
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

export default function ManageDataSources() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncedCount, setSyncedCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [apiError, setApiError] = useState(false);
  
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
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

  // Add CSRF token handling here
  useEffect(() => {
    // Function to get CSRF token from cookies
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };
    
    // Set CSRF token in axios headers
    const csrftoken = getCookie('csrftoken');
    if (csrftoken) {
      axios.defaults.headers.common['X-CSRFToken'] = csrftoken;
    }
  }, []);

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

    checkConnectionStatus();
  }, [API_BASE_URL]);

  // Add debugging information:
  // Check connection status on mount
  useEffect(() => {
    // Log API URL for debugging
    console.log("Using API URL:", API_BASE_URL);

    const checkConnectionStatus = async () => {
      const url = `${API_BASE_URL}/api/google/status`;
      console.log("Checking connection status at:", url);
      
      try {
        const response = await axios.get(url);
        console.log("Connection status response:", response.data);
        setConnectedEmail(response.data.email);
        setIsConnected(response.data.connected);
        setSyncedCount(response.data.synced_count || 0);
        setApiError(false);
      } catch (error) {
        console.error("Connection status check failed:", error);
        if (axios.isAxiosError(error)) {
          console.error("Status:", error.response?.status);
          console.error("Data:", error.response?.data);
          console.error("Headers:", error.response?.headers);
        }
        setApiError(true);
        setIsConnected(false);
        setConnectedEmail(null);
      }
    };

    checkConnectionStatus();
  }, [API_BASE_URL]);

  // Handle search functionality
  const handleSearch = useCallback(async () => {
    console.log('Search Query:', query);

    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/search`, {
        params: { q: query },
      });
      
      // Deduplicate results based on filename
      const results = response.data.results || [] as SearchResult[];
      const uniqueResults = Array.from(
        new Map(results.map((result: SearchResult) => [result.filename, result])).values()
      ) as SearchResult[];
      
      setSearchResults(uniqueResults);
      setSearchMetrics({
        count: uniqueResults.length || 0,
        time: response.data.time || 100,
      });
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setSearchMetrics({ count: 0, time: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [query, API_BASE_URL]);

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
      
      // Instead of loading all documents and filtering locally,
      // call the API with search query directly
      const response = await axios.get(`${API_BASE_URL}/api/search`, {
        params: { q: searchQuery }
      });
      
      const results = response.data.results || [];
      const endTime = performance.now();
      
      setDocumentResults(results);
      setDocumentSearchMetrics({
        count: results.length,
        time: response.data.time || Math.round(endTime - startTime)
      });
    } catch (error) {
      console.error("Error searching documents:", error);
      setDocumentResults([]);
      setDocumentSearchMetrics({ count: 0, time: 0 });
    } finally {
      setIsLoadingDocuments(false);
    }
  }, [API_BASE_URL]);

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
      const response = await axios.get(`${API_BASE_URL}/api/auth/google/url`);
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Failed to get auth URL:", error);
      alert("Could not connect to Google Drive. Please try again later.");
    }
  };

  // Handle manual sync
  const handleSync = async () => {
    try {
      setSyncProgress(10); // Start progress indicator
      const response = await axios.post(`${API_BASE_URL}/api/google/sync`);
      if (response.data.success) {
        setSyncedCount(response.data.synced_count);
        setSyncProgress(100);
        setTimeout(() => setSyncProgress(0), 1000); // Reset after showing 100%
        
        // Refresh connection status to get updated sync count
        const statusResponse = await axios.get(`${API_BASE_URL}/api/google/status`);
        setIsConnected(statusResponse.data.connected);
        setConnectedEmail(statusResponse.data.email);
      } else {
        console.error("Sync failed:", response.data.error);
        setSyncProgress(0);
      }
    } catch (error) {
      console.error("Failed to sync:", error);
      setSyncProgress(0);
    }
  };

  const handleGoogleDisconnect = async () => {
    try {
      await axios.get(`${API_BASE_URL}/api/google/disconnect`);
      setIsConnected(false);
      setConnectedEmail(null);
      setSyncedCount(0);
    } catch (error) {
      console.error("Failed to disconnect Google account:", error);
      alert("Could not disconnect account. Please try again later.");
    }
  };

  const handleUpload = async (file: File) => {
    // This is a stub function - the actual upload is now handled by the
    // FileUpload component itself via XMLHttpRequest for progress tracking
    return Promise.resolve();
  };

  const handleFileClick = async (filename: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/file/${filename}`);
      setSelectedFile(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching file:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFile(null);
  };

  const handleAddDataSource = async (dataSource: { name: string; type: string }) => {
    try {
      await axios.post(`${API_BASE_URL}/api/datasources/`, dataSource);
      // Optionally refresh the data sources list after adding
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add data source:", error);
      alert("Could not add data source. Please try again later.");
    }
  };

  // Handler for source connections based on source ID
  const handleSourceAction = (sourceId: string) => {
    switch (sourceId) {
      case "google-drive":
        return isConnected ? handleGoogleDisconnect : handleGoogleConnect;
      case "dropbox":
        return async () => {
          try {
            const response = await axios.get(`${API_BASE_URL}/api/auth/dropbox/url`);
            window.location.href = response.data.url;
          } catch (error) {
            console.error("Failed to get Dropbox auth URL:", error);
            alert("Could not connect to Dropbox. Please try again later.");
          }
        };
      case "sharepoint":
        return async () => {
          try {
            const response = await axios.get(`${API_BASE_URL}/api/auth/sharepoint/url`);
            window.location.href = response.data.url;
          } catch (error) {
            console.error("Failed to get SharePoint auth URL:", error);
            alert("Could not connect to SharePoint. Please try again later.");
          }
        };
      default:
        return async () => {
          try {
            await axios.post(`${API_BASE_URL}/api/datasources/connect`, { sourceId });
            alert(`Connection initiated for ${sourceId}`);
          } catch (error) {
            console.error(`Failed to connect to ${sourceId}:`, error);
            alert(`Could not connect to ${sourceId}. Please try again later.`);
          }
        };
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
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center pb-2 border-b">
        <div>
          <h1 className="text-2xl font-bold">Data Management</h1>
          <p className="text-sm text-gray-500">Search your documents and connect to data sources</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Data Source
        </Button>
      </div>

      {apiError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          API connection error. Some features may not work properly.
        </div>
      )}

      {/* Combined Search Section */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documents..."
          className="w-full"
        />

        <div className="flex flex-wrap gap-2 mt-1">
          {searchMetrics && (
            <div className="text-xs text-gray-500 flex items-center">
              <Database className="h-3 w-3 mr-1" />
              <span>Database: {searchMetrics.count} {searchMetrics.count === 1 ? "result" : "results"} in {searchMetrics.time}ms</span>
            </div>
          )}
          {documentSearchMetrics && (
            <div className="text-xs text-gray-500 flex items-center">
              <File className="h-3 w-3 mr-1" />
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
                          <Database className="h-4 w-4 text-gray-500 flex-shrink-0" />
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


          {/* No results message */}
          {query.trim() && !isLoading && !isLoadingDocuments && searchResults.length === 0 && documentResults.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No results found. Try a different search term.
            </div>
          )}
        </div>
      </div>

      {/* Data sources grid - more compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dataSources.map((source) => (
          <Card key={source.id} className={`overflow-hidden hover:shadow transition-shadow duration-200 ${source.disabled ? 'opacity-70' : ''}`}>
            <CardHeader className="py-3 px-4 bg-gray-50">
              <CardTitle className="text-base">{source.name}</CardTitle>
              <CardDescription className="text-xs">{source.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
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

      <AddDataSourceDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAddDataSource={handleAddDataSource}
      />

      {/* File View Modal */}
      {showModal && selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-auto p-4 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">{selectedFile.filename}</h2>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                Close
              </Button>
            </div>
            <div className="border rounded p-4 bg-gray-50 overflow-auto">
              <pre className="whitespace-pre-wrap text-sm">{selectedFile.content}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-gray-400 mt-8 pt-4 border-t">
          API URL: {API_BASE_URL}
        </div>
      )}
    </div>
  );
} 