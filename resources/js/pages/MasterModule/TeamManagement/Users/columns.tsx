'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Clipboard, Copy, Edit2 } from 'lucide-react';
import { User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { ButtonWithTooltip } from '@/components/ui/button-with-tooltip';
import DeleteUser from './delete';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner'; // Optional: for showing "Copied!" messages

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "id",
        header: "Id",
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <div>{row.original.name}</div>,
    },
    {
        accessorKey: "mobile",
        header: 'Mobile',
        cell: ({ row }) => <div>{row.original.mobile}</div>,
    },
    {
        accessorKey: "email",
        header: 'Email',
        cell: ({ row }) => <div>{row.original.email}</div>,
    },
    {
        accessorKey: "username",
        header: 'User Name',
        cell: ({ row }) => {
            const copyUsername = () => {
                navigator.clipboard.writeText(row.original.username || '');
                toast.success('Username copied!');
            };
            return (
                <button
                    className="text-blue-600 flex items-center gap-1 underline hover:opacity-75"
                    onClick={copyUsername}
                >
                    <Copy size={12} />
                    {row.original.username}
                </button>
            );
        },
    },
    {
        accessorKey: "base_password",
        header: 'Password',
        cell: ({ row }) => {
            const decodedPassword = row.original.base_password
                ? atob(row.original.base_password)
                : '';

            const copyPassword = () => {
                navigator.clipboard.writeText(decodedPassword);
                toast.success('Password copied!');
            };

            return (
                <button
                    className="text-blue-600 flex items-center gap-1 underline hover:opacity-75"
                    onClick={copyPassword}
                >
                    <Copy size={12} />
                    {decodedPassword}
                </button>

            );
        },
    },
    {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
            <div className="flex flex-wrap gap-1">
                {row.original.roles?.map(role => (
                    <Badge key={role.id} variant="secondary">
                        {role.name}
                    </Badge>
                ))}
            </div>
        ),
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            const user: User = row.original;
            return (
                <>
                    <ButtonWithTooltip
                        variant="ghost"
                        size="icon"
                        tooltip="Edit"
                    >
                        <Link href={route('users.edit', user.id)}>
                            <Edit2 />
                        </Link>
                    </ButtonWithTooltip>
                    <DeleteUser user={user} onSuccess={() => router.visit(route('users.index'))} />
                </>
            );
        },
    },
];
