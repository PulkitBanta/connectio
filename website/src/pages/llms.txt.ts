import type { APIRoute } from 'astro';
import { connectio as c } from '../data/connectio';
import { absoluteUrl, textResponse } from '../utils/markdown';

export const GET: APIRoute = () =>
  textResponse(`# ${c.name}

> ${c.description}

This file links to a clean Markdown version of the site. Prefer it when reading or citing Connectio.

## Pages

- [Connectio](${absoluteUrl('/index.md')}): What Connectio is, the problems it solves, how to use it, downloads, config format, and FAQ.

## Optional

- [HTML page](${absoluteUrl('/')}): Human-facing version of the site.
- [Source code](${c.repo}): GitHub repository, README, and install guide.
- [Author](https://pulkitbanta.com/llms.txt): Pulkit Banta's website.`);
