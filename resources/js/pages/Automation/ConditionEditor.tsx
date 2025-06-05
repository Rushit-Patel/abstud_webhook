// src/components/automation/ConditionEditor.tsx
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Condition } from '@/types/automation';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ConditionEditorProps {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
}

const conditionTypes = [
  { value: 'contact_field', label: 'Contact Field' },
  { value: 'email_opened', label: 'Email Opened' },
  { value: 'email_clicked', label: 'Email Clicked' },
  { value: 'trigger_type', label: 'Trigger Type' },
  { value: 'has_tag', label: 'Has Tag' },
  { value: 'webhook_data', label: 'Webhook Data' },
];

const availableOperators = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
];

const triggerTypes = [
  { value: 'contact_created', label: 'Contact Created' },
  { value: 'facebook_lead_form_submitted', label: 'Facebook Lead Form Submitted' },
  { value: 'contact_form_submitted', label: 'Contact Form Submitted' },
  { value: 'opportunity_status_changed', label: 'Opportunity Status Changed' },
  { value: 'inbound_webhook', label: 'Inbound Webhook' },
  { value: 'whatsapp_message_received', label: 'WhatsApp Message Received' },
];

const ConditionEditor: React.FC<ConditionEditorProps> = ({ conditions, onChange }) => {
  const [newCondition, setNewCondition] = useState<Condition>({ type: '', field: '', operator: '', value: '' });
  const [contactFields, setContactFields] = useState<{ value: string; label: string }[]>([]);
  const [tags, setTags] = useState<{ value: string; label: string }[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch contact fields and tags from backend
  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('/api/contact-fields', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
      axios.get('/api/tags', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
    ])
      .then(([fieldsRes, tagsRes]) => {
        setContactFields(
          fieldsRes.data.map((field: string) => ({
            value: field,
            label: field.replace(/_/g, ' ').toUpperCase(),
          })),
        );
        setTags(
          tagsRes.data.map((tag: string) => ({
            value: tag,
            label: tag.replace(/_/g, ' ').toUpperCase(),
          })),
        );
        setLoading(false);
      })
      .catch(() => {
        setErrors({ general: 'Failed to fetch configuration options' });
        setLoading(false);
      });
  }, []);

  const validateCondition = (): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};
    if (!newCondition.type) {
      errors.type = 'Condition type is required';
    }
    if (newCondition.type === 'contact_field') {
      if (!newCondition.field) errors.field = 'Field is required';
      if (!newCondition.operator) errors.operator = 'Operator is required';
      if (!newCondition.value) errors.value = 'Value is required';
    } else if (newCondition.type === 'has_tag') {
      if (!newCondition.value) errors.value = 'Tag is required';
    } else if (newCondition.type === 'webhook_data') {
      if (!newCondition.field) errors.field = 'Data key is required';
      if (!newCondition.operator) errors.operator = 'Operator is required';
      if (!newCondition.value) errors.value = 'Value is required';
    } else if (!newCondition.value) {
      errors.value = `${newCondition.type.replace(/_/g, ' ')} value is required`;
    }
    return errors;
  };

  const handleAddCondition = () => {
    const validationErrors = validateCondition();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onChange([...conditions, newCondition]);
    setNewCondition({ type: '', field: '', operator: '', value: '' });
    setErrors({});
  };

  const handleDeleteCondition = (index: number) => {
    if (confirm('Are you sure you want to delete this condition?')) {
      onChange(conditions.filter((_, i) => i !== index));
      setErrors({});
    }
  };

  const getConditionPreview = (condition: Condition): string => {
    if (condition.type === 'contact_field') {
      return `${condition.field} ${condition.operator} "${condition.value}"`;
    } else if (condition.type === 'has_tag') {
      return `Has tag: ${condition.value}`;
    } else if (condition.type === 'webhook_data') {
      return `Webhook data ${condition.field} ${condition.operator} "${condition.value}"`;
    } else {
      return `${condition.type.replace(/_/g, ' ').toUpperCase()}: ${condition.value}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Condition Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {errors.general && (
          <Alert variant="destructive">
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}
        {loading ? (
          <div className="text-sm text-gray-500">Loading configuration options...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="condition-type">Condition Type</Label>
                <Select
                  value={newCondition.type}
                  onValueChange={(value) => setNewCondition({ type: value, field: '', operator: '', value: '' })}
                >
                  <SelectTrigger id="condition-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
              </div>

              {newCondition.type === 'contact_field' && (
                <>
                  <div>
                    <Label htmlFor="condition-field">Field</Label>
                    <Select
                      value={newCondition.field}
                      onValueChange={(value) => setNewCondition({ ...newCondition, field: value })}
                      disabled={loading}
                    >
                      <SelectTrigger id="condition-field">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {contactFields.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.field && <p className="mt-1 text-xs text-red-600">{errors.field}</p>}
                  </div>
                  <div>
                    <Label htmlFor="condition-operator">Operator</Label>
                    <Select
                      value={newCondition.operator}
                      onValueChange={(value) => setNewCondition({ ...newCondition, operator: value })}
                    >
                      <SelectTrigger id="condition-operator">
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableOperators.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.operator && <p className="mt-1 text-xs text-red-600">{errors.operator}</p>}
                  </div>
                  <div>
                    <Label htmlFor="condition-value">Value</Label>
                    <Input
                      id="condition-value"
                      value={newCondition.value}
                      onChange={(e) => setNewCondition({ ...newCondition, value: e.target.value })}
                      placeholder="Enter value"
                    />
                    {errors.value && <p className="mt-1 text-xs text-red-600">{errors.value}</p>}
                  </div>
                </>
              )}

              {newCondition.type === 'email_opened' && (
                <div>
                  <Label htmlFor="email-id">Email ID</Label>
                  <Input
                    id="email-id"
                    value={newCondition.value}
                    onChange={(e) => setNewCondition({ ...newCondition, value: e.target.value })}
                    placeholder="Enter email ID (e.g., email123)"
                  />
                  {errors.value && <p className="mt-1 text-xs text-red-600">{errors.value}</p>}
                </div>
              )}

              {newCondition.type === 'email_clicked' && (
                <div>
                  <Label htmlFor="link-id">Link ID</Label>
                  <Input
                    id="link-id"
                    value={newCondition.value}
                    onChange={(e) => setNewCondition({ ...newCondition, value: e.target.value })}
                    placeholder="Enter link ID (e.g., link456)"
                  />
                  {errors.value && <p className="mt-1 text-xs text-red-600">{errors.value}</p>}
                </div>
              )}

              {newCondition.type === 'trigger_type' && (
                <div>
                  <Label htmlFor="trigger-value">Trigger Type</Label>
                  <Select
                    value={newCondition.value}
                    onValueChange={(value) => setNewCondition({ ...newCondition, value })}
                  >
                    <SelectTrigger id="trigger-value">
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerTypes.map((trigger) => (
                        <SelectItem key={trigger.value} value={trigger.value}>
                          {trigger.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.value && <p className="mt-1 text-xs text-red-600">{errors.value}</p>}
                </div>
              )}

              {newCondition.type === 'has_tag' && (
                <div>
                  <Label htmlFor="tag-value">Tag</Label>
                  <Select
                    value={newCondition.value}
                    onValueChange={(value) => setNewCondition({ ...newCondition, value })}
                    disabled={loading}
                  >
                    <SelectTrigger id="tag-value">
                      <SelectValue placeholder="Select tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {tags.map((tag) => (
                        <SelectItem key={tag.value} value={tag.value}>
                          {tag.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.value && <p className="mt-1 text-xs text-red-600">{errors.value}</p>}
                </div>
              )}

              {newCondition.type === 'webhook_data' && (
                <>
                  <div>
                    <Label htmlFor="webhook-key">Data Key</Label>
                    <Input
                      id="webhook-key"
                      value={newCondition.field}
                      onChange={(e) => setNewCondition({ ...newCondition, field: e.target.value })}
                      placeholder="Enter data key (e.g., lead_id)"
                    />
                    {errors.field && <p className="mt-1 text-xs text-red-600">{errors.field}</p>}
                  </div>
                  <div>
                    <Label htmlFor="webhook-operator">Operator</Label>
                    <Select
                      value={newCondition.operator}
                      onValueChange={(value) => setNewCondition({ ...newCondition, operator: value })}
                    >
                      <SelectTrigger id="webhook-operator">
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableOperators.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.operator && <p className="mt-1 text-xs text-red-600">{errors.operator}</p>}
                  </div>
                  <div>
                    <Label htmlFor="webhook-value">Value</Label>
                    <Input
                      id="webhook-value"
                      value={newCondition.value}
                      onChange={(e) => setNewCondition({ ...newCondition, value: e.target.value })}
                      placeholder="Enter value"
                    />
                    {errors.value && <p className="mt-1 text-xs text-red-600">{errors.value}</p>}
                  </div>
                </>
              )}
            </div>

            <Button
              onClick={handleAddCondition}
              disabled={
                loading ||
                !newCondition.type ||
                (newCondition.type === 'contact_field' && (!newCondition.field || !newCondition.operator || !newCondition.value)) ||
                (newCondition.type === 'has_tag' && !newCondition.value) ||
                (newCondition.type === 'webhook_data' && (!newCondition.field || !newCondition.operator || !newCondition.value)) ||
                (['email_opened', 'email_clicked', 'trigger_type'].includes(newCondition.type) && !newCondition.value)
              }
            >
              Add Condition
            </Button>

            {conditions.length > 0 && (
              <div>
                <h3 className="mt-6 text-lg font-semibold">Added Conditions</h3>
                <ul className="mt-2 space-y-2">
                  {conditions.map((condition, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between rounded bg-gray-100 p-3 dark:bg-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{condition.type.replace(/_/g, ' ').toUpperCase()}</Badge>
                        <span className="text-sm">{getConditionPreview(condition)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCondition(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ConditionEditor;