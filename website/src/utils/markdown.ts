const siteUrl = 'https://connectio.pulkitbanta.com';

export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();

export const markdownResponse = (body: string) =>
  new Response(`${body.trim()}\n`, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });

export const textResponse = (body: string) =>
  new Response(`${body.trim()}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
