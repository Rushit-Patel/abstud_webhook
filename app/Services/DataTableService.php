<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class DataTableService
{
    protected $query;
    protected $columns = [];
    protected $defaultSortColumn;
    protected $defaultSortDirection = 'asc';

    public function __construct(Builder $query)
    {
        $this->query = $query;
    }

    public function setDefaultSort(string $column, string $direction = 'asc')
    {
        $this->defaultSortColumn = $column;
        $this->defaultSortDirection = $direction;
        return $this;
    }

    public function process(Request $request)
    {
        // Pagination
        $perPage = $request->get('perPage', 10);
        $currentPage = $request->get('page', 1);

        // Sorting
        $sortColumn = $request->get('sortColumn', $this->defaultSortColumn);
        $sortDirection = $request->get('sortDirection', $this->defaultSortDirection);
        
        // Search
        $searchTerm = $request->get('search', '');

        // Apply sorting
        if ($sortColumn) {
            $this->query->orderBy($sortColumn, $sortDirection);
        }

        // Apply search
        if ($searchTerm) {
            $this->query->where(function ($query) use ($searchTerm) {
                foreach ($this->columns as $column) {
                    if ($column['searchable']) {
                        $query->orWhere($column['selector'], 'LIKE', "%{$searchTerm}%");
                    }
                }
            });
        }

        // Paginate results
        $paginator = $this->query->paginate($perPage, ['*'], 'page', $currentPage);

        return [
            'columns' => $this->columns,
            'data' => $paginator->items(),
            'total' => $paginator->total(),
            'perPage' => $paginator->perPage(),
            'currentPage' => $paginator->currentPage(),
        ];
    }
}