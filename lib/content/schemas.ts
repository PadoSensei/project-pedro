import { z } from "zod";

// Shared primitives
export const localeSchema = z.enum(["en", "pt"]);
export const contentStatusSchema = z.enum(["draft", "published", "archived"]);
export const riskLevelSchema = z.enum(["low", "medium", "high", "critical"]);

const nonEmptyString = z.string().min(1);
const stringArray = z.array(nonEmptyString);

const kebabCase = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Must use lowercase kebab-case");

const timestamp = z.iso.datetime({ offset: true });

// Shared metadata
export const baseContentSchema = z.strictObject({
  id: nonEmptyString,
  locale: localeSchema,
  title: nonEmptyString,
  summary: nonEmptyString,
  status: contentStatusSchema,
  category: kebabCase,
  tags: z.array(kebabCase),
  createdAt: timestamp,
  updatedAt: timestamp,
});

// Documents
export const documentSchema = baseContentSchema
  .extend({
    slug: kebabCase,
    body: nonEmptyString,
    author: nonEmptyString.optional(),
    relatedIds: stringArray.optional(),
    readingTimeMinutes: z.number().int().positive().optional(),
    reviewedAt: timestamp.optional(),
    reviewedBy: nonEmptyString.optional(),
  })
  .strict();

// Agents
export const autonomyLevelSchema = z.enum([
  "manual",
  "assisted",
  "supervised",
  "autonomous",
]);

export const agentSchema = baseContentSchema
  .extend({
    purpose: nonEmptyString,
    capabilities: stringArray,
    inputs: stringArray,
    outputs: stringArray,
    autonomyLevel: autonomyLevelSchema,
    riskLevel: riskLevelSchema,
    requiredPermissions: stringArray,
    prohibitedActions: stringArray,
    humanApprovalRequired: z.boolean(),
    limitations: stringArray.optional(),
    integrationRefs: stringArray.optional(),
    relatedIds: stringArray.optional(),
  })
  .strict();

// Operational rules
export const ruleEnforcementSchema = z.enum(["must", "should", "may"]);

export const operationalRuleSchema = baseContentSchema
  .extend({
    scope: nonEmptyString,
    severity: riskLevelSchema,
    enforcement: ruleEnforcementSchema,
    rationale: nonEmptyString,
    appliesTo: stringArray.optional(),
    exceptions: stringArray.optional(),
    relatedIds: stringArray.optional(),
  })
  .strict();

// Workflows
export const workflowStepSchema = z.strictObject({
  id: nonEmptyString,
  title: nonEmptyString,
  description: nonEmptyString,
  owner: z.enum(["human", "agent", "system"]),
  inputs: stringArray,
  outputs: stringArray,
  requiresApproval: z.boolean(),
});

export const workflowSchema = baseContentSchema
  .extend({
    trigger: nonEmptyString,
    prerequisites: stringArray,
    steps: z.array(workflowStepSchema).min(1),
    expectedOutputs: stringArray,
    riskLevel: riskLevelSchema,
    integrationRefs: stringArray.optional(),
    failureHandling: nonEmptyString.optional(),
    relatedIds: stringArray.optional(),
  })
  .strict()
  .superRefine((workflow, ctx) => {
    const stepIds = new Set<string>();

    workflow.steps.forEach((step, index) => {
      if (stepIds.has(step.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["steps", index, "id"],
          message: `Duplicate workflow step ID: ${step.id}`,
        });
      }

      stepIds.add(step.id);
    });
  });

// Collection schemas
export const agentCollectionSchema = z.array(agentSchema);
export const ruleCollectionSchema = z.array(operationalRuleSchema);
export const workflowCollectionSchema = z.array(workflowSchema);

// Inferred TypeScript types
export type Locale = z.infer<typeof localeSchema>;
export type ContentStatus = z.infer<typeof contentStatusSchema>;
export type RiskLevel = z.infer<typeof riskLevelSchema>;
export type BaseContent = z.infer<typeof baseContentSchema>;
export type DocumentContent = z.infer<typeof documentSchema>;
export type AutonomyLevel = z.infer<typeof autonomyLevelSchema>;
export type AgentContent = z.infer<typeof agentSchema>;
export type RuleEnforcement = z.infer<typeof ruleEnforcementSchema>;
export type OperationalRule = z.infer<typeof operationalRuleSchema>;
export type WorkflowStep = z.infer<typeof workflowStepSchema>;
export type WorkflowContent = z.infer<typeof workflowSchema>;
