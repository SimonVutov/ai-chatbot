'use client';

import { useState } from 'react';
import { PlusIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarToggle } from '@/components/sidebar-toggle';

export default function IntegrationsPage() {
  const [apiError, setApiError] = useState(true);

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
        <SidebarToggle />
        <h1 className="text-xl font-semibold">Data Management</h1>
      </header>

      <div className="flex-1 overflow-auto px-4 md:px-6 py-4 max-w-5xl mx-auto w-full">
        <div className="mb-6">

          {apiError && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-yellow-800 mb-6">
              API connection error. Some features may not work properly.
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Search Your Documents</h2>
            <Input 
              placeholder="Start typing to search..." 
              className="w-full"
            />
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Connect Your Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-medium">File Upload</h3>
                <p className="text-gray-500 dark:text-gray-400">Upload files from your computer to be indexed</p>
                <Button className="w-full">Choose File</Button>
              </div>
              
              <div className="border rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-medium">Google Drive</h3>
                <p className="text-gray-500 dark:text-gray-400">Connect your Google Drive account to access your documents</p>
                <Button className="w-full">Connect Google Drive</Button>
              </div>
              
              <div className="border rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-medium">Database</h3>
                <p className="text-gray-500 dark:text-gray-400">Connect to your database to import documents</p>
                <div className="text-sm text-gray-500 dark:text-gray-400 py-1">Coming Soon</div>
              </div>
              <div className="border rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-medium">Notion</h3>
                <p className="text-gray-500 dark:text-gray-400">Connect to your Notion account to import documents</p>
                <div className="text-sm text-gray-500 dark:text-gray-400 py-1">Coming Soon</div>
              </div>
              <div className="border rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-medium">Slack</h3>
                <p className="text-gray-500 dark:text-gray-400">Connect to your Slack account to import documents</p>
                <div className="text-sm text-gray-500 dark:text-gray-400 py-1">Coming Soon</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
} 