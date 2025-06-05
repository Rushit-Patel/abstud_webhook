interface Integration {
    name: string;
    credentials: json;
    meta: json;
    is_active:number;
}

interface FacebookFormQuestion {
  id: string;
  key: string;
  type: string;
  label: string;
}
interface FacebookForm {
    id: number;
    facebook_form_id: number;
    facebook_page_id: number;
    form_name: string;
    questions?: string;
    created_at: date;
    mapping: boolean;
    field_mappings?: FacebookFormFieldMapping[];
    field_mappings_count:number;
}