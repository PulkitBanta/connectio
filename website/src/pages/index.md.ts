import type { APIRoute } from 'astro';
import { connectio as c } from '../data/connectio';
import { absoluteUrl, markdownResponse } from '../utils/markdown';

export const GET: APIRoute = () =>
  markdownResponse(`# ${c.name}: ${c.tagline}

> ${c.description}

Version ${c.version} · ${c.license} license · [Source on GitHub](${c.repo})

${c.summary}

## Problems that it solves

${c.problems.map((p) => `- **${p.title}.** ${p.body}`).join('\n')}

## Procedure

${c.steps.map((s, i) => `${i + 1}. **${s.title}.** ${s.body}`).join('\n')}

Watch the [60-second tour](${absoluteUrl(c.video.src)}).

## Features

${c.features.map((f) => `- **${f.title}.** ${f.body}`).join('\n')}

## Download

${c.downloads.map((d) => `- ${d.os} (${d.detail}): [${d.file}](${d.url})`).join('\n')}

All builds: [latest release](${c.latest}). First-launch help: [install guide](${c.installGuide}).

Install from the terminal on macOS or Linux:

\`\`\`bash
${c.install.unix}
\`\`\`

On Windows (PowerShell):

\`\`\`powershell
${c.install.windows}
\`\`\`

## Config format

Configs are plain JSON:

\`\`\`json
${c.config}
\`\`\`

## FAQ

${c.faqs.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n')}

---

Canonical page: ${absoluteUrl('/')}`);
