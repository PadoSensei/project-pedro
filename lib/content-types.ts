export type Locale = "en" | "pt";

export type ContentStatus = "draft" | "published" | "archived";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface BaseContent {
  id: string;
  locale: Locale;
  title: string;
  summary: string;
  status: ContentStatus;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentContent extends BaseContent {
  slug: string;
  body: string;
  author?: string;
  relatedIds?: string[];
  readingTimeMinutes?: number;
  reviewedAt?: string;
  reviewedBy?: string;
}

export type AutonomyLevel =
  | "manual"
  | "assisted"
  | "supervised"
  | "autonomous";

export interface AgentContent extends BaseContent {
  purpose: string;
  capabilities: string[];
  inputs: string[];
  outputs: string[];
  autonomyLevel: AutonomyLevel;
  riskLevel: RiskLevel;
  requiredPermissions: string[];
  prohibitedActions: string[];
  humanApprovalRequired: boolean;
  limitations?: string[];
  integrationRefs?: string[];
  relatedIds?: string[];
}

export type RuleEnforcement = "must" | "should" | "may";

export interface OperationalRule extends BaseContent {
  scope: string;
  severity: RiskLevel;
  enforcement: RuleEnforcement;
  rationale: string;
  appliesTo?: string[];
  exceptions?: string[];
  relatedIds?: string[];
}

export type WorkflowStepOwner = "human" | "agent" | "system";

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  owner: WorkflowStepOwner;
  inputs: string[];
  outputs: string[];
  requiresApproval: boolean;
}

export interface WorkflowContent extends BaseContent {
  trigger: string;
  prerequisites: string[];
  steps: WorkflowStep[];
  expectedOutputs: string[];
  riskLevel: RiskLevel;
  integrationRefs?: string[];
  failureHandling?: string;
  relatedIds?: string[];
}
