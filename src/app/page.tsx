import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HomeClient, { type OperatorStatus } from "@/components/HomeClient";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";
import { getOperatorContext } from "@/lib/operators";

function buildGithubEditUrl(relativePath: string): string | null {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!owner || !repo) return null;
  return `https://github.com/${owner}/${repo}/edit/${branch}/${relativePath}`;
}

export default async function Home() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) redirect("/login");

  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const username = await verifySession(token, secret);
  if (!username) redirect("/login");

  const ctx = getOperatorContext(username);
  const operator: OperatorStatus = {
    username,
    exists: ctx.exists,
    relativePath: ctx.relativePath,
    githubUrl: buildGithubEditUrl(ctx.relativePath),
  };

  return <HomeClient operator={operator} />;
}
