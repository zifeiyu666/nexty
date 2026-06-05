import slugify from "slugify";

export function getURL(path: string = '') {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000';
  url = url.startsWith('http') ? url : `https://${url}`;
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  url = `${url}${path}`;
  return url;
}

export function getDomain(url: string) {
  try {
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
    const domain = new URL(urlWithProtocol).hostname;
    return domain.replace(/^www\./, '');
  } catch (error) {
    return url;
  }
};

export async function validateUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(10000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function slugifyHostname(hostname: string) {
  let slug = hostname.toLowerCase().replace(/\./g, '-');
  slug = slug.replace(/[^a-z0-9-]/g, '');

  return slug;
}

export function universalSlugify(name: string) {
  if (!name) {
    return '';
  }

  const preparedText = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let slug = slugify(preparedText, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true,
    strict: true,
    trim: true
  });

  return slug;
}

export const getDataFromDataUrl = (dataUrl: string): { buffer: Buffer; contentType: string } | null => {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);

  if (!match) {
    console.error("Invalid data URL format");
    return null;
  }
  const contentType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');
  return { buffer, contentType };
}