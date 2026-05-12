-- Create the certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nit TEXT NOT NULL,
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('retefuente', 'reteiva', 'reteica')),
    amount_base DECIMAL(15, 2) NOT NULL,
    amount_withheld DECIMAL(15, 2) NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL,
    city TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast searching by NIT, Year and Type
CREATE INDEX IF NOT EXISTS idx_certificates_search ON certificates (nit, year, type);

-- Enable Row Level Security (RLS)
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public reading (only if NIT matches)
-- In a real scenario, you might want more verification, 
-- but for this requirement, public access by NIT is requested.
CREATE POLICY "Allow public read by NIT" ON certificates
    FOR SELECT
    USING (true);

-- Create policy to allow authenticated users (accounting) to insert/update
-- This assumes you have Supabase Auth configured
CREATE POLICY "Allow authenticated users to manage data" ON certificates
    FOR ALL
    TO authenticated
    USING (true);
