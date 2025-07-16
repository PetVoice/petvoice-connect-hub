-- Fix the ambiguous column reference in the set_sla_deadline trigger
DROP TRIGGER IF EXISTS set_sla_deadline_trigger ON support_tickets;

DROP FUNCTION IF EXISTS set_sla_deadline();

CREATE OR REPLACE FUNCTION public.set_sla_deadline()
RETURNS TRIGGER AS $$
BEGIN
    NEW.sla_deadline := calculate_sla_deadline(NEW.category, NEW.priority);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;