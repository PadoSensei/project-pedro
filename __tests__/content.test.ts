import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { createContentReader } from "../lib/content";

describe("content readers", () => {
  let tempDirectory: string;

  function createReader() {
    tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "project-pedro-"));

    return createContentReader(tempDirectory);
  }

  afterEach(() => {
    if (tempDirectory && fs.existsSync(tempDirectory)) {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("returns an empty array when a collection is missing", () => {
    const reader = createReader();

    expect(reader.getAllAgents("en")).toEqual([]);
  });

  it("loads and sorts document slugs", () => {
    const reader = createReader();
    const docsDirectory = path.join(tempDirectory, "docs", "en");

    fs.mkdirSync(docsDirectory, { recursive: true });
    fs.writeFileSync(path.join(docsDirectory, "zebra.json"), "{}");
    fs.writeFileSync(path.join(docsDirectory, "alpha.json"), "{}");
    fs.writeFileSync(path.join(docsDirectory, "ignored.txt"), "ignored");

    expect(reader.getDocSlugs("en")).toEqual(["alpha", "zebra"]);
  });

  it("returns null when a document does not exist", () => {
    const reader = createReader();

    expect(reader.getDocBySlug("en", "missing-doc")).toBeNull();
  });

  it("rejects invalid JSON syntax", () => {
    const reader = createReader();
    const agentsDirectory = path.join(tempDirectory, "agents");

    fs.mkdirSync(agentsDirectory, { recursive: true });
    fs.writeFileSync(path.join(agentsDirectory, "en.json"), "{ invalid");

    expect(() => reader.getAllAgents("en")).toThrow(/Invalid JSON syntax/);
  });

  it("rejects duplicate IDs in a collection", () => {
    const reader = createReader();
    const agentsDirectory = path.join(tempDirectory, "agents");

    fs.mkdirSync(agentsDirectory, { recursive: true });

    const agent = {
      id: "test-agent",
      locale: "en",
      title: "Test agent",
      summary: "A test agent",
      status: "draft",
      category: "testing",
      tags: [],
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      purpose: "Testing content validation",
      capabilities: [],
      inputs: [],
      outputs: [],
      autonomyLevel: "manual",
      riskLevel: "low",
      requiredPermissions: [],
      prohibitedActions: [],
      humanApprovalRequired: false,
    };

    fs.writeFileSync(
      path.join(agentsDirectory, "en.json"),
      JSON.stringify([agent, agent])
    );

    expect(() => reader.getAllAgents("en")).toThrow(/Duplicate content ID/);
  });

  it("rejects a collection containing the wrong locale", () => {
    const reader = createReader();
    const agentsDirectory = path.join(tempDirectory, "agents");

    fs.mkdirSync(agentsDirectory, { recursive: true });

    const agent = {
      id: "test-agent",
      locale: "pt",
      title: "Agente de teste",
      summary: "Um agente de teste",
      status: "draft",
      category: "testing",
      tags: [],
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      purpose: "Testar validação de conteúdo",
      capabilities: [],
      inputs: [],
      outputs: [],
      autonomyLevel: "manual",
      riskLevel: "low",
      requiredPermissions: [],
      prohibitedActions: [],
      humanApprovalRequired: false,
    };

    fs.writeFileSync(
      path.join(agentsDirectory, "en.json"),
      JSON.stringify([agent])
    );

    expect(() => reader.getAllAgents("en")).toThrow(/expected "en"/);
  });

  it("rejects invalid document slugs", () => {
    const reader = createReader();

    expect(() => reader.getDocBySlug("en", "../secret")).toThrow(
      /Invalid document slug/
    );
  });
});
