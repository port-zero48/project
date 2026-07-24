-- Enable RLS on market_data table
ALTER TABLE IF EXISTS public.market_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to market_data" ON public.market_data;
DROP POLICY IF EXISTS "Allow authenticated users to read market_data" ON public.market_data;

-- Create policy for public read access (market data is public information)
CREATE POLICY "Allow public read access to market_data"
ON public.market_data
FOR SELECT
USING (true);

-- Create policy for authenticated inserts (only for the market-data edge function)
CREATE POLICY "Allow service role to insert market_data"
ON public.market_data
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Create policy for authenticated updates
CREATE POLICY "Allow service role to update market_data"
ON public.market_data
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create policy for authenticated deletes
CREATE POLICY "Allow service role to delete market_data"
ON public.market_data
FOR DELETE
USING (auth.role() = 'service_role');
