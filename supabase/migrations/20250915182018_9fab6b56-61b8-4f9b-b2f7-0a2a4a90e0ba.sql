-- Create storage buckets for file management
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('reports', 'reports', false),
  ('documents', 'documents', false),
  ('data-imports', 'data-imports', false),
  ('user-uploads', 'user-uploads', false);

-- Create storage policies for reports bucket
CREATE POLICY "Users can view own reports" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'reports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload reports" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'reports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage policies for documents bucket  
CREATE POLICY "Authenticated users can view documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Managers can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- Create storage policies for data imports
CREATE POLICY "Admins can manage data imports" ON storage.objects
  FOR ALL USING (
    bucket_id = 'data-imports' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create storage policies for user uploads
CREATE POLICY "Users can manage own uploads" ON storage.objects
  FOR ALL USING (
    bucket_id = 'user-uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create file management table
CREATE TABLE public.files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bucket_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on files table
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for files
CREATE POLICY "Users can view accessible files" ON public.files FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

CREATE POLICY "Users can upload files" ON public.files FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Users can update own files" ON public.files FOR UPDATE USING (
  user_id = auth.uid()
);

-- Create search indexes
CREATE INDEX idx_files_user_id ON public.files(user_id);
CREATE INDEX idx_files_bucket_id ON public.files(bucket_id);
CREATE INDEX idx_files_tags ON public.files USING GIN(tags);
CREATE INDEX idx_files_created_at ON public.files(created_at DESC);

-- Create full-text search index for units
CREATE INDEX idx_units_search ON public.units USING GIN(
  to_tsvector('english', name || ' ' || urn || ' ' || district || ' ' || service_no)
);

-- Create trigger for files timestamps
CREATE TRIGGER update_files_updated_at
  BEFORE UPDATE ON public.files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();