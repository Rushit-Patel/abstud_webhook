import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Edit2, Edit3, Trash2 } from 'lucide-react';
import DeleteRole from './delete';
import { ButtonWithTooltip } from '@/components/ui/button-with-tooltip';


interface Props {
    role: Role;
}

export default function RoleCard({ role }: Props) {
    return (
        <Card className="w-full max-w-sm rounded-xl py-0 shadow-sm">
            <CardContent className="p-4">
                <div className="flex grid-2 items-start justify-between">
                    <div>
                        <h5 className="mt-1 text-lg font-medium">{role.name}</h5>
                        <p className="text-muted-foreground text-sm">Total {role.users_count} users</p>
                    </div>
                    <div className="h-auto items-center self-center">
                        <ButtonWithTooltip 
                            variant="ghost" 
                            size="icon" 
                            tooltip="Edit"
                            asChild>
                            <Link href={route('roles.edit',role.id)}>
                                <Edit2 className="h-4" />
                            </Link>
                        </ButtonWithTooltip>
                        <DeleteRole role={role} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
