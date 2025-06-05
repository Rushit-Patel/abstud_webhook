import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router, usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';


interface PermissionFormProps {
    onSuccess?: () => void;
    permission?: {
        id: number;
        name: string;
        guard_name: string;
        curd: number;
    };
}
interface PermissionFormValues {
    name: string;
    guard_name: string;
    curd: number;
}

export default function PermissionForm({ onSuccess, permission }: PermissionFormProps) {
    const { errors: pageErrors } = usePage().props;
    const isEditMode = !!permission;

    const form = useForm<PermissionFormValues>({
        defaultValues: {
            name: '',
            guard_name: 'web',
            curd: 0
        }
    });
    // Reset form when permission changes
    useEffect(() => {
        if (permission) {
            form.reset({
                name: permission.name,
                guard_name: permission.guard_name,
                curd: permission.curd
            });
        }
    }, [permission, form]);

    const handleSuccess = () => {
        if (onSuccess) {
            onSuccess();
        }
    };
   
    const handleSubmit = async (data: any) => {
        try {
            if (isEditMode && permission) {
                await router.put(route('permissions.update', permission.id), data, {
                    onSuccess: () => {
                        toast.success('Permission updated successfully');
                        handleSuccess();
                    }
                });
            } else {
                await router.post(route('permissions.store'), data, {
                    onSuccess: () => {
                        toast.success('Permission created successfully');
                        handleSuccess();
                        form.reset();
                    }
                });
            }
        } catch (error) {
            toast.error('An error occurred while saving the permission');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Permission Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter permission name"
                                    {...field}
                                    
                                />
                            </FormControl>
                            <FormMessage>{pageErrors?.name}</FormMessage>
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
                                <Input
                                    placeholder="Enter guard name"
                                    {...field}
                                    
                                />
                            </FormControl>
                            <FormMessage>{pageErrors?.guard_name}</FormMessage>
                        </FormItem>
                    )}
                />
                {isEditMode ? (
                    <div className=""></div>
                ) : (
                    <FormField
                        control={form.control}
                        name="curd"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="crud-access"
                                        checked={field.value === 1}
                                        onCheckedChange={(checked) => 
                                            field.onChange(checked ? 1 : 0)
                                        }
                                    />
                                    <Label htmlFor="crud-access">CRUD Access</Label>
                                </div>
                                <FormMessage>{pageErrors?.curd}</FormMessage>
                            </FormItem>
                        )}
                    />
                )}
                

                <Button 
                    type="submit" 
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isEditMode ? 'Saving...' : 'Creating...'}
                        </>
                    ) : (
                        isEditMode ? 'Update Permission' : 'Create Permission'
                    )}
                </Button>
            </form>
        </Form>
    );
}