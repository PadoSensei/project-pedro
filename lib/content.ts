import fs from "fs";
import path from "path";
import { z } from "zod";

import {
  agentCollectionSchema,
  documentSchema,
  localeSchema,
  ruleCollectionSchema,
  workflowCollectionSchema,
  type AgentContent,
  type DocumentContent,
  type Locale,
  type OperationalRule,
  type WorkflowContent,
} from "./content/schemas";

import { ContentValidationError } from "./content/errors";

function validateLocale(locale: string): asserts locale is Locale {
  if (!localeSchema.safeParse(locale).success) {
    throw new ContentValidationError(
      "content",
      `Unsupported locale "${locale}". Expected "en" or "pt".`
    );
  }
}

function parseContent<T>(
  filePath: string,
  contents: string,
  schema: z.ZodType<T>
): T {
  let data: unknown;

  try {
    data = JSON.parse(contents);
  } catch {
    throw new ContentValidationError(filePath, "Invalid JSON syntax.");
  }

  const result = schema.safeParse(data);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => {
        const field = issue.path.length ? issue.path.join(".") : "(root)";
        return `${field}: ${issue.message}`;
      })
      .join("; ");

    throw new ContentValidationError(filePath, details);
  }

  return result.data;
}

export function createContentReader(
  contentDirectory = path.join(process.cwd(), "content")
) {
  function readCollection<T extends { id: string; locale: Locale }>(
    filePath: string,
    schema: z.ZodType<T[]>,
    expectedLocale: Locale
  ): T[] {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const contents = fs.readFileSync(filePath, "utf8");
    const records = parseContent(filePath, contents, schema);
    const ids = new Set<string>();

    for (const record of records) {
      if (record.locale !== expectedLocale) {
        throw new ContentValidationError(
          filePath,
          `Record "${record.id}" has locale "${record.locale}", expected "${expectedLocale}".`
        );
      }

      if (ids.has(record.id)) {
        throw new ContentValidationError(
          filePath,
          `Duplicate content ID "${record.id}".`
        );
      }

      ids.add(record.id);
    }

    return records;
  }

  function getDocSlugs(locale: Locale): string[] {
    validateLocale(locale);

    const docsDir = path.join(contentDirectory, "docs", locale);

    if (!fs.existsSync(docsDir)) {
      return [];
    }

    return fs
      .readdirSync(docsDir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.slice(0, -5))
      .sort();
  }

  function getDocBySlug(locale: Locale, slug: string): DocumentContent | null {
    validateLocale(locale);

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new ContentValidationError(
        "content/docs",
        `Invalid document slug "${slug}". Expected lowercase kebab-case.`
      );
    }

    const filePath = path.join(
      contentDirectory,
      "docs",
      locale,
      `${slug}.json`
    );

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const contents = fs.readFileSync(filePath, "utf8");
    const document = parseContent(filePath, contents, documentSchema);

    if (document.locale !== locale) {
      throw new ContentValidationError(
        filePath,
        `Expected locale "${locale}", received "${document.locale}".`
      );
    }

    if (document.slug !== slug) {
      throw new ContentValidationError(
        filePath,
        `Expected slug "${slug}", received "${document.slug}".`
      );
    }

    return document;
  }

  function getAllAgents(locale: Locale): AgentContent[] {
    validateLocale(locale);

    const filePath = path.join(contentDirectory, "agents", `${locale}.json`);

    return readCollection(filePath, agentCollectionSchema, locale);
  }

  function getRules(locale: Locale): OperationalRule[] {
    validateLocale(locale);

    const filePath = path.join(contentDirectory, "rules", `${locale}.json`);

    return readCollection(filePath, ruleCollectionSchema, locale);
  }

  function getAllWorkflows(locale: Locale): WorkflowContent[] {
    validateLocale(locale);

    const filePath = path.join(contentDirectory, "workflows", `${locale}.json`);

    return readCollection(filePath, workflowCollectionSchema, locale);
  }

  return {
    getDocSlugs,
    getDocBySlug,
    getAllAgents,
    getRules,
    getAllWorkflows,
  };
}

const defaultReader = createContentReader();

export function getDocSlugs(locale: Locale): string[] {
  return defaultReader.getDocSlugs(locale);
}

export function getDocBySlug(
  locale: Locale,
  slug: string
): DocumentContent | null {
  return defaultReader.getDocBySlug(locale, slug);
}

export function getAllAgents(locale: Locale): AgentContent[] {
  return defaultReader.getAllAgents(locale);
}

export function getRules(locale: Locale): OperationalRule[] {
  return defaultReader.getRules(locale);
}

export function getAllWorkflows(locale: Locale): WorkflowContent[] {
  return defaultReader.getAllWorkflows(locale);
}
