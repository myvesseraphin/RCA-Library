import { config } from './config.ts';

function sanitizeSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'book-cover';
}

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) {
    throw new Error('Invalid image payload. Please choose a valid image file.');
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  };
}

function mimeTypeToExtension(mimeType: string) {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    default:
      return mimeType.split('/')[1] ?? 'bin';
  }
}

export async function uploadBookCoverToSupabase(payload: {
  fileName: string;
  dataUrl: string;
}) {
  if (!config.supabaseUrl) {
    throw new Error('Missing Supabase project URL. Set SUPABASE_URL in your .env.');
  }

  if (!config.supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in your .env, so book cover uploads cannot reach the images bucket yet.');
  }

  const { mimeType, buffer } = parseDataUrl(payload.dataUrl);
  const extension = mimeTypeToExtension(mimeType);
  const baseName = sanitizeSegment(payload.fileName.replace(/\.[^.]+$/, ''));
  const objectPath = `books/${Date.now()}-${baseName}.${extension}`;

  const response = await fetch(
    `${config.supabaseUrl}/storage/v1/object/${config.supabaseStorageBucket}/${objectPath}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
        apikey: config.supabaseServiceRoleKey,
        'Content-Type': mimeType,
        'x-upsert': 'true',
      },
      body: buffer,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase upload failed: ${errorText || response.statusText}`);
  }

  return {
    path: objectPath,
    publicUrl: `${config.supabaseUrl}/storage/v1/object/public/${config.supabaseStorageBucket}/${objectPath}`,
  };
}
