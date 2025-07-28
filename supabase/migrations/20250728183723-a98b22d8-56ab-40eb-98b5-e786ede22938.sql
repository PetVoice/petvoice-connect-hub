-- Rimuovi TUTTE le policy esistenti per support_tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can create own tickets" ON support_tickets; 
DROP POLICY IF EXISTS "Users can update own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can manage all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can view own tickets or admins can view all" ON support_tickets;

-- Crea policy pulite e funzionanti
CREATE POLICY "enable_read_for_users_own_tickets" 
ON support_tickets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "enable_read_for_admins_all_tickets" 
ON support_tickets 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

CREATE POLICY "enable_insert_for_authenticated_users" 
ON support_tickets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "enable_update_for_users_own_tickets" 
ON support_tickets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "enable_update_for_admins_all_tickets" 
ON support_tickets 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

CREATE POLICY "enable_delete_for_admins_only" 
ON support_tickets 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));