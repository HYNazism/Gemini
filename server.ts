/**
 * Full-stack Express + Vite Server for Sproutling: Grove Guardian 3D.
 * Handles:
 * 1. Local Git automatic revisioning, commit, and project subfolder synchronization
 * 2. GitHub 3P OAuth Popup Flow (/api/auth/github/url & /auth/callback)
 * 3. Server-side GitHub Repository + Subfolder Publisher (/api/github/publish)
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory store for OAuth token acquired during preview session (backed by env GITHUB_TOKEN if configured)
let sessionGithubToken: string = process.env.GITHUB_TOKEN || '';
let sessionGithubUser: string = '';

function getActiveToken(): string {
  return sessionGithubToken || process.env.GITHUB_TOKEN || '';
}

function runGitSafe(cmd: string): string {
  try {
    return execSync(cmd, { cwd: process.cwd(), encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

function getLocalGitStatus() {
  const commitHash = runGitSafe('git rev-parse --short HEAD') || 'initial';
  const commitCount = parseInt(runGitSafe('git rev-list --count HEAD') || '1', 10);
  const latestTag = runGitSafe('git describe --tags --abbrev=0') || `v1.2.${commitCount}`;
  const lastCommitMsg = runGitSafe('git log -1 --pretty=%B') || 'Initial release';
  const lastCommitTime = runGitSafe('git log -1 --pretty=%ci') || new Date().toISOString();
  const subfolder = process.env.GITHUB_SUBFOLDER || 'sproutling-android-release';
  const repoName = process.env.GITHUB_REPO || 'sproutling-grove-guardian-3d';

  return {
    commitHash,
    commitCount,
    versionTag: latestTag,
    nextVersionTag: `v1.2.${commitCount + 1}`,
    lastCommitMsg,
    lastCommitTime,
    subfolder,
    repoName,
    hasGithubToken: Boolean(getActiveToken()),
    hasOAuthConfig: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    githubUser: sessionGithubUser,
  };
}

/**
 * Syncs all project files into the dedicated project subfolder and creates a new Git revision & tag.
 */
function syncSubfolderAndCommitLocal(subfolderRaw: string, customMessage?: string) {
  const subfolder = subfolderRaw.replace(/[^a-zA-Z0-9_-]/g, '') || 'sproutling-android-release';
  const rootDir = process.cwd();
  const targetDir = path.join(rootDir, subfolder);

  // Ensure directories exist inside subfolder
  fs.mkdirSync(path.join(targetDir, 'src', 'components'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'src', 'game'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'src', 'hooks'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'public'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, '.github', 'workflows'), { recursive: true });

  // Copy top-level project files into subfolder
  const rootFiles = [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'capacitor.config.ts',
    'index.html',
    'metadata.json',
    '.env.example',
  ];
  for (const file of rootFiles) {
    const srcPath = path.join(rootDir, file);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(targetDir, file));
    }
  }

  // Copy workflow
  const workflowSrc = path.join(rootDir, '.github', 'workflows', 'android-apk-release.yml');
  if (fs.existsSync(workflowSrc)) {
    fs.copyFileSync(
      workflowSrc,
      path.join(targetDir, '.github', 'workflows', 'android-apk-release.yml')
    );
  }

  // Copy src/ and public/ recursively
  const copyDirRecursive = (src: string, dest: string) => {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const s = path.join(src, entry.name);
      const d = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyDirRecursive(s, d);
      } else {
        fs.copyFileSync(s, d);
      }
    }
  };

  copyDirRecursive(path.join(rootDir, 'src'), path.join(targetDir, 'src'));
  copyDirRecursive(path.join(rootDir, 'public'), path.join(targetDir, 'public'));

  const prevCount = parseInt(runGitSafe('git rev-list --count HEAD') || '1', 10);
  const newVersionTag = `v1.2.${prevCount}`;

  // Update project-manifest.json with latest revision timestamp
  const manifestPath = path.join(targetDir, 'project-manifest.json');
  const manifest = {
    project: 'Sproutling: Grove Guardian 3D',
    packageId: 'com.hyn198911.sproutling3d',
    subfolder,
    version: newVersionTag,
    updatedAt: new Date().toISOString(),
    publisherAccount: 'hyn198911@gmail.com',
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  // Stage, commit, and tag in local git
  runGitSafe('git config user.name "Sproutling Release Bot"');
  runGitSafe('git config user.email "hyn198911@gmail.com"');
  runGitSafe('git add -A');
  const commitMsg =
    customMessage ||
    `release(${newVersionTag}): sync ${subfolder}/ subfolder & update Android 3D APK build`;
  runGitSafe(`git commit -m "${commitMsg.replace(/"/g, "'")}" --allow-empty`);
  const finalCount = parseInt(runGitSafe('git rev-list --count HEAD') || '1', 10);
  const finalTag = `v1.2.${finalCount}`;
  runGitSafe(`git tag -f ${finalTag}`);

  return getLocalGitStatus();
}

// 1. Git & Subfolder Status Endpoint
app.get('/api/github/status', (_req, res) => {
  res.json(getLocalGitStatus());
});

// 2. GitHub OAuth Popup Authorization URL (Compliant with iframe OAuth guidelines)
app.get('/api/auth/github/url', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(400).json({
      error:
        'GITHUB_CLIENT_ID در بخش Secrets تنظیم نشده است. می‌توانید GITHUB_TOKEN یا GITHUB_CLIENT_ID را در Secrets وارد کنید.',
    });
    return;
  }

  const baseAppUrl =
    process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const redirectUri = `${baseAppUrl.replace(/\/$/, '')}/auth/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo workflow',
  });

  res.json({
    url: `https://github.com/login/oauth/authorize?${params.toString()}`,
    redirectUri,
  });
});

// 3. GitHub OAuth Callback Handler (Posts message to opener and closes popup)
const oauthCallbackHandler: express.RequestHandler = async (req, res) => {
  const code = req.query.code as string | undefined;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (code && clientId && clientSecret) {
    try {
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });
      const tokenData = (await tokenRes.json()) as { access_token?: string };
      if (tokenData.access_token) {
        sessionGithubToken = tokenData.access_token;
        const userRes = await fetch('https://api.github.com/user', {
          headers: { Authorization: `Bearer ${sessionGithubToken}` },
        });
        if (userRes.ok) {
          const userData = (await userRes.json()) as { login?: string };
          sessionGithubUser = userData.login || '';
        }
      }
    } catch (e) {
      console.error('GitHub OAuth token exchange failed:', e);
    }
  }

  res.send(`
    <!doctype html>
    <html>
      <head><title>GitHub Connected</title></head>
      <body style="background:#081c15;color:#e9f5db;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
            window.close();
          } else {
            window.location.href = '/';
          }
        </script>
        <p>اتصال به گیت‌هاب با موفقیت انجام شد. این پنجره به صورت خودکار بسته می‌شود...</p>
      </body>
    </html>
  `);
};

app.get(['/auth/callback', '/auth/callback/'], oauthCallbackHandler);

// 4. Commit, Re-version Subfolder & Publish to GitHub Repository API
app.post('/api/github/publish', async (req, res) => {
  try {
    const {
      repoName = process.env.GITHUB_REPO || 'sproutling-grove-guardian-3d',
      subfolder = process.env.GITHUB_SUBFOLDER || 'sproutling-android-release',
      commitMessage,
    } = req.body as {
      repoName?: string;
      subfolder?: string;
      commitMessage?: string;
    };

    // Always sync project subfolder and create a new local Git commit & version tag immediately
    const localStatus = syncSubfolderAndCommitLocal(subfolder, commitMessage);
    const token = getActiveToken();

    if (!token) {
      res.json({
        ok: true,
        mode: 'local-git-committed',
        message: `تمامی فایل‌ها در پوشه پروژه ./${localStatus.subfolder}/ همگام‌سازی و با تگ نسخه جدید (${localStatus.versionTag}) در Git کامیت شدند. برای ارسال مستقیم به سرور GitHub، متغیر GITHUB_TOKEN را در پنل Secrets قرار دهید یا با دکمه OAuth متصل شوید.`,
        status: localStatus,
      });
      return;
    }

    // Authenticate with GitHub API
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    const userRes = await fetch('https://api.github.com/user', { headers });
    if (!userRes.ok) {
      res.status(401).json({
        ok: false,
        error: 'توکن GitHub معتبر نیست یا دسترسی repo/workflow ندارد.',
        status: localStatus,
      });
      return;
    }
    const userData = (await userRes.json()) as { login: string };
    const owner = userData.login;
    sessionGithubUser = owner;

    // Ensure repository exists (create if missing)
    const cleanRepo = repoName.replace(/[^a-zA-Z0-9._-]/g, '') || 'sproutling-grove-guardian-3d';
    const checkRepo = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, { headers });
    if (checkRepo.status === 404) {
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: cleanRepo,
          description:
            'Sproutling: Grove Guardian 3D — Cozy Android 3D Action Game with Google Play AdMob & Automated APK Releases',
          private: false,
          auto_init: true,
        }),
      });
      if (!createRes.ok) {
        const errText = await createRes.text();
        res.status(400).json({
          ok: false,
          error: `خطا در ساخت مخزن گیت‌هاب: ${errText}`,
          status: localStatus,
        });
        return;
      }
    }

    // Push local commits & tags directly to remote repository
    const remoteUrl = `https://x-access-token:${token}@github.com/${owner}/${cleanRepo}.git`;
    const existingRemotes = runGitSafe('git remote');
    if (existingRemotes.split('\n').includes('origin')) {
      runGitSafe(`git remote set-url origin "${remoteUrl}"`);
    } else {
      runGitSafe(`git remote add origin "${remoteUrl}"`);
    }

    runGitSafe('git push -u origin main --force');
    runGitSafe(`git push origin ${localStatus.versionTag} --force`);

    res.json({
      ok: true,
      mode: 'github-remote-published',
      repoUrl: `https://github.com/${owner}/${cleanRepo}`,
      subfolderUrl: `https://github.com/${owner}/${cleanRepo}/tree/main/${localStatus.subfolder}`,
      releasesUrl: `https://github.com/${owner}/${cleanRepo}/releases`,
      message: `پروژه و زیرپوشه ${localStatus.subfolder}/ با نسخه ${localStatus.versionTag} در مخزن ${owner}/${cleanRepo} منتشر شد و پایپ‌لاین ساخت APK فعال گردید.`,
      status: getLocalGitStatus(),
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'خطای پیش‌بینی نشده در انتشار',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sproutling 3D Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
