-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true);

-- Allow authenticated users to upload receipts
CREATE POLICY "Users can upload receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'receipts');

-- Allow public read access to receipts
CREATE POLICY "Public read access for receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipts');

-- Allow users to delete their receipts
CREATE POLICY "Users can delete receipts"
ON storage.objects FOR DELETE
USING (bucket_id = 'receipts');