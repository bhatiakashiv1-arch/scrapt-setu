import { supabase } from './supabaseClient';

export interface StoredImage {
  url: string;
  name: string;
  size: number;
}

const DEMO_PHOTO_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMzAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzFhMmEyZSIvPjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyYTNhMmEiIHN0cm9rZT0iIzRlYTQ1MiIgc3Ryb2tlLXdpZHRoPSI0Ii8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMTUwIiByPSIzMCIgZmlsbD0iIzRhNWE0OCIvPjxyZWN0IHg9IjIwMCIgeT0iMTIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjNGE1YTQ4Ii8+PHJlY3QgeD0iMjAwIiB5PSIxOTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMjAiIGZpbGw9IiM0YTVhNDgiLz48dGV4dCB4PSIyMDAiIHk9IjI4MCIgZmlsbD0iI2ZmZiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkRlbW8gU2NyYXAgUGhvdG88L3RleHQ+PC9zdmc+';

export function getDemoPhoto(): string {
  return DEMO_PHOTO_URL;
}

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function storeImage(file: File): Promise<StoredImage> {
  return fileToDataURL(file).then((url) => ({
    url,
    name: file.name,
    size: file.size,
  }));
}

export async function uploadImageToSupabase(file: File, userId: string): Promise<string | null> {
  if (!supabase) return null;

  const ext = file.name.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${userId}/${timestamp}-${safeName}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error('Storage upload error:', error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}
