import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Username } from "@/lib/auth";

const OPERATORS_DIR = path.join(process.cwd(), "content", "operators");

export interface OperatorContext {
  username: Username;
  exists: boolean;
  content: string;
  relativePath: string;
}

export function getOperatorContext(username: Username): OperatorContext {
  const filename = `${username}.md`;
  const relativePath = `content/operators/${filename}`;
  const filepath = path.join(OPERATORS_DIR, filename);

  if (!fs.existsSync(filepath)) {
    return { username, exists: false, content: "", relativePath };
  }

  try {
    const raw = fs.readFileSync(filepath, "utf8");
    const { content } = matter(raw);
    return { username, exists: true, content: content.trim(), relativePath };
  } catch {
    return { username, exists: false, content: "", relativePath };
  }
}
