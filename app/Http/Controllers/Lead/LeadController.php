<?php

namespace App\Http\Controllers\Lead;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\LeadField;
use App\Models\LeadFieldValue;
use App\Services\DataTableService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LeadController extends Controller
{
    public function index()
    {
        $leads = Lead::with('fieldValues')->paginate();
        return Inertia::render('Lead/Index', [
            'leads' => $leads,
        ]);
    }

    public function datatable(Request $request)
    {
        // $leads = Lead::query()
        //     ->with('fieldValues');
        $fields = LeadField::query()
                    ->select('name','label','type','id')->get();
        $leads = Lead::select('leads.id', 'leads.created_at')
            ->addSelect($fields->map(function ($field) {
                return DB::raw("(SELECT value FROM lead_field_values WHERE lead_id = leads.id AND lead_field_id = {$field->id} LIMIT 1) as `{$field->name}`");
            })->toArray());
        $dataTable = new DataTableService($leads);
        $users = $dataTable->setDefaultSort('id', 'asc')
            ->process($request);

        return response()->json($users);
    }

    public function datatableColumn()
    {
        $leadFields = LeadField::query()
            ->select('name','label','type','id')
            ->where('is_active', true);
        $leadFields = $leadFields->get();

        return response()->json($leadFields);
    }

    public function create()
    {
        return Inertia::render('Lead/Create', [
            
        ]);
    }

    public function store(Request $request)
    {
        $lead = Lead::create([
            // Assuming you might want to store some basic data directly
            'raw_payload' => $request->all(), // Example: storing all data in raw_payload
        ]);
        // Assuming field values are submitted in a format like ['field_id' => 'value']
        // You might need to adjust this based on your actual form structure
        foreach ($request->except(['_token']) as $fieldId => $value) { // Exclude CSRF token
            LeadFieldValue::create([
                'lead_id' => $lead->id,
                'lead_field_id' => $fieldId,
                'value' => $value,
            ]);
        }
        return redirect()->route('leads.index')
            ->with('success', 'Lead created successfully.');
    }


    public function edit(Lead $lead)
    {
        $lead->load('fieldValues');
        return Inertia::render('Lead/Edit', [
            'lead' => $lead,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $lead = Lead::findOrFail($id);
        // Update lead attributes if any
        // Example: $lead->update($request->only(['attribute1', 'attribute2']));
        // Assuming field values are submitted in a format like ['field_id' => 'value']
        // You might need to adjust this based on your actual form structure
        foreach ($request->except(['_token', '_method']) as $fieldId => $value) { // Exclude CSRF token and _method
            LeadFieldValue::updateOrCreate(
                [
                    'lead_id' => $lead->id,
                    'lead_field_id' => $fieldId,
                ],
                ['value' => $value]
            );
        }
        return redirect()->route('leads.index')
            ->with('success', 'Lead updated successfully.');
    }


    public function destroy(Lead $lead)
    {
        $lead->delete();
        return redirect()->route('leads.index')
            ->with('success', 'Lead deleted successfully.');
    }
}