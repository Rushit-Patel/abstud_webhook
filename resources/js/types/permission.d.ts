interface Permission {
    name: string;
    guard_name: string;
    curd: number;
    id: number;
}
interface GroupPermission {
    permission: string;
    list: Permission[];
}

interface Role {
    id: number;
    name: string;
    users_count?: number;
    guard_name: string;
    permissions: Permission[];
}