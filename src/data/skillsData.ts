export interface SkillNode {
  id: string;
  label: string;
  proficiency: number;
  cluster: "core" | "audit" | "client" | "tax" | "compliance";
  promotionRequired?: boolean;
}

export interface SkillEdge {
  source: string;
  target: string;
}

export interface SkillSnapshot {
  nodes: SkillNode[];
  edges: SkillEdge[];
}

const allEdges: SkillEdge[] = [
  { source: "communication", target: "teamwork" },
  { source: "communication", target: "client-comm" },
  { source: "communication", target: "presentation" },
  { source: "teamwork", target: "adaptability" },
  { source: "teamwork", target: "confidence" },
  { source: "analytical", target: "fin-statements" },
  { source: "analytical", target: "risk-assessment" },
  { source: "analytical", target: "audit-planning" },
  { source: "attention-detail", target: "documentation" },
  { source: "attention-detail", target: "fin-statements" },
  { source: "audit-planning", target: "risk-assessment" },
  { source: "audit-planning", target: "sampling" },
  { source: "audit-planning", target: "materiality" },
  { source: "risk-assessment", target: "materiality" },
  { source: "risk-assessment", target: "audit-evidence" },
  { source: "fin-statements", target: "documentation" },
  { source: "fin-statements", target: "audit-evidence" },
  { source: "client-comm", target: "stakeholder-mgmt" },
  { source: "client-comm", target: "client-relationship" },
  { source: "client-comm", target: "presentation" },
  { source: "presentation", target: "confidence" },
  { source: "presentation", target: "initiative" },
  { source: "tax-compliance", target: "tax-returns" },
  { source: "tax-compliance", target: "gst-bas" },
  { source: "aml-ctf", target: "ethics" },
  { source: "ethics", target: "whs" },
  { source: "documentation", target: "ethics" },
  { source: "initiative", target: "confidence" },
  { source: "initiative", target: "analytical" },
  { source: "time-mgmt", target: "adaptability" },
  { source: "time-mgmt", target: "audit-planning" },
];

const month3Nodes: SkillNode[] = [
  { id: "communication", label: "Professional Communication", proficiency: 7.5, cluster: "core" },
  { id: "teamwork", label: "Team Collaboration", proficiency: 7.4, cluster: "core" },
  { id: "time-mgmt", label: "Time Management", proficiency: 6.8, cluster: "core" },
  { id: "analytical", label: "Analytical Thinking", proficiency: 7.0, cluster: "core" },
  { id: "adaptability", label: "Adaptability", proficiency: 6.8, cluster: "core" },
  { id: "attention-detail", label: "Attention to Detail", proficiency: 7.2, cluster: "core" },
  { id: "initiative", label: "Initiative & Ownership", proficiency: 5.3, cluster: "core" },
  { id: "confidence", label: "Professional Confidence", proficiency: 5.5, cluster: "core" },
  { id: "audit-planning", label: "Audit Planning", proficiency: 5.5, cluster: "audit" },
  { id: "risk-assessment", label: "Risk Assessment", proficiency: 4.2, cluster: "audit" },
  { id: "fin-statements", label: "Financial Statement Review", proficiency: 5.8, cluster: "audit" },
  { id: "documentation", label: "Documentation Standards", proficiency: 6.0, cluster: "audit" },
  { id: "sampling", label: "Sampling Methodology", proficiency: 0, cluster: "audit" },
  { id: "materiality", label: "Materiality Analysis", proficiency: 0, cluster: "audit" },
  { id: "audit-evidence", label: "Audit Evidence", proficiency: 3.5, cluster: "audit" },
  { id: "client-comm", label: "Client Communication", proficiency: 3.8, cluster: "client" },
  { id: "stakeholder-mgmt", label: "Stakeholder Management", proficiency: 0, cluster: "client", promotionRequired: true },
  { id: "client-relationship", label: "Client Relationship Building", proficiency: 0, cluster: "client", promotionRequired: true },
  { id: "presentation", label: "Presentation Skills", proficiency: 4.0, cluster: "client" },
  { id: "tax-compliance", label: "Tax Compliance Basics", proficiency: 3.2, cluster: "tax" },
  { id: "tax-returns", label: "Tax Return Preparation", proficiency: 2.8, cluster: "tax" },
  { id: "gst-bas", label: "GST & BAS", proficiency: 0, cluster: "tax" },
  { id: "aml-ctf", label: "AML/CTF Procedures", proficiency: 5.0, cluster: "compliance" },
  { id: "ethics", label: "Ethics & Prof. Standards", proficiency: 6.5, cluster: "compliance" },
  { id: "whs", label: "Workplace Health & Safety", proficiency: 5.5, cluster: "compliance" },
];

const month1Ids = new Set([
  "communication", "teamwork", "time-mgmt", "analytical",
  "adaptability", "attention-detail", "ethics", "whs",
]);
const month1Prof: Record<string, number> = {
  communication: 5.0, teamwork: 5.0, "time-mgmt": 4.5, analytical: 4.8,
  adaptability: 4.5, "attention-detail": 5.0, ethics: 4.0, whs: 3.5,
};

const month2Ids = new Set([
  ...month1Ids,
  "confidence", "initiative", "audit-planning", "fin-statements",
  "documentation", "audit-evidence", "aml-ctf", "client-comm",
  "presentation", "tax-compliance",
]);
const month2Prof: Record<string, number> = {
  communication: 6.2, teamwork: 6.0, "time-mgmt": 5.5, analytical: 5.8,
  adaptability: 5.5, "attention-detail": 6.0, ethics: 5.2, whs: 4.5,
  confidence: 6.5, initiative: 6.0, "audit-planning": 3.0, "fin-statements": 3.5,
  documentation: 4.0, "audit-evidence": 2.0, "aml-ctf": 3.5, "client-comm": 2.0,
  presentation: 2.5, "tax-compliance": 1.5,
};

export function getSnapshot(month: number): SkillSnapshot {
  if (month === 1) {
    const nodes = month3Nodes
      .filter((n) => month1Ids.has(n.id))
      .map((n) => ({ ...n, proficiency: month1Prof[n.id] ?? n.proficiency }));
    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = allEdges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
    return { nodes, edges };
  }
  if (month === 2) {
    const nodes = month3Nodes
      .filter((n) => month2Ids.has(n.id))
      .map((n) => ({ ...n, proficiency: month2Prof[n.id] ?? n.proficiency }));
    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = allEdges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
    return { nodes, edges };
  }
  return { nodes: [...month3Nodes], edges: [...allEdges] };
}

export function getNodeRadius(proficiency: number, promotionRequired?: boolean): number {
  if (proficiency === 0) return promotionRequired ? 9 : 7;
  // proficiency 1-10 maps to radius 8-22
  return 8 + (proficiency / 10) * 14;
}

export function getNodeStatus(node: SkillNode): "developed" | "developing" | "seed" | "promotion" {
  if (node.proficiency === 0 && node.promotionRequired) return "promotion";
  if (node.proficiency === 0) return "seed";
  if (node.proficiency > 6) return "developed";
  return "developing";
}
