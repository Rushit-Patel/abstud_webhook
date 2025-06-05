<?php

namespace App\Http\Controllers\Settings\LeadManagement;

use App\Models\Integration;
use App\Models\LeadField;
use Auth;
use Illuminate\Support\Facades\Hash;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SettingMenuService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\DataTableService;
use Spatie\Permission\Models\Role;

class LeadFieldsController extends Controller
{

    public function index(Request $request): Response
    {
        $settingMenu = new SettingMenuService;
        
        return Inertia::render('MasterModule/LeadManagement/LeadFields/index', [
            'settingMenu' => $settingMenu->getMenu(),
        ]);
    }
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:lead_fields,name',
            'label' => 'required|string|max:255',
            'type' => 'required|string|in:text,textarea,number,email,phone,select,multiselect,checkbox,radio,date,url',
            'options' => 'nullable|array',
            'settings' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator->errors());
        }

        $leadField = LeadField::create([
            'name' => $request->name,
            'label' => $request->label,
            'type' => $request->type,
            'options' => $request->options,
            'settings' => $request->settings,
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->route('lead-management.index')->with('success', 'Custom field created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(LeadField $leadField)
    {
        return response()->json($leadField);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $leadField = LeadField::find($id); 
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:lead_fields,name,' . $leadField->id,
            'label' => 'required|string|max:255',
            'type' => 'required|string|in:text,textarea,number,email,phone,select,multiselect,checkbox,radio,date,url',
            'options' => 'nullable|array',
            'settings' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator->errors());
        }

        $leadField->update([
            'name' => $request->name,
            'label' => $request->label,
            'type' => $request->type,
            'options' => $request->options,
            'settings' => $request->settings,
            'is_active' => $request->is_active ?? $leadField->is_active,
        ]);

        return redirect()->route('lead-management.index')->with('success', 'Custom field updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LeadField $leadField)
    {
        $leadField->delete();
        return redirect()->route('lead-management.index')->with('success', 'Custom field deleted successfully');
    }

     public function dataTable(Request $request)
    {
        $LeadFields = LeadField::query();
        $dataTable = new DataTableService($LeadFields);

        $LeadFields = $dataTable->setDefaultSort('id', 'asc')
            ->process($request);

        return response()->json($LeadFields);
    }

}