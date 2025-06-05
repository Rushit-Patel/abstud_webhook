'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import PermissionForm from './PermissionForm';
import { Edit2 } from 'lucide-react';
import { ButtonWithTooltip } from '@/components/ui/button-with-tooltip';

export default function EditPermission({ onSuccess, permission }: { permission: Permission; onSuccess: () => void }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <ButtonWithTooltip 
                    variant="ghost" 
                    size="icon" 
                    tooltip="Edit"
                >
                    <Edit2 className="h-4" />
                </ButtonWithTooltip>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Permission</DialogTitle>
                </DialogHeader>
                <PermissionForm permission={permission} onSuccess={onSuccess}/>
            </DialogContent>
        </Dialog>
    );
}
