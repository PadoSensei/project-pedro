import fs from "fs";
import path from "path";

const contentDirectory = path.join(process.cwd(), "content");

export function getDocSlugs(locale: string) {
  const docsDir = path.join(contentDirectory, "docs", locale);
  if (!fs.existsSync(docsDir)) return [];
  return fs.readdirSync(docsDir).map((file) => file.replace(/\.json$/, ""));
}

export function getDocBySlug(locale: string, slug: string) {
  const filePath = path.join(contentDirectory, "docs", locale, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const fileContents = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContents);
}

export function getAllAgents(locale: string) {
  const filePath = path.join(contentDirectory, "agents", `${locale}.json`);
  if (!fs.existsSync(filePath)) return [];
  const fileContents = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContents);
}

export function getRules(locale: string) {
  const filePath = path.join(contentDirectory, "rules", `${locale}.json`);
  if (!fs.existsSync(filePath)) return [];
  const fileContents = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContents);
}
