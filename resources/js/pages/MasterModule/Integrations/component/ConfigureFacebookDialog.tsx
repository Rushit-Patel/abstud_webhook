import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from '@inertiajs/react';
import { Facebook } from 'lucide-react';

interface ConfigureFacebookDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function ConfigureFacebookDialog({ open, onClose }: ConfigureFacebookDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Configure Facebook Leads</DialogTitle>
                    <DialogDescription>Setup your Facebook account to automatically fetch leads into Abstud CRM.</DialogDescription>
                </DialogHeader>
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        className="gap-2"
                        asChild
                    >
                        {/* <Link href={route('integrations.facebook-auth')} target="_blank"> */}
                        <a href={route('integrations.facebook-auth')}>

                            <Facebook size={20} /> Login with Facebook
                        {/* </Link> */}
                        </a>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
