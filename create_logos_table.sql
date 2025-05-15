-- Create logos table
CREATE TABLE public.logos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    company_name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    prompt TEXT NOT NULL,
    settings JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.logos ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own logos
CREATE POLICY "Users can view their own logos" 
    ON public.logos 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Allow users to insert their own logos
CREATE POLICY "Users can insert their own logos" 
    ON public.logos 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own logos
CREATE POLICY "Users can update their own logos" 
    ON public.logos 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Allow users to delete their own logos
CREATE POLICY "Users can delete their own logos" 
    ON public.logos 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX logos_user_id_idx ON public.logos(user_id);
CREATE INDEX logos_company_name_idx ON public.logos(company_name);
