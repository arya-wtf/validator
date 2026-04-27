import { Octokit } from "@octokit/rest";

const owner = process.env.GITHUB_OWNER || "";
const repo = process.env.GITHUB_REPO || "";
const branch = process.env.GITHUB_BRANCH || "main";
const token = process.env.GITHUB_TOKEN || "";

export async function commitRunFile(
  filename: string,
  content: string,
  author?: string,
): Promise<void> {
  if (!token) {
    throw new Error("GITHUB_TOKEN is not set in environment variables");
  }
  if (!owner || !repo) {
    throw new Error("GITHUB_OWNER or GITHUB_REPO is not set");
  }

  const octokit = new Octokit({ auth: token });
  const path = `content/runs/${filename}`;
  const message = author
    ? `feat(runs): add ${filename} (by ${author})`
    : `feat(runs): add ${filename}`;
  const contentBase64 = Buffer.from(content, "utf8").toString("base64");

  // Check if file already exists (to update vs create)
  let sha: string | undefined;
  try {
    const existing = await octokit.repos.getContent({ owner, repo, path, ref: branch });
    if (!Array.isArray(existing.data) && "sha" in existing.data) {
      sha = existing.data.sha;
    }
  } catch (e: unknown) {
    // 404 = file doesn't exist, which is fine for create
    if ((e as { status?: number }).status !== 404) throw e;
  }

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: contentBase64,
    branch,
    sha,
  });

  // Optionally trigger Vercel rebuild faster via deploy hook
  const deployHook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (deployHook) {
    try {
      await fetch(deployHook, { method: "POST" });
    } catch {
      // Non-fatal — Vercel will still rebuild on push
    }
  }
}
