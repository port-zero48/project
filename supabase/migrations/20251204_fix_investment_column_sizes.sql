-- Fix investment_plans column sizes to support larger daily return rates
-- Change annual_return_rate from DECIMAL(5,2) to DECIMAL(10,2) to support values like 1050

ALTER TABLE public.investment_plans
ALTER COLUMN annual_return_rate TYPE DECIMAL(10, 2);

-- Also ensure daily_return_rate can hold large values
ALTER TABLE public.investment_plans
ALTER COLUMN daily_return_rate TYPE DECIMAL(10, 2);
