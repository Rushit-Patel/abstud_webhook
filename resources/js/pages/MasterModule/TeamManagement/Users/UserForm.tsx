import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { User } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
    onSuccess?: () => void;
    user?: User;
    roles: Role[];
}
interface FormValues {
    name: string;
    email: string;
    roles: string[];
}

export default function UserForm({ user, roles, onSuccess }: Props) {
    const { errors: pageErrors } = usePage().props;
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const isEditMode = !!user;

    const form = useForm<FormValues>({
        defaultValues: {
            name: '',
            email: '',
            roles: [],
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name,
                email: user.email,
                roles: user.roles?.map(role => String(role.name)) || [],
            });
        }
    }, [user, form]);

    const handleSuccess = () => {
        if (onSuccess) onSuccess();
    };

    const handleSubmit = async (data: FormValues) => {
        const submitData = {
            ...data,
        };
        try {
            setIsSubmitting(true);
            if (isEditMode) {
                await router.put(route('users.update', user?.id), submitData, {
                    onSuccess: () => {
                        toast.success('User updated successfully');
                        handleSuccess();
                    },
                });
            } else {
                await router.post(route('users.store'), submitData, {
                    onSuccess: () => {
                        toast.success('User created successfully');
                        handleSuccess();
                        form.reset();
                    },
                });
            }
        } catch (error) {
            toast.error('An error occurred while saving the user');
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
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter name" {...field} />
                                </FormControl>
                                <FormMessage className="min-h-[20px]">{pageErrors?.name}</FormMessage>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Email" {...field} />
                                </FormControl>
                                <FormMessage className="min-h-[20px]">{pageErrors?.email}</FormMessage>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="roles"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Select Roles</FormLabel>
                                <FormControl>
                                    <MultiSelect
                                        options={roles.map(role => ({
                                            label: role.name,
                                            value: String(role.name),
                                        }))}
                                        selectedValues={field.value || []}
                                        onChange={field.onChange}
                                        placeholder="Select Roles..."
                                        className="w-full"
                                        />
                                </FormControl>
                                <FormMessage className="min-h-[20px]">{pageErrors?.roles}</FormMessage>
                            </FormItem>
                        )} />
                </div>

                <div className="space-y-1 border-t border-b py-2">
                    <h4 className="text-sm font-medium">Permissions</h4>
                    <p className="text-muted-foreground text-sm">List of permissions to assign to the role</p>
                </div>
 
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} className={isSubmitting ? 'opacity-50' : 'cursor-pointer hover:opacity-80'}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isEditMode ? 'Saving...' : 'Creating...'}
                            </>
                        ) : isEditMode ? (
                            'Update User'
                        ) : (
                            'Create User'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
