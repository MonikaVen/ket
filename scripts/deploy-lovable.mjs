#!/usr/bin/env node
/**
 * Deploy KET Mokykla to Lovable (lovable.app).
 *
 * Requires LOVABLE_API_KEY (from Lovable account / API settings).
 *
 * Usage:
 *   LOVABLE_API_KEY=lov_... node scripts/deploy-lovable.mjs
 */
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const apiKey = process.env.LOVABLE_API_KEY;
if (!apiKey) {
  console.error('Missing LOVABLE_API_KEY. Add a lov_… key from your Lovable account.');
  process.exit(1);
}

async function ensureSdk() {
  try {
    return await import('@lovable.dev/sdk');
  } catch {
    console.log('Installing @lovable.dev/sdk…');
    const { execSync } = await import('node:child_process');
    execSync('npm install @lovable.dev/sdk --no-save', { cwd: root, stdio: 'inherit' });
    return import('@lovable.dev/sdk');
  }
}

const INITIAL_MESSAGE = `Build and replace this project with an interactive Lithuanian road-rules learning app called "KET Mokykla" for Kelių eismo taisyklės 2026.

Requirements (implement fully, Lithuanian UI):
1. Home hero with brand "KET 2026", headline, CTA to study and exam. Dark asphalt theme with amber (#f5c518) accents. Fonts: Syne + Outfit from Google Fonts.
2. Routes: / (home), /mokytis (chapters), /mokytis/:id (rules), /zenklai (signs), /korteles (flashcards), /testas (quiz), /egzaminas (exam), /pazanga (progress).
3. Chapters with study cards (mark as learned). Road signs catalog + flip flashcards. Practice quiz (10 Q with explanations). Regitra exam: 30 questions, 30 min, pass at 24. Progress in localStorage.
4. Include substantial quiz/sign content for KET 2026 (speed limits, priority, signs, pedestrians, micromobility, etc.).
5. SPA with React + Vite + React Router. Keep it client-side only (no auth/DB required).
6. Mobile-friendly. Publish-ready.

If source files are attached, use them as the source of truth and adapt only as needed for Lovable preview.`;

async function main() {
  const { LovableClient } = await ensureSdk();
  const client = new LovableClient({ apiKey });

  console.log('Listing workspaces…');
  const workspaces = await client.listWorkspaces();
  if (!workspaces?.length) {
    throw new Error('No Lovable workspaces found for this API key.');
  }
  const workspaceId = process.env.LOVABLE_WORKSPACE_ID || workspaces[0].id;
  console.log(`Using workspace: ${workspaceId}`);

  const zipPath = process.env.LOVABLE_ZIP || '/tmp/ket-mokykla-src.zip';
  let files;
  try {
    const data = await readFile(zipPath);
    files = [{ name: 'ket-mokykla-src.zip', data, type: 'application/zip' }];
    console.log(`Attaching source zip (${data.length} bytes)`);
  } catch {
    console.log('No source zip found; Lovable will scaffold from the prompt.');
  }

  console.log('Creating Lovable project…');
  const project = await client.createProject(workspaceId, {
    description: 'KET Mokykla — Kelių eismo taisyklės 2026',
    initialMessage: INITIAL_MESSAGE,
    files,
  });

  console.log(`Project: ${project.id}`);
  console.log(`Preview: ${client.getPreviewUrl(project.id)}`);

  if (project.message_id) {
    console.log('Waiting for initial build…');
    const result = await client.waitForMessageCompletion(project.id, project.message_id, {
      timeout: 15 * 60 * 1000,
    });
    console.log(`Build status: ${result.status}`);
    if (result.content) console.log(String(result.content).slice(0, 500));
  }

  const slug = process.env.LOVABLE_SLUG || 'ket-mokykla';
  console.log(`Publishing as ${slug}…`);
  await client.publish(project.id, { name: slug });
  const published = await client.waitForProjectPublished(project.id, {
    timeout: 10 * 60 * 1000,
  });

  console.log('\n=== DEPLOYED ===');
  console.log(`Project ID: ${project.id}`);
  console.log(`Live URL:   ${published.url}`);
  console.log(`Preview:    ${client.getPreviewUrl(project.id)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
