-- Trigger for Lead Creation
DELIMITER $$
CREATE TRIGGER leads_after_insert
AFTER INSERT ON leads
FOR EACH ROW
BEGIN
    INSERT INTO trigger_event_log (trigger_id, trigger_payload, status, created_at, updated_at)
    SELECT 
        wt.id,
        JSON_OBJECT(
            'event_type', 'lead_created',
            'table_name', 'leads',
            'operation', 'INSERT',
            'record_id', NEW.id,
            'data', JSON_OBJECT(
                'id', NEW.id,
                'raw_payload', NEW.raw_payload,
                'created_at', NEW.created_at
            ),
            'timestamp', NOW()
        ),
        'triggered',
        NOW(),
        NOW()
    FROM workflow_triggers wt
    INNER JOIN database_event_triggers det ON wt.id = det.trigger_id
    WHERE wt.is_active = 1 
    AND wt.trigger_type = 'database_event'
    AND det.table_name = 'leads'
    AND det.operation = 'INSERT'
    AND (
        wt.cooldown_seconds = 0 
        OR wt.last_triggered_at IS NULL 
        OR TIMESTAMPDIFF(SECOND, wt.last_triggered_at, NOW()) >= wt.cooldown_seconds
    );
    
    -- Update last triggered timestamp
    UPDATE workflow_triggers wt
    INNER JOIN database_event_triggers det ON wt.id = det.trigger_id
    SET wt.last_triggered_at = NOW()
    WHERE wt.is_active = 1 
    AND wt.trigger_type = 'database_event'
    AND det.table_name = 'leads'
    AND det.operation = 'INSERT';
END$$

-- Trigger for Lead Field Value Updates
DELIMITER $$
CREATE TRIGGER lead_field_values_after_update
AFTER UPDATE ON lead_field_values
FOR EACH ROW
BEGIN
    DECLARE field_name VARCHAR(255);
    
    -- Get the field name
    SELECT lf.name INTO field_name
    FROM lead_fields lf
    WHERE lf.id = NEW.lead_field_id;
    
    INSERT INTO trigger_event_log (trigger_id, trigger_payload, status, created_at, updated_at)
    SELECT 
        wt.id,
        JSON_OBJECT(
            'event_type', 'field_updated',
            'table_name', 'lead_field_values',
            'operation', 'UPDATE',
            'record_id', NEW.id,
            'lead_id', NEW.lead_id,
            'field_name', field_name,
            'old_value', OLD.value,
            'new_value', NEW.value,
            'data', JSON_OBJECT(
                'id', NEW.id,
                'lead_id', NEW.lead_id,
                'lead_field_id', NEW.lead_field_id,
                'field_name', field_name,
                'old_value', OLD.value,
                'new_value', NEW.value,
                'updated_at', NEW.updated_at
            ),
            'timestamp', NOW()
        ),
        'triggered',
        NOW(),
        NOW()
    FROM workflow_triggers wt
    INNER JOIN database_event_triggers det ON wt.id = det.trigger_id
    WHERE wt.is_active = 1 
    AND wt.trigger_type = 'database_event'
    AND det.table_name = 'lead_field_values'
    AND det.operation = 'UPDATE'
    AND OLD.value != NEW.value  -- Only trigger on actual value changes
    AND (
        det.column_filters IS NULL 
        OR JSON_CONTAINS(det.column_filters, JSON_QUOTE(field_name))
    )
    AND (
        wt.cooldown_seconds = 0 
        OR wt.last_triggered_at IS NULL 
        OR TIMESTAMPDIFF(SECOND, wt.last_triggered_at, NOW()) >= wt.cooldown_seconds
    );
END$$

-- Trigger for Integration Events
DELIMITER $$
CREATE TRIGGER integrations_after_update
AFTER UPDATE ON integrations
FOR EACH ROW
BEGIN
    INSERT INTO trigger_event_log (trigger_id, trigger_payload, status, created_at, updated_at)
    SELECT 
        wt.id,
        JSON_OBJECT(
            'event_type', 'integration_updated',
            'table_name', 'integrations',
            'operation', 'UPDATE',
            'record_id', NEW.id,
            'integration_type', it.name,
            'data', JSON_OBJECT(
                'id', NEW.id,
                'name', NEW.name,
                'old_active', OLD.is_active,
                'new_active', NEW.is_active,
                'user_id', NEW.user_id,
                'type', it.name
            ),
            'timestamp', NOW()
        ),
        'triggered',
        NOW(),
        NOW()
    FROM workflow_triggers wt
    INNER JOIN database_event_triggers det ON wt.id = det.trigger_id
    INNER JOIN integration_types it ON NEW.type_id = it.id
    WHERE wt.is_active = 1 
    AND wt.trigger_type = 'database_event'
    AND det.table_name = 'integrations'
    AND det.operation = 'UPDATE'
    AND (OLD.is_active != NEW.is_active OR OLD.credentials != NEW.credentials);
END$$

DELIMITER ;