import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LayoutGrid, PlusIcon, Trash2Icon } from 'lucide-react';

interface Option {
    id: string;
    label: string;
    value: string;
}

interface OptionsConfigPanelProps {
    options: Option[];
    onChange: (options: Option[]) => void;
    fieldType: string;
}

// Sortable item component
function SortableOption({
    option,
    onChangeOption,
    onRemoveOption,
}: {
    option: Option;
    onChangeOption: (id: string, field: 'label' | 'value', value: string) => void;
    onRemoveOption: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: option.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="mb-2 flex items-center space-x-2 rounded-md border border-gray-200 p-2">
            <div {...attributes} {...listeners} className="cursor-move">
                <LayoutGrid className="h-5 w-5 text-gray-400" />
            </div>

            <div className="grid flex-grow grid-cols-2 gap-2">
                <Input placeholder="Label" value={option.label} onChange={(e) => onChangeOption(option.id, 'label', e.target.value)} />
                <Input placeholder="Value" value={option.value} onChange={(e) => onChangeOption(option.id, 'value', e.target.value)} />
            </div>

            <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveOption(option.id)} className="ml-2 h-8 w-8 p-0">
                <Trash2Icon className="h-4 w-4" />
            </Button>
        </div>
    );
}

export default function OptionsConfigPanel({ options = [], onChange, fieldType }: OptionsConfigPanelProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const addOption = () => {
        const newId = `option-${Date.now()}`;
        const newOption: Option = {
            id: newId,
            label: '',
            value: '',
        };
        onChange([...options, newOption]);
    };

    const removeOption = (id: string) => {
        onChange(options.filter((option) => option.id !== id));
    };

    const updateOption = (id: string, field: 'label' | 'value', value: string) => {
        onChange(
            options.map((option) =>
                option.id === id
                    ? {
                          ...option,
                          [field]: value,
                          value: field === 'label' && option.value === '' ? value.toLowerCase().replace(/\s+/g, '_') : option.value,
                      }
                    : option,
            ),
        );
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = options.findIndex((item) => item.id === active.id);
            const newIndex = options.findIndex((item) => item.id === over.id);

            onChange(arrayMove(options, oldIndex, newIndex));
        }
    };

    const getFieldTypeLabel = () => {
        switch (fieldType) {
            case 'select':
                return 'dropdown';
            case 'multiselect':
                return 'multi-select';
            case 'checkbox':
                return 'checkbox';
            case 'radio':
                return 'radio button';
            default:
                return fieldType;
        }
    };

    return (
        <div className="space-y-4">
            <Alert>
                <AlertDescription>Configure the options for this {getFieldTypeLabel()} field. Drag and drop to reorder options.</AlertDescription>
            </Alert>

            <div className="space-y-2">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={options.map((option) => option.id)} strategy={verticalListSortingStrategy}>
                        {options.map((option) => (
                            <SortableOption key={option.id} option={option} onChangeOption={updateOption} onRemoveOption={removeOption} />
                        ))}
                    </SortableContext>
                </DndContext>

                {options.length === 0 && (
                    <div className="py-4 text-center text-gray-500">No options added yet. Click the button below to add your first option.</div>
                )}

                <Button type="button" variant="outline" onClick={addOption} className="mt-2 w-full">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Option
                </Button>
            </div>
        </div>
    );
}
