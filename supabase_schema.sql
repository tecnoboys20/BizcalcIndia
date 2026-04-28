-- Create leads table
CREATE TABLE leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL, -- Email or WhatsApp
    tool_used VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (since users aren't logged in when submitting leads)
CREATE POLICY "Allow public inserts on leads" 
ON leads FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow authenticated users to view leads (for your admin panel later)
CREATE POLICY "Allow authenticated users to read leads" 
ON leads FOR SELECT 
TO authenticated 
USING (true);
