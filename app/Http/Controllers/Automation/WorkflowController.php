<?php

namespace App\Http\Controllers\Automation;

use App\Http\Controllers\Controller;
use App\Models\Workflow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WorkflowController extends Controller
{
    public function create()
    {
        return Inertia::render('Automation/WorkflowBuilder', [
            'workflow' => null,
        ]);
    }
}