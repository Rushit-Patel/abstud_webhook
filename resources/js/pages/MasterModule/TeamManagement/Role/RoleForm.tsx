import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { router, usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface GroupPermission {
    permission: string;
    list: {
        id: number;
        name: string;
    }[];
}

interface RoleFormValues {
    name: string;
    guard_name: string;
    permissions: number[];
}

interface Props {
    permissions: GroupPermission[];
    onSuccess?: () => void;
    role?: {
        id: number;
        name: string;
        guard_name: string;
        permissions: Permission[];
    };
}

export default function RoleForm({ onSuccess, role, permissions }: Props) {
    const { errors: pageErrors } = usePage().props;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditMode = !!role;

    const form = useForm<RoleFormValues>({
        defaultValues: {
            name: '',
            guard_name: 'web',
            permissions: [],
        },
    });

    useEffect(() => {
        if (role) {
            form.reset({
                name: role.name,
                guard_name: role.guard_name,
                permissions: role.permissions?.map((permission) => permission.id),
            });
        }
    }, [role, form]);

    const handleSuccess = () => {
        if (onSuccess) onSuccess();
    };

    const handleSubmit = async (data: RoleFormValues) => {
         
        const submitData = {
            ...data,
            permission_ids: data.permissions,
        };
        try {
            setIsSubmitting(true);
            if (isEditMode) {
                await router.put(route('roles.update', role!.id), submitData, {
                    onSuccess: () => {
                        toast.success('Role updated successfully');
                        handleSuccess();
                    },
                });
            } else {
                await router.post(route('roles.store'), submitData, {
                    onSuccess: () => {
                        toast.success('Role created successfully');
                        handleSuccess();
                        form.reset();
                    },
                });
            }
        } catch (error) {
            toast.error('An error occurred while saving the role');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-0">
                <div className="grid grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter role name" {...field} />
                                </FormControl>
                                <FormMessage className="min-h-[20px]">{pageErrors?.name}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="guard_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Guard Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter guard name" {...field} />
                                </FormControl>
                                <FormMessage className="min-h-[20px]">{pageErrors?.guard_name}</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-1 border-t border-b py-2">
                    <h4 className="text-sm font-medium">Permissions</h4>
                    <p className="text-muted-foreground text-sm">List of permissions to assign to the role</p>
                </div>

                <FormField
                    control={form.control}
                    name="permissions"
                    render={({ field }) => (
                        <FormItem>
                            <div className="grid grid-cols-2 gap-4">
                                {permissions.map((group) => (
                                    <div key={group.permission} className="rounded-lg border p-4">
                                        <h4 className="mb-2 border-b pb-2 text-sm font-medium">
                                            {group.permission.charAt(0).toUpperCase() + group.permission.slice(1)}
                                        </h4>
                                        <div className="space-y-2">
                                            {group.list.map((permission) => (
                                                <div key={permission.id} className="flex items-center space-x-2">
                                                    <FormControl>
                                                        <Checkbox
                                                            id={`permission-${permission.id}`}
                                                            checked={field.value.includes(permission.id)}
                                                            onCheckedChange={(checked) => {
                                                                const newValue = checked
                                                                    ? [...field.value, permission.id]
                                                                    : field.value.filter((id) => id !== permission.id);
                                                                field.onChange(newValue);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel htmlFor={`permission-${permission.id}`} className="text-sm font-normal">
                                                        {permission.name}
                                                    </FormLabel>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <FormMessage className="min-h-[20px]">{pageErrors?.permissions}</FormMessage>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isEditMode ? 'Saving...' : 'Creating...'}
                            </>
                        ) : isEditMode ? (
                            'Update Role'
                        ) : (
                            'Create Role'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
