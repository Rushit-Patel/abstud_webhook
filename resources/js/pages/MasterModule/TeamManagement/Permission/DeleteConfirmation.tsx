import { Button } from '@/components/ui/button';
import { ButtonWithTooltip } from '@/components/ui/button-with-tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { Loader2, Trash, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DeleteConfirmationProps {
    permission: {
        id: number;
        name: string;
    };
    onSuccess?: () => void;
}

export default function DeleteConfirmation({ permission, onSuccess }: DeleteConfirmationProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('permissions.destroy', permission.id), {
            onSuccess: () => {
                toast.success('Permission deleted successfully!');
                setIsOpen(false);
                onSuccess?.();
            },
            onError: () => {
                toast.error('Failed to delete permission');
            },
            onFinish: () => setIsDeleting(false)
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <ButtonWithTooltip 
                    variant="ghost" 
                    size="icon" 
                    tooltip="Delete"
                    className='font-sm'
                >    
                    <span>
                        <Trash2 />
                    </span>
                </ButtonWithTooltip>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Permission</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p>Are you sure you want to delete <strong>{permission.name}</strong>?</p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Confirm Delete'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}