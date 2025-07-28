-- Drop existing problematic policies for support_tickets
DROP POLICY IF EXISTS "Users can manage own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can view own tickets or admins can view all" ON support_tickets;

-- Create corrected policies for support_tickets
CREATE POLICY "Users can view own tickets" 
ON support_tickets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets" 
ON support_tickets 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

CREATE POLICY "Users can manage own tickets" 
ON support_tickets 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all tickets" 
ON support_tickets 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

-- Drop existing problematic policies for support_ticket_replies
DROP POLICY IF EXISTS "Users can view replies for their tickets" ON support_ticket_replies;
DROP POLICY IF EXISTS "Users can create replies for their tickets" ON support_ticket_replies;

-- Create corrected policies for support_ticket_replies
CREATE POLICY "Users can view replies for own tickets" 
ON support_ticket_replies 
FOR SELECT 
USING (
  ticket_id IN (
    SELECT id FROM support_tickets 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all ticket replies" 
ON support_ticket_replies 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

CREATE POLICY "Users can create replies for own tickets" 
ON support_ticket_replies 
FOR INSERT 
WITH CHECK (
  ticket_id IN (
    SELECT id FROM support_tickets 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can create replies for all tickets" 
ON support_ticket_replies 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

CREATE POLICY "Users can update own replies" 
ON support_ticket_replies 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Admins can update all replies" 
ON support_ticket_replies 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));