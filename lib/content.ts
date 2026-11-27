import fs from "fs";
import path from "path";
import type {
  AgentContent,
  DocumentContent,
  Locale,
  OperationalRule,
} from "./content-types";

const contentDirectory = path.join(process.cwd(), "content");

export function getDocSlugs(locale: Locale): string[] {
  const docsDir = path.join(contentDirectory, "docs", locale);
  if (!fs.existsSync(docsDir)) return [];
  return fs.readdirSync(docsDir).map((file) => file.replace(/\.json$/, ""));
}

export function getDocBySlug(
  locale: Locale,
  slug: string,
): DocumentContent | null {
  const filePath = path.join(contentDirectory, "docs", locale, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const fileContents = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContents) as DocumentContent;
}

export function getAllAgents(locale: Locale): AgentContent[] {
  const filePath = path.join(contentDirectory, "agents", `${locale}.json`);
  if (!fs.existsSync(filePath)) return [];
  const fileContents = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContents) as AgentContent[];
}

export function getRules(locale: Locale): OperationalRule[] {
  const filePath = path.join(contentDirectory, "rules", `${locale}.json`);
  if (!fs.existsSync(filePath)) return [];
  const fileContents = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContents) as OperationalRule[];
}
