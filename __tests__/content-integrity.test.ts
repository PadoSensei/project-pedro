import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { validateContentIntegrity } from "../lib/content/integrity";

describe("content integrity", () => {
  let tempDirectory: string;

  function setup() {
    tempDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "project-pedro-integrity-")
    );
    return tempDirectory;
  }

  function writeJson(relativePath: string, data: unknown) {
    const filePath = path.join(tempDirectory, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data));
  }

  function document(id: string, locale: "en" | "pt", status = "draft") {
    return {
      id,
      locale,
      title: locale === "en" ? "Test document" : "Documento de teste",
      summary: "Test summary",
      status,
      category: "testing",
      tags: [],
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      slug: locale === "en" ? "test-document" : "documento-teste",
      body: "Test body",
    };
  }

  afterEach(() => {
    if (tempDirectory && fs.existsSync(tempDirectory)) {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("passes when the content directory is empty", () => {
    setup();

    expect(validateContentIntegrity(tempDirectory)).toEqual([]);
  });

  it("detects invalid JSON", () => {
    setup();

    const filePath = path.join(tempDirectory, "agents", "en.json");
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, "{ invalid");

    expect(validateContentIntegrity(tempDirectory)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: "Invalid JSON syntax." }),
      ])
    );
  });

  it("detects IDs that are not kebab-case", () => {
    setup();

    writeJson("docs/en/test-document.json", document("Invalid_ID", "en"));

    expect(validateContentIntegrity(tempDirectory).some((issue) =>
      issue.message.includes("must use lowercase kebab-case")
    )).toBe(true);
  });

  it("detects missing published translation counterparts", () => {
    setup();

    writeJson(
      "docs/en/test-document.json",
      document("test-document", "en", "published")
    );

    expect(validateContentIntegrity(tempDirectory).some((issue) =>
      issue.message.includes('missing its pt counterpart')
    )).toBe(true);
  });

  it("accepts published records with published counterparts", () => {
    setup();

    writeJson(
      "docs/en/test-document.json",
      document("test-document", "en", "published")
    );
    writeJson(
      "docs/pt/documento-teste.json",
      document("test-document", "pt", "published")
    );

    expect(validateContentIntegrity(tempDirectory)).toEqual([]);
  });

  it("detects references to unknown related IDs", () => {
    setup();

    writeJson("docs/en/test-document.json", {
      ...document("test-document", "en"),
      relatedIds: ["missing-record"],
    });

    expect(validateContentIntegrity(tempDirectory).some((issue) =>
      issue.message.includes('unknown related ID "missing-record"')
    )).toBe(true);
  });

  it("detects IDs reused across content types", () => {
    setup();

    writeJson("docs/en/test-document.json", document("shared-id", "en"));

    writeJson("agents/en.json", [
      {
        id: "shared-id",
        locale: "en",
        title: "Test agent",
        summary: "Test summary",
        status: "draft",
        category: "testing",
        tags: [],
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
        purpose: "Testing",
        capabilities: [],
        inputs: [],
        outputs: [],
        autonomyLevel: "manual",
        riskLevel: "low",
        requiredPermissions: [],
        prohibitedActions: [],
        humanApprovalRequired: false,
      },
    ]);

    expect(validateContentIntegrity(tempDirectory).some((issue) =>
      issue.message.includes("used by multiple content types")
    )).toBe(true);
  });

  it("detects likely embedded credentials without exposing their values", () => {
    setup();

    writeJson("docs/en/test-document.json", {
      ...document("test-document", "en"),
      body: "api_key: example-secret-value-12345",
    });

    const issues = validateContentIntegrity(tempDirectory);

    expect(issues.some((issue) =>
      issue.message.includes("Possible embedded credential or secret")
    )).toBe(true);
    expect(JSON.stringify(issues)).not.toContain("example-secret-value-12345");
  });
});

describe("repository content integrity", () => {
  it("validates the repository content directory", () => {
    expect(validateContentIntegrity()).toEqual([]);
  });
});
