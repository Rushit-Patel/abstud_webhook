import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs } from '@/components/ui/tabs';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import axios from 'axios';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Columns2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DataTableResponse } from '../types/datatable';

interface Props {
    endpoint: string;
    columns: ColumnDef<any>[];
    toolbarContent?: React.ReactNode;
    storageKey?: string; // Added storageKey prop for uniquely identifying this table
}

const DataTable = ({ endpoint, columns, toolbarContent, storageKey = "data-table-columns" }: Props) => {
    const [data, setData] = useState<DataTableResponse>({
        data: [],
        total: 0,
        columns: [],
        perPage: 10,
        currentPage: 1,
    });

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
        // Load saved column visibility state from localStorage on component mount
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : {};
        }
        return {};
    });
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);

    // Save column visibility state to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, JSON.stringify(columnVisibility));
        }
    }, [columnVisibility, storageKey]);

    const table = useReactTable({
        data: data.data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        manualPagination: true,
        pageCount: Math.ceil(data.total / data.perPage),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            globalFilter,
        },
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                page: table.getState().pagination.pageIndex + 1,
                perPage: table.getState().pagination.pageSize,
                sortColumn: sorting[0]?.id,
                sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
                search: globalFilter,
            };

            const response = await axios.get<DataTableResponse>(endpoint, { params });
            setData(response.data);
        } catch (error) {
            console.error('DataTable error:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [table.getState().pagination.pageIndex, table.getState().pagination.pageSize, sorting, globalFilter]);

    // Reset column visibility to default (all visible)
    const resetColumnVisibility = () => {
        const defaultVisibility = {};
        table.getAllColumns().forEach(column => {
            defaultVisibility[column.id] = true;
        });
        setColumnVisibility(defaultVisibility);
    };

    return (
        <Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6">
            <div className="">
                <div className="bg-background/50 flex items-center justify-between border-b backdrop-blur-sm lg:py-2">
                    <div className="flex items-center gap-2">
                        {toolbarContent}
                    </div>
                    <div className="flex items-center gap-2">
                        <Input placeholder="Search..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="max-w-xs" />
                        {table.getAllColumns().length > 7 ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Columns2 className="mr-2 size-4" />
                                        Columns
                                        <ChevronDown className="ml-2 size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <div className="flex items-center justify-between px-2 py-1.5">
                                        <span className="text-sm font-medium">Column Visibility</span>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={resetColumnVisibility}
                                            className="h-6 px-2 text-xs"
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                    {table
                                        .getAllColumns()
                                        .filter((column) => column.getCanHide())
                                        .map((column) => {
                                            const header = column.columnDef.header as string;
                                            return (
                                                <DropdownMenuCheckboxItem
                                                    key={column.id}
                                                    checked={column.getIsVisible()}
                                                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                                >
                                                    {header}
                                                </DropdownMenuCheckboxItem>
                                            );
                                        })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            ''
                        )}
                    </div>
                </div>
                <div className="rounded-lg border overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>

                        <TableBody>
                            {loading ? (
                                Array.from({ length: data.perPage }).map((_, i) => (
                                    <TableRow key={i}>
                                        {table.getAllColumns().map((column) => (
                                            <TableCell key={column.id}>
                                                <Skeleton className="h-4 w-3/4" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                        className="hover:bg-muted/50 transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-between py-4">
                    <div className="hidden flex-1 text-sm lg:flex">
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value));
                            }}
                        >
                            <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Label htmlFor="rows-per-page" className="ml-1 text-sm font-medium">
                            Rows per page
                        </Label>
                    </div>
                    <div className="flex w-full items-center gap-8 lg:w-fit">
                        <div className="flex w-fit items-center justify-center text-sm font-medium">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </div>
                        <div className="ml-auto flex items-center gap-2 lg:ml-0">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Go to first page</span>
                                <ChevronsLeft />
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Go to previous page</span>
                                <ChevronLeft />
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronRight />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden size-8 lg:flex"
                                size="icon"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRight />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Tabs>
    );
};
export default DataTable;