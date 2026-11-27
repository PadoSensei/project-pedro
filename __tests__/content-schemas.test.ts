import { describe, expect, it } from "vitest";
import {
  documentSchema,
  agentSchema,
  operationalRuleSchema,
  workflowSchema,
} from "../lib/content/schemas";

const base = {
  id: "test-record",
  locale: "en" as const,
  title: "Test title",
  summary: "Test summary",
  status: "draft" as const,
  category: "operations",
  tags: ["paid-media"],
  createdAt: "2026-01-01T10:00:00Z",
  updatedAt: "2026-01-02T10:00:00Z",
};

const document = {
  ...base,
  slug: "test-document",
  body: "# Test document",
};

const agent = {
  ...base,
  purpose: "Test purpose",
  capabilities: ["reporting"],
  inputs: ["campaign-data"],
  outputs: ["report"],
  autonomyLevel: "assisted" as const,
  riskLevel: "low" as const,
  requiredPermissions: ["read-reports"],
  prohibitedActions: ["modify-budgets"],
  humanApprovalRequired: true,
};

const rule = {
  ...base,
  scope: "Campaign reporting",
  severity: "medium" as const,
  enforcement: "must" as const,
  rationale: "Ensure reporting consistency",
};

const workflow = {
  ...base,
  trigger: "A campaign is created",
  prerequisites: ["campaign-access"],
  steps: [
    {
      id: "review",
      title: "Review campaign",
      description: "Check campaign settings",
      owner: "human" as const,
      inputs: ["campaign"],
      outputs: ["review-result"],
      requiresApproval: true,
    },
  ],
  expectedOutputs: ["approved-campaign"],
  riskLevel: "low" as const,
};

describe("content schemas", () => {
  it("accepts a valid document", () => {
    expect(documentSchema.safeParse(document).success).toBe(true);
  });

  it("accepts a valid agent", () => {
    expect(agentSchema.safeParse(agent).success).toBe(true);
  });

  it("accepts a valid operational rule", () => {
    expect(operationalRuleSchema.safeParse(rule).success).toBe(true);
  });

  it("accepts a valid workflow", () => {
    expect(workflowSchema.safeParse(workflow).success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const invalid = { ...document };
    delete (invalid as Partial<typeof invalid>).title;

    expect(documentSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects unexpected fields", () => {
    expect(
      documentSchema.safeParse({
        ...document,
        unexpectedField: "not allowed",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid locales", () => {
    expect(
      documentSchema.safeParse({
        ...document,
        locale: "es",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid timestamps", () => {
    expect(
      documentSchema.safeParse({
        ...document,
        createdAt: "not-a-date",
      }).success,
    ).toBe(false);
  });

  it("rejects non-kebab-case categories", () => {
    expect(
      documentSchema.safeParse({
        ...document,
        category: "Paid Media",
      }).success,
    ).toBe(false);
  });

  it("rejects duplicate workflow step IDs", () => {
    expect(
      workflowSchema.safeParse({
        ...workflow,
        steps: [
          ...workflow.steps,
          { ...workflow.steps[0], title: "Second step" },
        ],
      }).success,
    ).toBe(false);
  });
});
