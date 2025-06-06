import { Workflow, Action, Trigger, ValidationResult } from '@/types/automation';

export const validateWorkflow = (workflow: Workflow): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic validation
    if (!workflow.name?.trim()) {
        errors.push('Workflow name is required');
    }
    
    if (workflow.name && workflow.name.length > 100) {
        warnings.push('Workflow name is quite long');
    }
    
    // Trigger validation
    const triggerValidation = validateTrigger(workflow.trigger);
    errors.push(...triggerValidation.errors);
    warnings.push(...(triggerValidation.warnings || []));
    
    // Actions validation
    if (!workflow.actions || workflow.actions.length === 0) {
        errors.push('At least one action is required');
    } else {
        workflow.actions.forEach((action, index) => {
            const actionValidation = validateAction(action);
            errors.push(...actionValidation.errors.map(err => `Action ${index + 1}: ${err}`));
            warnings.push(...(actionValidation.warnings || []).map(warn => `Action ${index + 1}: ${warn}`));
        });
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
};

export const validateTrigger = (trigger: Trigger): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!trigger.type) {
        errors.push('Trigger type is required');
        return { isValid: false, errors, warnings };
    }
    
    switch (trigger.type) {
        case 'facebook_lead_form':
            if (!trigger.page_id) errors.push('Facebook page is required');
            if (!trigger.form_id) errors.push('Facebook form is required');
            break;
        case 'inbound_webhook':
            if (!trigger.secret_key) warnings.push('Consider adding a secret key for security');
            break;
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
};

export const validateAction = (action: Action): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!action.type) {
        errors.push('Action type is required');
        return { isValid: false, errors, warnings };
    }
    
    switch (action.type) {
        case 'send_email':
            if (!action.subject?.trim()) errors.push('Email subject is required');
            if (!action.body?.trim()) errors.push('Email body is required');
            if (action.subject && action.subject.length > 200) {
                warnings.push('Email subject is quite long');
            }
            break;
        case 'send_whatsapp':
            if (!action.message?.trim()) errors.push('WhatsApp message is required');
            if (action.message && action.message.length > 1000) {
                warnings.push('WhatsApp message is quite long');
            }
            break;
        case 'send_webhook':
            if (!action.url?.trim()) errors.push('Webhook URL is required');
            if (action.url && !isValidUrl(action.url)) {
                errors.push('Invalid webhook URL format');
            }
            break;
        case 'condition':
            if (!action.conditions || action.conditions.length === 0) {
                errors.push('At least one condition is required');
            }
            break;
        case 'delay':
            if (!action.duration || action.duration <= 0) {
                errors.push('Delay duration must be greater than 0');
            }
            break;
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
};

const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export const sanitizeWorkflowData = (workflow: Workflow): Workflow => {
    return {
        ...workflow,
        name: workflow.name?.trim() || '',
        description: workflow.description?.trim() || '',
        actions: workflow.actions.map(sanitizeAction),
    };
};

const sanitizeAction = (action: Action): Action => {
    const sanitized = { ...action };
    
    if (action.type === 'send_email') {
        sanitized.subject = action.subject?.trim() || '';
        sanitized.body = action.body?.trim() || '';
    } else if (action.type === 'send_whatsapp') {
        sanitized.message = action.message?.trim() || '';
    } else if (action.type === 'send_webhook') {
        sanitized.url = action.url?.trim() || '';
    }
    
    return sanitized;
};