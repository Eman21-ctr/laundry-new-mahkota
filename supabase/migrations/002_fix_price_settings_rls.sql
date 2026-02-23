-- Fix RLS policies for price_settings table
-- Previous configuration only allowed SELECT and UPDATE, causing failures when creating (INSERT) or deleting services.

-- 1. Allow authenticated users to INSERT into price_settings
CREATE POLICY "Authenticated users can insert price_settings" ON price_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 2. Allow authenticated users to DELETE from price_settings
CREATE POLICY "Authenticated users can delete price_settings" ON price_settings
    FOR DELETE USING (auth.role() = 'authenticated');

-- Optional: Ensure app_settings can also be inserted if needed (though usually static)
CREATE POLICY "Authenticated users can insert app_settings" ON app_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
