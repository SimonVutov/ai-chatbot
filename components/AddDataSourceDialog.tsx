'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddDataSourceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDataSource: (dataSource: { name: string; type: string }) => void;
}

export default function AddDataSourceDialog({
  isOpen,
  onClose,
  onAddDataSource,
}: AddDataSourceDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddDataSource({ name, type });
    setName('');
    setType('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Add Data Source</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Data Source Name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <Input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g., database, api, file"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Data Source
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 