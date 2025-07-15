-- Fix the ambiguous column reference in the set_sla_deadline trigger using CASCADE
DROP FUNCTION IF EXISTS set_sla_deadline() CASCADE;

CREATE OR REPLACE FUNCTION public.set_sla_deadline()
RETURNS TRIGGER AS $$
BEGIN
    NEW.sla_deadline := calculate_sla_deadline(NEW.category, NEW.priority);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_set_sla_deadline
    BEFORE INSERT ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION set_sla_deadline();