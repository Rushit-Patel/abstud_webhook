'use client';

import { PlusIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import PermissionForm from './PermissionForm';

export default function CreatePermission({ onSuccess }: { onSuccess: () => void }) {
  return (
    <Dialog>
        <DialogTrigger asChild>
            <Button variant="outline" size="sm">
                <PlusIcon className="h-4 w-4" />
                <span className="ml-2 hidden lg:inline">Add</span>
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Permission</DialogTitle>
            </DialogHeader>
            <PermissionForm onSuccess={onSuccess} />
        </DialogContent>
    </Dialog>
  );
}