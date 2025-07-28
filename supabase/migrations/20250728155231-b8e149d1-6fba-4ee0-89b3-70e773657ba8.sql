-- Controlliamo e correggiamo le RLS policies per evitare ambiguità
-- Prima disabilitiamo temporaneamente RLS per testare
ALTER TABLE public.support_tickets DISABLE ROW LEVEL SECURITY;

-- Abilitiamo di nuovo RLS e ricreiamo le policy in modo più pulito
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Eliminiamo tutte le policy esistenti
DROP POLICY IF EXISTS "Users can create their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON public.support_tickets;

-- Ricreiamo le policy con alias per evitare ambiguità
CREATE POLICY "Users can create tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Users can view own tickets" ON public.support_tickets
    FOR SELECT USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can update own tickets" ON public.support_tickets
    FOR UPDATE USING (auth.uid() = user_id::uuid);