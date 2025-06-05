'use client';

import { Button } from "@/components/ui/button";
import { ButtonWithTooltip } from "@/components/ui/button-with-tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User } from "@/types";
import { router } from "@inertiajs/react";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";


export default function DeleteLead({ user, onSuccess }: { user: User, onSuccess?: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const handleSuccess = () => {
        if (onSuccess) onSuccess();
    };
    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('users.destroy', user.id), {
            onSuccess: () => {
                toast.success('User deleted successfully!');
                handleSuccess();
                setIsOpen(false);
            },
            onError: () => {
                toast.error('Failed to delete user');
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
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete "{user.name}" User? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
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
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
