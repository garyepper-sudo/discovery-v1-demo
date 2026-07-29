import type { OrganizationalFunction } from "./types";

export type FunctionDefinition = {
  definition: string;
  includes: string;
  excludes: string;
  canonicalRelationship: string;
  ambiguityRisk: string;
  positiveExample: string;
  negativeControl: string;
};

export const FUNCTION_VOCABULARY: Record<
  OrganizationalFunction,
  FunctionDefinition
> = {
  "demand-generation": {
    definition: "Creating qualified interest or demand for an organization's offering.",
    includes: "Prospect creation, outreach response, qualified pipeline entry.",
    excludes: "Conversion of an existing opportunity and realized revenue.",
    canonicalRelationship: "May contextualize demand Signals; is not a Signal, Phenomenon, Mechanism, or Condition.",
    ambiguityRisk: "Generic references to growth may not identify demand creation.",
    positiveExample: "Qualified inquiries entering the pipeline fell.",
    negativeControl: "Crop demand increased after a weather event.",
  },
  "value-conversion": {
    definition: "Converting qualified demand into an accepted exchange or commitment.",
    includes: "Win rate, close progression, opportunity duration.",
    excludes: "Demand creation, pricing policy, and delivery after commitment.",
    canonicalRelationship: "Projects the organizational work implicated by conversion evidence without asserting why it changed.",
    ambiguityRisk: "Conversion can describe technical formats rather than commercial work.",
    positiveExample: "Opportunities now take longer to become signed work.",
    negativeControl: "The file conversion took longer after deployment.",
  },
  "value-exchange": {
    definition: "Setting and realizing the economic exchange for delivered value.",
    includes: "Pricing, discounts, reimbursement, contribution exchange.",
    excludes: "Demand volume, customer retention, and resource budgets.",
    canonicalRelationship: "Adds a stable function above pricing evidence; conditions may later assess its health.",
    ambiguityRisk: "Price references may describe input costs rather than value exchange.",
    positiveExample: "Discount exceptions increased while realized price fell.",
    negativeControl: "Steel input prices increased.",
  },
  "customer-retention": {
    definition: "Sustaining an existing customer, member, donor, or constituent relationship.",
    includes: "Renewals, cancellations, repeat participation, preventable attrition.",
    excludes: "Document retention and acquisition of new customers.",
    canonicalRelationship: "Generalizes retention evidence across sectors without declaring a retention mechanism.",
    ambiguityRisk: "The word retention is overloaded outside customer relationships.",
    positiveExample: "More members chose not to renew.",
    negativeControl: "The records retention policy changed.",
  },
  "capacity-acquisition": {
    definition: "Acquiring people or other durable capacity needed to perform work.",
    includes: "Hiring funnel, vacancy fill, volunteer recruitment, credentialing.",
    excludes: "Work allocation among existing capacity and demand generation.",
    canonicalRelationship: "Separates capacity supply acquisition from the execution-capacity Condition.",
    ambiguityRisk: "Open roles can indicate planned growth rather than constrained acquisition.",
    positiveExample: "Approved vacancies remain unfilled longer.",
    negativeControl: "The role description was edited.",
  },
  "productive-capacity": {
    definition: "Making usable existing capacity available for organizational work.",
    includes: "Workload saturation, staffing availability, machine or clinician capacity.",
    excludes: "Acquiring new capacity and prioritizing its use.",
    canonicalRelationship: "Interprets capacity evidence; canonical Conditions assess whether capacity is constrained.",
    ambiguityRisk: "Demand and capacity are often reported in one sentence.",
    positiveExample: "Caseload growth has outpaced available clinician hours.",
    negativeControl: "The auditorium capacity is 500.",
  },
  "decision-formation": {
    definition: "Developing and selecting a course of action from available information.",
    includes: "Option evaluation, decision preparation, deliberation.",
    excludes: "Formal sign-off and implementation.",
    canonicalRelationship: "Distinct from decision-latency Phenomena when evidence concerns analysis rather than authorization.",
    ambiguityRisk: "A reference to a decision may not reveal formation versus authorization.",
    positiveExample: "Teams repeatedly reopen option analysis.",
    negativeControl: "The referee's decision was disputed.",
  },
  "decision-authorization": {
    definition: "Granting the formal authority or approval required for action.",
    includes: "Sign-off queues, approval dependencies, escalation for authority.",
    excludes: "Option formation and ordinary status review.",
    canonicalRelationship: "Can contextualize approval-bottleneck Phenomena without duplicating their observed status.",
    ambiguityRisk: "Approval can mean sentiment or content acceptance.",
    positiveExample: "Senior sign-off now holds routine requests for days.",
    negativeControl: "The program's approval rating improved.",
  },
  coordination: {
    definition: "Synchronizing interdependent work across people or organizational boundaries.",
    includes: "Handoffs, dependency resolution, ownership interfaces.",
    excludes: "Single-team task execution and strategic priority selection.",
    canonicalRelationship: "Broadly overlaps coordination Signals/Phenomena; useful mainly as a reusable projection.",
    ambiguityRisk: "A handoff mention alone may not establish coordination friction.",
    positiveExample: "Unresolved handoffs repeatedly stop cross-team work.",
    negativeControl: "The relay baton handoff was practiced.",
  },
  "execution-throughput": {
    definition: "Moving committed work to a completed operational outcome.",
    includes: "Cycle time, delivery flow, case completion, release throughput.",
    excludes: "Demand creation, capacity acquisition, and quality outcomes alone.",
    canonicalRelationship: "Contextualizes execution Signals; mechanisms must still explain throughput changes.",
    ambiguityRisk: "Delivery can mean logistics, software release, or communication.",
    positiveExample: "Committed cases are completing more slowly.",
    negativeControl: "The speech delivery was deliberately slow.",
  },
  "quality-control": {
    definition: "Preventing, detecting, and correcting defects or rework.",
    includes: "Defect escape, rework, audit failures, returns caused by quality.",
    excludes: "General execution delay without quality evidence.",
    canonicalRelationship: "May precede quality Phenomena; does not infer a cause of defects.",
    ambiguityRisk: "Returns can mean customer retention, logistics, or investment yield.",
    positiveExample: "Inspection failures are driving repeat work.",
    negativeControl: "Investment returns declined.",
  },
  "knowledge-flow": {
    definition: "Making operating knowledge available across people, boundaries, and time.",
    includes: "Documentation access, context transfer, institutional memory.",
    excludes: "Learning whether behavior changed after feedback.",
    canonicalRelationship: "Overlaps knowledge-continuity Signals/Conditions but names implicated work, not health.",
    ambiguityRisk: "Document existence does not establish usable knowledge flow.",
    positiveExample: "Shift teams cannot retrieve prior incident context.",
    negativeControl: "A policy document was archived.",
  },
  "learning-adaptation": {
    definition: "Converting feedback and outcomes into changed reusable practice.",
    includes: "Recurring failures, closed feedback loops, adopted lessons.",
    excludes: "One-time training and passive knowledge storage.",
    canonicalRelationship: "Overlaps learning Phenomena/Conditions and is likely a projection rather than a primitive.",
    ambiguityRisk: "Learning language may refer only to education activity.",
    positiveExample: "The same incident recurs despite completed reviews.",
    negativeControl: "Staff attended a training course.",
  },
  "resource-allocation": {
    definition: "Assigning scarce money, time, people, or assets among competing uses.",
    includes: "Budget shifts, priority allocation, portfolio trade-offs.",
    excludes: "Acquiring capacity and executing already allocated work.",
    canonicalRelationship: "Can connect allocation evidence across domains; does not judge strategic quality.",
    ambiguityRisk: "Spending changes may reflect price changes rather than allocation.",
    positiveExample: "Funds moved from prevention to urgent response.",
    negativeControl: "Invoice processing costs rose.",
  },
};

