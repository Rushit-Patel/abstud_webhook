
export interface DataTableColumn {
    name: string;
    selector: string;
    sortable: boolean;
}

export interface DataTableProps {
    columns: DataTableColumn[];
    data: any[];
    total: number;
    perPage: number;
    currentPage: number;
    routeName:string;
    routeParams?: Record<string, string | number>;
}

export interface DataTableRequest {
    page: number;
    perPage: number;
    sortColumn: string;
    sortDirection: 'asc' | 'desc';
    search?: string;
}

export interface DataTableResponse<T = any> {
    data: T[];
    total: number;
    columns: DataTableColumn[];
    perPage: number;
    currentPage:number;
}