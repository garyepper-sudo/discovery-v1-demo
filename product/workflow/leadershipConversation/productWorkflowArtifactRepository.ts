import { constants } from "node:fs";
import {
  chmod,
  link,
  lstat,
  mkdir,
  open,
  readFile,
  realpath,
  rename,
  rm,
  unlink,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  assertGovernedConsequenceScopeBindingV1,
  type LeadershipConversationArtifactStoreV1,
  type ProposalKind,
} from "./contracts";
import { leadershipDigest, leadershipStableSerialize } from "./determinism";

const SAFE = /^[A-Za-z0-9_-]+$/;
const pause = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
const empty = (
  organizationId: string,
): LeadershipConversationArtifactStoreV1 => ({
  contractVersion: "1",
  organizationId,
  contexts: [],
  preparedWorkProducts: [],
  frozenSnapshots: [],
  preparedWorkPublications: [],
  frozenSnapshotPublications: [],
  privateWorkingContributionFreezeIntents: [],
  privateWorkingContributionPublications: [],
  privateWorkingContributionReceipts: [],
  privateWorkingContributionCaptures: [],
  privateWorkingContributionCaptureReceipts: [],
  publicationReceipts: [],
  whatChangedPublications: [],
  cycle1ClosureCompletions: [],
  uploadReceipts: [],
  proposals: [],
  dispositions: [],
  canonicalRoutingReceipts: [],
  routingLinks: [],
  changeLinks: [],
  futurePreparationLinks: [],
  productMaterializations: [],
  productMaterializationReceipts: [],
  historicalCheckpointLifecycleLinks: [],
  historicalCheckpointLifecycleLinkReceipts: [],
  events: [],
  idempotency: [],
  storeDigest: "",
});
export function normalizeLeadershipConversationArtifactStore(
  store: LeadershipConversationArtifactStoreV1,
): LeadershipConversationArtifactStoreV1 {
  return {
    ...store,
    preparedWorkPublications: store.preparedWorkPublications ?? [],
    frozenSnapshotPublications: store.frozenSnapshotPublications ?? [],
    privateWorkingContributionFreezeIntents:
      store.privateWorkingContributionFreezeIntents ?? [],
    privateWorkingContributionPublications:
      store.privateWorkingContributionPublications ?? [],
    privateWorkingContributionReceipts:
      store.privateWorkingContributionReceipts ?? [],
    privateWorkingContributionCaptures:
      store.privateWorkingContributionCaptures ?? [],
    privateWorkingContributionCaptureReceipts:
      store.privateWorkingContributionCaptureReceipts ?? [],
    publicationReceipts: store.publicationReceipts ?? [],
    whatChangedPublications: store.whatChangedPublications ?? [],
    cycle1ClosureCompletions: store.cycle1ClosureCompletions ?? [],
    productMaterializations: store.productMaterializations ?? [],
    productMaterializationReceipts: store.productMaterializationReceipts ?? [],
    historicalCheckpointLifecycleLinks:
      store.historicalCheckpointLifecycleLinks ?? [],
    historicalCheckpointLifecycleLinkReceipts:
      store.historicalCheckpointLifecycleLinkReceipts ?? [],
  };
}
function assertNoLegacyCombinedBodies(
  store: LeadershipConversationArtifactStoreV1,
): void {
  if (
    store.preparedWorkProducts.length ||
    store.frozenSnapshots.length ||
    store.changeLinks.length
  )
    throw new Error(
      "Product Workflow legacy combined artifact container is unsupported.",
    );
}
function assertGovernedScopeLineage(
  store: LeadershipConversationArtifactStoreV1,
): void {
  for (const proposal of store.proposals) {
    if (proposal.contractVersion === "2")
      assertGovernedConsequenceScopeBindingV1(
        proposal.governedScopeBinding,
        store.organizationId,
      );
    else if (
      proposal.contractVersion !== "1" ||
      ("governedScopeBinding" in proposal && proposal.governedScopeBinding)
    )
      throw new Error("Product Workflow proposal version is invalid.");
  }
  for (const disposition of store.dispositions) {
    const proposal = store.proposals.find(
      (value) => value.proposalId === disposition.proposalId,
    );
    if (!proposal)
      throw new Error("Product Workflow governed scope lineage is invalid.");
    const expected =
      proposal.contractVersion === "2"
        ? proposal.governedScopeBinding.bindingDigest
        : undefined;
    if (
      disposition.governedScopeBindingDigest !== expected ||
      (disposition.sourceProposalContractVersion !== undefined &&
        disposition.sourceProposalContractVersion !== proposal.contractVersion)
    )
      throw new Error("Product Workflow governed scope lineage is invalid.");
  }
  for (const receipt of store.canonicalRoutingReceipts) {
    if (
      receipt.sourceProposalContractVersion !== undefined &&
      receipt.sourceProposalContractVersion !== "2"
    )
      throw new Error("Product Workflow governed routing lineage is invalid.");
    if (
      receipt.sourceProposalContractVersion === "2" &&
      !receipt.governedScopeBindingDigest
    )
      throw new Error("Product Workflow governed routing lineage is invalid.");
  }
  for (const link of store.routingLinks) {
    if (
      link.sourceProposalContractVersion !== undefined &&
      link.sourceProposalContractVersion !== "2"
    )
      throw new Error("Product Workflow governed routing lineage is invalid.");
    if (
      link.sourceProposalContractVersion === "2" &&
      !link.governedScopeBindingDigest
    )
      throw new Error("Product Workflow governed routing lineage is invalid.");
  }
}
function bytes(store: LeadershipConversationArtifactStoreV1) {
  const { storeDigest: _ignored, ...safe } = store;
  const complete = {
    ...safe,
    storeDigest: leadershipDigest(leadershipStableSerialize(safe)),
  };
  return new TextEncoder().encode(`${leadershipStableSerialize(complete)}\n`);
}
export type ProductWorkflowStoreSnapshot = {
  store: LeadershipConversationArtifactStoreV1;
  revision: string | null;
};
export type ProductWorkflowOccurrenceIdentity = {
  organizationId: string;
  questionId: string;
  seriesId: string;
  conversationId: string;
};
export type ProductWorkflowOccurrenceSlice = {
  contractVersion: "1";
  identity: ProductWorkflowOccurrenceIdentity;
  storeRevision: string | null;
  storeIntegrityRef: string;
  store: LeadershipConversationArtifactStoreV1;
  internalWholeFileReads: number;
  internalWholeFileParses: number;
};
export type ProductWorkflowOccurrenceMutation = {
  cycle1ClosureCompletions?: NonNullable<
    LeadershipConversationArtifactStoreV1["cycle1ClosureCompletions"]
  >;
  events?: LeadershipConversationArtifactStoreV1["events"];
  idempotency?: LeadershipConversationArtifactStoreV1["idempotency"];
};
export type ProductWorkflowLifecycleIdentity = {
  organizationId: string;
  questionId: string;
  conversationId: string;
  checkpointId: string;
  checkpointRevision: string;
};
export type ProductWorkflowLifecycleSlice = {
  contractVersion: "1";
  identity: ProductWorkflowLifecycleIdentity;
  storeRevision: string | null;
  checkpointPublication:
    | NonNullable<
        LeadershipConversationArtifactStoreV1["frozenSnapshotPublications"]
      >[number]
    | null;
  links: NonNullable<
    LeadershipConversationArtifactStoreV1["historicalCheckpointLifecycleLinks"]
  >;
  receipts: NonNullable<
    LeadershipConversationArtifactStoreV1["historicalCheckpointLifecycleLinkReceipts"]
  >;
  idempotency: LeadershipConversationArtifactStoreV1["idempotency"];
};
export type ProductWorkflowLifecycleMutation = {
  links: NonNullable<
    LeadershipConversationArtifactStoreV1["historicalCheckpointLifecycleLinks"]
  >;
  receipts: NonNullable<
    LeadershipConversationArtifactStoreV1["historicalCheckpointLifecycleLinkReceipts"]
  >;
  events: LeadershipConversationArtifactStoreV1["events"];
  idempotency: LeadershipConversationArtifactStoreV1["idempotency"];
};
export class ProductWorkflowIncompatibleIdempotencyReplayError extends Error {
  readonly code = "incompatible_idempotency_replay" as const;
  constructor() {
    super("Product Workflow incompatible idempotency replay.");
    this.name = "ProductWorkflowIncompatibleIdempotencyReplayError";
  }
}
export class ProductWorkflowRevisionConflictError extends Error {
  readonly code = "product_workflow_revision_conflict" as const;
  constructor() {
    super("Product Workflow store revision changed.");
    this.name = "ProductWorkflowRevisionConflictError";
  }
}
export class ProductWorkflowRecoveryBlockedError extends Error {
  readonly code = "recovery_blocked" as const;
  constructor() {
    super("Product Workflow recovery is blocked.");
    this.name = "ProductWorkflowRecoveryBlockedError";
  }
}
export interface ProductWorkflowArtifactRepository {
  read(organizationId: string): Promise<ProductWorkflowStoreSnapshot>;
  readOccurrence?(
    input: ProductWorkflowOccurrenceIdentity & {
      idempotencyKeyDigests?: readonly string[];
      proposalKinds?: readonly ProposalKind[];
    },
  ): Promise<ProductWorkflowOccurrenceSlice>;
  mutateOccurrence?(
    input: ProductWorkflowOccurrenceIdentity & {
      expectedRevision: string | null;
      idempotencyKeyDigest: string;
      requestFingerprint: string;
    },
    build: (
      slice: ProductWorkflowOccurrenceSlice,
      sequence: { eventSequence: number; previousEventId: string | null },
    ) => ProductWorkflowOccurrenceMutation,
  ): Promise<{ slice: ProductWorkflowOccurrenceSlice; committed: boolean }>;
  readHistoricalCheckpointLifecycle?(
    input: ProductWorkflowLifecycleIdentity & {
      idempotencyKeyDigests?: readonly string[];
    },
  ): Promise<ProductWorkflowLifecycleSlice>;
  mutateHistoricalCheckpointLifecycle?(
    input: ProductWorkflowLifecycleIdentity & {
      expectedRevision: string | null;
      idempotencyKeyDigest: string;
      requestFingerprint: string;
    },
    build: (
      slice: ProductWorkflowLifecycleSlice,
      sequence: { eventSequence: number; previousEventId: string | null },
    ) => ProductWorkflowLifecycleMutation,
  ): Promise<{ slice: ProductWorkflowLifecycleSlice; committed: boolean }>;
  replace(
    organizationId: string,
    store: LeadershipConversationArtifactStoreV1,
    expectedRevision: string | null,
  ): Promise<ProductWorkflowStoreSnapshot>;
  resetDevelopmentFixture(organizationId: string): Promise<boolean>;
}
class FilesystemProductWorkflowArtifactRepository
  implements ProductWorkflowArtifactRepository
{
  constructor(
    private root: string,
    private defaultRoot: string,
    private readonly faultInjector?: Readonly<{
      afterClaim?(): void;
      afterPublication?(): void;
    }>,
  ) {
    if (!path.isAbsolute(root))
      throw new Error("Product Workflow root must be absolute.");
  }
  private id(value: string) {
    if (!SAFE.test(value))
      throw new Error("Product Workflow organization identifier is invalid.");
    return value;
  }
  private target(id: string) {
    return path.join(this.root, "organizations", `${this.id(id)}.json`);
  }
  private claimTarget(id: string, revision: string | null) {
    return path.join(
      this.root,
      "organizations",
      `${this.id(id)}.${revision ?? "absent"}.claim`,
    );
  }
  private async noLink(target: string) {
    try {
      if ((await lstat(target)).isSymbolicLink())
        throw new Error("Product Workflow storage is unsafe.");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  private async prepare() {
    await this.noLink(this.root);
    await mkdir(path.join(this.root, "organizations"), {
      recursive: true,
      mode: 0o700,
    });
    for (const target of [this.root, path.join(this.root, "organizations")]) {
      await this.noLink(target);
      await chmod(target, 0o700);
    }
    const actual = await realpath(this.root),
      parent = await realpath(path.dirname(this.root));
    if (actual !== path.join(parent, path.basename(this.root)))
      throw new Error("Product Workflow storage is aliased.");
  }
  async read(organizationId: string): Promise<ProductWorkflowStoreSnapshot> {
    await this.prepare();
    const target = this.target(organizationId);
    await this.noLink(target);
    try {
      const status = await lstat(target);
      if (!status.isFile() || (status.mode & 0o777) !== 0o600)
        throw new Error("Product Workflow store integrity failed.");
      const raw = new Uint8Array(await readFile(target));
      const persisted = JSON.parse(
        new TextDecoder().decode(raw),
      ) as LeadershipConversationArtifactStoreV1;
      if (
        persisted.organizationId !== organizationId ||
        persisted.contractVersion !== "1" ||
        !Buffer.from(raw).equals(Buffer.from(bytes(persisted)))
      )
        throw new Error("Product Workflow store integrity failed.");
      assertNoLegacyCombinedBodies(persisted);
      assertGovernedScopeLineage(persisted);
      return {
        store: normalizeLeadershipConversationArtifactStore(persisted),
        revision: leadershipDigest(raw),
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT")
        return { store: empty(organizationId), revision: null };
      throw error;
    }
  }
  private occurrence(
    snapshot: ProductWorkflowStoreSnapshot,
    input: ProductWorkflowOccurrenceIdentity,
    idempotencyKeyDigests: readonly string[] = [],
  ): ProductWorkflowOccurrenceSlice {
    const source = snapshot.store,
      conversation = <T extends { conversationId: string; questionId: string }>(
        values: readonly T[],
      ) =>
        values.filter(
          (value) =>
            value.conversationId === input.conversationId &&
            value.questionId === input.questionId,
        ),
      workflowId = `leadership-conversation:${input.conversationId}`,
      contexts = conversation(source.contexts),
      prepared = (source.preparedWorkPublications ?? []).filter(
        (value) =>
          value.productQuestionId === input.questionId &&
          value.productWorkflowId === workflowId,
      ),
      frozen = (source.frozenSnapshotPublications ?? []).filter(
        (value) =>
          value.productQuestionId === input.questionId &&
          value.productWorkflowId === workflowId,
      ),
      checkpointIds = new Set(frozen.map((value) => value.artifactId)),
      closures = conversation(source.cycle1ClosureCompletions ?? []).filter(
        (value) => value.seriesId === input.seriesId,
      ),
      links = (source.historicalCheckpointLifecycleLinks ?? []).filter(
        (value) => checkpointIds.has(value.checkpointId),
      ),
      linkIds = new Set(links.map((value) => value.linkId)),
      records = new Set<string>([
        ...contexts.map((value) => value.contextVersionId),
        ...prepared.map((value) => value.artifactRevision),
        ...frozen.map((value) => value.artifactId),
        ...closures.map((value) => value.closureId),
        ...links.map((value) => value.linkId),
      ]),
      proposals = conversation(source.proposals),
      proposalIds = new Set(proposals.map((value) => value.proposalId)),
      dispositions = conversation(source.dispositions).filter((value) =>
        proposalIds.has(value.proposalId),
      ),
      dispositionIds = new Set(
        dispositions.map((value) => value.dispositionReceiptId),
      ),
      receipts = conversation(source.canonicalRoutingReceipts).filter(
        (value) =>
          proposalIds.has(value.proposalId) &&
          dispositionIds.has(value.dispositionReceiptId),
      ),
      routes = conversation(source.routingLinks).filter((value) =>
        proposalIds.has(value.proposalId),
      );
    for (const value of proposals) records.add(value.proposalId);
    for (const value of dispositions) records.add(value.dispositionReceiptId);
    for (const value of receipts) records.add(value.receiptDigest);
    for (const value of routes) records.add(value.routingLinkId);
    const events = conversation(source.events),
      eventRefs = new Set(events.map((value) => value.recordRef)),
      keys = new Set(idempotencyKeyDigests),
      idempotency = source.idempotency.filter(
        (value) =>
          keys.has(value.keyDigest) ||
          records.has(value.recordRef) ||
          eventRefs.has(value.recordRef) ||
          linkIds.has(value.recordRef),
      );
    const store: LeadershipConversationArtifactStoreV1 = {
      contractVersion: "1",
      organizationId: input.organizationId,
      contexts,
      preparedWorkProducts: [],
      frozenSnapshots: [],
      preparedWorkPublications: prepared,
      frozenSnapshotPublications: frozen,
      privateWorkingContributionFreezeIntents: (
        source.privateWorkingContributionFreezeIntents ?? []
      ).filter(
        (value) =>
          value.questionId === input.questionId &&
          value.conversationId === input.conversationId,
      ),
      privateWorkingContributionPublications: conversation(
        source.privateWorkingContributionPublications ?? [],
      ).filter((value) => checkpointIds.has(value.snapshotId)),
      privateWorkingContributionReceipts: conversation(
        source.privateWorkingContributionReceipts ?? [],
      ).filter((value) => checkpointIds.has(value.snapshotId)),
      privateWorkingContributionCaptures: conversation(
        source.privateWorkingContributionCaptures ?? [],
      ).filter((value) => checkpointIds.has(value.snapshotId)),
      privateWorkingContributionCaptureReceipts: conversation(
        source.privateWorkingContributionCaptureReceipts ?? [],
      ).filter((value) => checkpointIds.has(value.snapshotId)),
      publicationReceipts: (source.publicationReceipts ?? []).filter(
        (value) =>
          prepared.some(
            (publication) =>
              publication.artifactId === value.artifactId &&
              publication.artifactRevision === value.artifactRevision,
          ) ||
          frozen.some(
            (publication) =>
              publication.artifactId === value.artifactId &&
              publication.artifactRevision === value.artifactRevision,
          ),
      ),
      whatChangedPublications: (source.whatChangedPublications ?? []).filter(
        (value) =>
          value.productQuestionId === input.questionId &&
          value.productWorkflowId === workflowId,
      ),
      cycle1ClosureCompletions: closures,
      uploadReceipts: conversation(source.uploadReceipts),
      proposals,
      dispositions,
      canonicalRoutingReceipts: receipts,
      routingLinks: routes,
      changeLinks: [],
      futurePreparationLinks: conversation(source.futurePreparationLinks),
      productMaterializations: (source.productMaterializations ?? []).filter(
        (value) =>
          value.questionId === input.questionId &&
          value.conversationId === input.conversationId,
      ),
      productMaterializationReceipts: [],
      historicalCheckpointLifecycleLinks: links,
      historicalCheckpointLifecycleLinkReceipts: (
        source.historicalCheckpointLifecycleLinkReceipts ?? []
      ).filter((value) => linkIds.has(value.linkId)),
      events,
      idempotency,
      storeDigest: "",
    };
    return {
      contractVersion: "1",
      identity: structuredClone(input),
      storeRevision: snapshot.revision,
      storeIntegrityRef: leadershipDigest(
        leadershipStableSerialize({
          organizationId: input.organizationId,
          revision: snapshot.revision,
        }),
      ),
      store,
      internalWholeFileReads: snapshot.revision === null ? 0 : 1,
      internalWholeFileParses: snapshot.revision === null ? 0 : 1,
    };
  }
  async readOccurrence(
    input: ProductWorkflowOccurrenceIdentity & {
      idempotencyKeyDigests?: readonly string[];
      proposalKinds?: readonly ProposalKind[];
    },
  ) {
    const snapshot = await this.read(input.organizationId),
      slice = this.occurrence(snapshot, input, input.idempotencyKeyDigests);
    if (!input.proposalKinds) return slice;
    const allowed = new Set(input.proposalKinds),
      proposals = slice.store.proposals.filter((value) =>
        allowed.has(value.kind),
      ),
      proposalIds = new Set(proposals.map((value) => value.proposalId)),
      dispositions = slice.store.dispositions.filter((value) =>
        proposalIds.has(value.proposalId),
      ),
      dispositionIds = new Set(
        dispositions.map((value) => value.dispositionReceiptId),
      );
    return {
      ...slice,
      store: {
        ...slice.store,
        proposals,
        dispositions,
        canonicalRoutingReceipts: slice.store.canonicalRoutingReceipts.filter(
          (value) =>
            proposalIds.has(value.proposalId) &&
            dispositionIds.has(value.dispositionReceiptId),
        ),
        routingLinks: slice.store.routingLinks.filter((value) =>
          proposalIds.has(value.proposalId),
        ),
      },
    };
  }
  async mutateOccurrence(
    input: ProductWorkflowOccurrenceIdentity & {
      expectedRevision: string | null;
      idempotencyKeyDigest: string;
      requestFingerprint: string;
    },
    build: (
      slice: ProductWorkflowOccurrenceSlice,
      sequence: { eventSequence: number; previousEventId: string | null },
    ) => ProductWorkflowOccurrenceMutation,
  ) {
    const current = await this.read(input.organizationId),
      prior = current.store.idempotency.find(
        (value) => value.keyDigest === input.idempotencyKeyDigest,
      );
    if (prior) {
      if (prior.requestFingerprint !== input.requestFingerprint)
        throw new ProductWorkflowIncompatibleIdempotencyReplayError();
      return {
        slice: this.occurrence(current, input, [input.idempotencyKeyDigest]),
        committed: false,
      };
    }
    if (current.revision !== input.expectedRevision)
      throw new ProductWorkflowRevisionConflictError();
    const slice = this.occurrence(current, input, [input.idempotencyKeyDigest]),
      questionEvents = current.store.events.filter(
        (value) => value.questionId === input.questionId,
      ),
      mutation = build(slice, {
        eventSequence: questionEvents.length + 1,
        previousEventId: questionEvents.at(-1)?.eventId ?? null,
      }),
      next = structuredClone(current.store);
    next.cycle1ClosureCompletions ??= [];
    next.cycle1ClosureCompletions.push(
      ...(mutation.cycle1ClosureCompletions ?? []),
    );
    next.events.push(...(mutation.events ?? []));
    next.idempotency.push(...(mutation.idempotency ?? []));
    const committed = await this.replaceBound(
      input.organizationId,
      next,
      current.revision,
      input.requestFingerprint,
    );
    return {
      slice: this.occurrence(committed, input, [input.idempotencyKeyDigest]),
      committed: true,
    };
  }
  private lifecycle(
    snapshot: ProductWorkflowStoreSnapshot,
    input: ProductWorkflowLifecycleIdentity,
    idempotencyKeyDigests: readonly string[] = [],
  ): ProductWorkflowLifecycleSlice {
    const workflowId = `leadership-conversation:${input.conversationId}`,
      checkpointPublication =
        (snapshot.store.frozenSnapshotPublications ?? []).find(
          (value) =>
            value.productQuestionId === input.questionId &&
            value.productWorkflowId === workflowId &&
            value.artifactId === input.checkpointId &&
            value.artifactRevision === input.checkpointRevision,
        ) ?? null,
      links = (snapshot.store.historicalCheckpointLifecycleLinks ?? []).filter(
        (value) =>
          value.productQuestionId === input.questionId &&
          value.productWorkflowId === workflowId &&
          value.checkpointId === input.checkpointId &&
          value.checkpointRevision === input.checkpointRevision,
      ),
      linkIds = new Set(links.map((value) => value.linkId)),
      keys = new Set(idempotencyKeyDigests),
      idempotency = snapshot.store.idempotency.filter(
        (value) => keys.has(value.keyDigest) || linkIds.has(value.recordRef),
      );
    return {
      contractVersion: "1",
      identity: structuredClone(input),
      storeRevision: snapshot.revision,
      checkpointPublication: checkpointPublication
        ? structuredClone(checkpointPublication)
        : null,
      links: structuredClone(links),
      receipts: structuredClone(
        (snapshot.store.historicalCheckpointLifecycleLinkReceipts ?? []).filter(
          (value) => linkIds.has(value.linkId),
        ),
      ),
      idempotency: structuredClone(idempotency),
    };
  }
  async readHistoricalCheckpointLifecycle(
    input: ProductWorkflowLifecycleIdentity & {
      idempotencyKeyDigests?: readonly string[];
    },
  ) {
    return this.lifecycle(
      await this.read(input.organizationId),
      input,
      input.idempotencyKeyDigests,
    );
  }
  async mutateHistoricalCheckpointLifecycle(
    input: ProductWorkflowLifecycleIdentity & {
      expectedRevision: string | null;
      idempotencyKeyDigest: string;
      requestFingerprint: string;
    },
    build: (
      slice: ProductWorkflowLifecycleSlice,
      sequence: { eventSequence: number; previousEventId: string | null },
    ) => ProductWorkflowLifecycleMutation,
  ) {
    const current = await this.read(input.organizationId),
      slice = this.lifecycle(current, input, [input.idempotencyKeyDigest]),
      prior = slice.idempotency.find(
        (value) => value.keyDigest === input.idempotencyKeyDigest,
      );
    if (prior) {
      if (prior.requestFingerprint !== input.requestFingerprint)
        throw new ProductWorkflowIncompatibleIdempotencyReplayError();
      return { slice, committed: false };
    }
    if (current.revision !== input.expectedRevision)
      throw new ProductWorkflowRevisionConflictError();
    const questionEvents = current.store.events.filter(
        (value) => value.questionId === input.questionId,
      ),
      mutation = build(slice, {
        eventSequence: questionEvents.length + 1,
        previousEventId: questionEvents.at(-1)?.eventId ?? null,
      }),
      next = structuredClone(current.store);
    next.historicalCheckpointLifecycleLinks ??= [];
    next.historicalCheckpointLifecycleLinkReceipts ??= [];
    if (
      mutation.links.some((value) =>
        next.historicalCheckpointLifecycleLinks!.some(
          (existing) => existing.linkId === value.linkId,
        ),
      ) ||
      mutation.receipts.some((value) =>
        next.historicalCheckpointLifecycleLinkReceipts!.some(
          (existing) => existing.receiptId === value.receiptId,
        ),
      ) ||
      mutation.events.some((value) =>
        next.events.some((existing) => existing.eventId === value.eventId),
      )
    )
      throw new Error("Historical checkpoint lifecycle identity collision.");
    next.historicalCheckpointLifecycleLinks.push(...mutation.links);
    next.historicalCheckpointLifecycleLinkReceipts.push(...mutation.receipts);
    next.events.push(...mutation.events);
    next.idempotency.push(...mutation.idempotency);
    const committed = await this.replaceBound(
      input.organizationId,
      next,
      current.revision,
      input.requestFingerprint,
    );
    return {
      slice: this.lifecycle(committed, input, [input.idempotencyKeyDigest]),
      committed: true,
    };
  }
  private async workflowClaim(target: string, organizationId: string) {
    const status = await lstat(target);
    if (
      !status.isFile() ||
      status.isSymbolicLink() ||
      (status.mode & 0o777) !== 0o600
    )
      throw new ProductWorkflowRecoveryBlockedError();
    let value: Record<string, unknown>;
    try {
      value = JSON.parse(await readFile(target, "utf8")) as Record<
        string,
        unknown
      >;
    } catch {
      throw new ProductWorkflowRecoveryBlockedError();
    }
    if (
      Object.keys(value).sort().join(",") !==
      "candidate,contractVersion,expectedRevision,integrityDigest,intendedDigest,organizationId,requestFingerprint"
    )
      throw new ProductWorkflowRecoveryBlockedError();
    if (
      value.contractVersion !== "1" ||
      value.organizationId !== organizationId ||
      !(
        value.expectedRevision === null ||
        (typeof value.expectedRevision === "string" &&
          /^[a-f0-9]{64}$/.test(value.expectedRevision))
      ) ||
      typeof value.intendedDigest !== "string" ||
      !/^[a-f0-9]{64}$/.test(value.intendedDigest) ||
      typeof value.requestFingerprint !== "string" ||
      !/^[a-f0-9]{64}$/.test(value.requestFingerprint) ||
      typeof value.candidate !== "string" ||
      path.basename(value.candidate) !== value.candidate ||
      typeof value.integrityDigest !== "string"
    )
      throw new ProductWorkflowRecoveryBlockedError();
    const { integrityDigest, ...unsigned } = value;
    if (
      integrityDigest !== leadershipDigest(leadershipStableSerialize(unsigned))
    )
      throw new ProductWorkflowRecoveryBlockedError();
    return value as {
      contractVersion: "1";
      organizationId: string;
      expectedRevision: string | null;
      requestFingerprint: string;
      intendedDigest: string;
      candidate: string;
      integrityDigest: string;
    };
  }
  private acknowledgementTarget(
    organizationId: string,
    requestFingerprint: string,
  ) {
    return path.join(
      this.root,
      "organizations",
      ".operations",
      this.id(organizationId),
      `${requestFingerprint}.json`,
    );
  }
  private conflictTarget(organizationId: string, requestFingerprint: string) {
    return path.join(
      this.root,
      "organizations",
      ".operations",
      this.id(organizationId),
      `${requestFingerprint}.conflict.json`,
    );
  }
  private async readConflict(
    organizationId: string,
    requestFingerprint: string,
  ) {
    const target = this.conflictTarget(organizationId, requestFingerprint);
    try {
      const status = await lstat(target);
      if (
        !status.isFile() ||
        status.isSymbolicLink() ||
        (status.mode & 0o777) !== 0o600
      )
        throw new ProductWorkflowRecoveryBlockedError();
      const value = JSON.parse(await readFile(target, "utf8")) as Record<
        string,
        unknown
      >;
      if (
        Object.keys(value).sort().join(",") !==
          "contractVersion,disposition,expectedRevision,integrityDigest,intendedDigest,organizationId,requestFingerprint,resultingRevision" ||
        value.contractVersion !== "1" ||
        value.organizationId !== organizationId ||
        value.requestFingerprint !== requestFingerprint ||
        value.disposition !== "cas-conflict" ||
        !(
          value.expectedRevision === null ||
          (typeof value.expectedRevision === "string" &&
            /^[a-f0-9]{64}$/.test(value.expectedRevision))
        ) ||
        typeof value.intendedDigest !== "string" ||
        !/^[a-f0-9]{64}$/.test(value.intendedDigest) ||
        typeof value.resultingRevision !== "string" ||
        !/^[a-f0-9]{64}$/.test(value.resultingRevision)
      )
        throw new ProductWorkflowRecoveryBlockedError();
      const { integrityDigest, ...unsigned } = value;
      if (
        integrityDigest !==
        leadershipDigest(leadershipStableSerialize(unsigned))
      )
        throw new ProductWorkflowRecoveryBlockedError();
      return value;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }
  private async recordConflictAndRetire(
    claimTarget: string,
    claim: {
      organizationId: string;
      expectedRevision: string | null;
      requestFingerprint: string;
      intendedDigest: string;
      candidate: string;
    },
    resultingRevision: string,
  ) {
    const target = this.conflictTarget(
      claim.organizationId,
      claim.requestFingerprint,
    );
    await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
    const unsigned = {
        contractVersion: "1" as const,
        organizationId: claim.organizationId,
        expectedRevision: claim.expectedRevision,
        requestFingerprint: claim.requestFingerprint,
        intendedDigest: claim.intendedDigest,
        resultingRevision,
        disposition: "cas-conflict" as const,
      },
      complete = {
        ...unsigned,
        integrityDigest: leadershipDigest(leadershipStableSerialize(unsigned)),
      },
      candidate = `${target}.${complete.integrityDigest}.candidate`,
      handle = await open(
        candidate,
        constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY,
        0o600,
      ).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "EEXIST") throw error;
        return null;
      });
    if (handle) {
      try {
        await handle.writeFile(leadershipStableSerialize(complete));
        await handle.sync();
      } finally {
        await handle.close();
      }
    }
    try {
      await link(candidate, target);
    } catch (error) {
      if (
        !["EEXIST", "ENOENT"].includes(
          (error as NodeJS.ErrnoException).code ?? "",
        )
      )
        throw error;
    }
    const terminal = await this.readConflict(
      claim.organizationId,
      claim.requestFingerprint,
    );
    if (
      !terminal ||
      terminal.expectedRevision !== claim.expectedRevision ||
      terminal.intendedDigest !== claim.intendedDigest ||
      terminal.resultingRevision !== resultingRevision ||
      terminal.disposition !== "cas-conflict"
    )
      throw new ProductWorkflowRecoveryBlockedError();
    const operationDirectory = await open(
      path.dirname(target),
      constants.O_RDONLY,
    );
    try {
      await operationDirectory.sync();
    } finally {
      await operationDirectory.close();
    }
    for (const residue of [
      path.join(
        path.dirname(this.target(claim.organizationId)),
        claim.candidate,
      ),
      path.join(
        path.dirname(this.target(claim.organizationId)),
        `${claim.candidate}.intent`,
      ),
      claimTarget,
      candidate,
    ])
      await unlink(residue).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
      });
    const directory = await open(
      path.dirname(this.target(claim.organizationId)),
      constants.O_RDONLY,
    );
    try {
      await directory.sync();
    } finally {
      await directory.close();
    }
  }
  private async readAcknowledgement(
    organizationId: string,
    requestFingerprint: string,
  ) {
    const target = this.acknowledgementTarget(
      organizationId,
      requestFingerprint,
    );
    try {
      const status = await lstat(target);
      if (
        !status.isFile() ||
        status.isSymbolicLink() ||
        (status.mode & 0o777) !== 0o600
      )
        throw new ProductWorkflowRecoveryBlockedError();
      const value = JSON.parse(await readFile(target, "utf8")) as Record<
        string,
        unknown
      >;
      if (
        Object.keys(value).sort().join(",") !==
          "contractVersion,expectedRevision,integrityDigest,intendedDigest,organizationId,requestFingerprint,resultingRevision" ||
        value.contractVersion !== "1" ||
        value.organizationId !== organizationId ||
        value.requestFingerprint !== requestFingerprint ||
        !(
          value.expectedRevision === null ||
          (typeof value.expectedRevision === "string" &&
            /^[a-f0-9]{64}$/.test(value.expectedRevision))
        ) ||
        typeof value.intendedDigest !== "string" ||
        !/^[a-f0-9]{64}$/.test(value.intendedDigest) ||
        typeof value.resultingRevision !== "string" ||
        !/^[a-f0-9]{64}$/.test(value.resultingRevision)
      )
        throw new ProductWorkflowRecoveryBlockedError();
      const { integrityDigest, ...unsigned } = value;
      if (
        integrityDigest !==
        leadershipDigest(leadershipStableSerialize(unsigned))
      )
        throw new ProductWorkflowRecoveryBlockedError();
      return value as {
        contractVersion: "1";
        organizationId: string;
        expectedRevision: string | null;
        requestFingerprint: string;
        intendedDigest: string;
        resultingRevision: string;
        integrityDigest: string;
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }
  private async acknowledgeAndRetire(
    claimTarget: string,
    claim: {
      organizationId: string;
      expectedRevision: string | null;
      requestFingerprint: string;
      intendedDigest: string;
      candidate: string;
    },
    result: ProductWorkflowStoreSnapshot,
  ) {
    if (!result.revision) throw new ProductWorkflowRecoveryBlockedError();
    const target = this.acknowledgementTarget(
      claim.organizationId,
      claim.requestFingerprint,
    );
    await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
    const unsigned = {
        contractVersion: "1" as const,
        organizationId: claim.organizationId,
        expectedRevision: claim.expectedRevision,
        requestFingerprint: claim.requestFingerprint,
        intendedDigest: claim.intendedDigest,
        resultingRevision: result.revision,
      },
      complete = {
        ...unsigned,
        integrityDigest: leadershipDigest(leadershipStableSerialize(unsigned)),
      },
      candidate = `${target}.${complete.integrityDigest}.candidate`,
      handle = await open(
        candidate,
        constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY,
        0o600,
      ).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "EEXIST") throw error;
        return null;
      });
    if (handle) {
      try {
        await handle.writeFile(leadershipStableSerialize(complete));
        await handle.sync();
      } finally {
        await handle.close();
      }
    }
    try {
      await link(candidate, target);
    } catch (error) {
      if (
        !["EEXIST", "ENOENT"].includes(
          (error as NodeJS.ErrnoException).code ?? "",
        )
      )
        throw error;
    }
    const existing = await this.readAcknowledgement(
      claim.organizationId,
      claim.requestFingerprint,
    );
    if (
      !existing ||
      existing.resultingRevision !== result.revision ||
      existing.intendedDigest !== claim.intendedDigest
    )
      throw new ProductWorkflowRecoveryBlockedError();
    for (const item of [
      path.join(
        path.dirname(this.target(claim.organizationId)),
        claim.candidate,
      ),
      path.join(
        path.dirname(this.target(claim.organizationId)),
        `${claim.candidate}.intent`,
      ),
      claimTarget,
      `${this.target(claim.organizationId)}.${claim.intendedDigest}.publication`,
      candidate,
    ])
      await unlink(item).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
      });
    const directory = await open(
      path.dirname(this.target(claim.organizationId)),
      constants.O_RDONLY,
    );
    try {
      await directory.sync();
    } finally {
      await directory.close();
    }
  }
  async replace(
    organizationId: string,
    store: LeadershipConversationArtifactStoreV1,
    expectedRevision: string | null,
  ) {
    const normalized = normalizeLeadershipConversationArtifactStore(store),
      intendedDigest = leadershipDigest(bytes(normalized)),
      requestFingerprint = leadershipDigest(
        leadershipStableSerialize([
          "product-workflow-replace-v1",
          organizationId,
          expectedRevision,
          intendedDigest,
        ]),
      );
    return this.replaceBound(
      organizationId,
      normalized,
      expectedRevision,
      requestFingerprint,
    );
  }
  private async replaceBound(
    organizationId: string,
    store: LeadershipConversationArtifactStoreV1,
    expectedRevision: string | null,
    requestFingerprint: string,
  ) {
    if (store.organizationId !== organizationId)
      throw new Error("Product Workflow store organization mismatch.");
    await this.prepare();
    assertNoLegacyCombinedBodies(store);
    assertGovernedScopeLineage(store);
    const target = this.target(organizationId),
      next = bytes(normalizeLeadershipConversationArtifactStore(store)),
      intendedDigest = leadershipDigest(next),
      terminalConflict = await this.readConflict(
        organizationId,
        requestFingerprint,
      );
    if (terminalConflict) throw new ProductWorkflowRevisionConflictError();
    const prior = await this.readAcknowledgement(
      organizationId,
      requestFingerprint,
    );
    if (prior) {
      if (
        prior.expectedRevision !== expectedRevision ||
        prior.intendedDigest !== intendedDigest
      )
        throw new ProductWorkflowIncompatibleIdempotencyReplayError();
      const replayed = await this.read(organizationId);
      if (replayed.revision !== prior.resultingRevision)
        throw new ProductWorkflowRecoveryBlockedError();
      return replayed;
    }
    const candidate = path.basename(
        `${target}.${intendedDigest}.${requestFingerprint}.candidate`,
      ),
      candidateTarget = path.join(path.dirname(target), candidate),
      cleanupOwn = async () => {
        for (const residue of [candidateTarget, `${candidateTarget}.intent`])
          await unlink(residue).catch((error: NodeJS.ErrnoException) => {
            if (error.code !== "ENOENT") throw error;
          });
        const directory = await open(path.dirname(target), constants.O_RDONLY);
        try {
          await directory.sync();
        } finally {
          await directory.close();
        }
      };
    const candidateHandle = await open(
      candidateTarget,
      constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY,
      0o600,
    ).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "EEXIST") throw error;
      return null;
    });
    if (candidateHandle) {
      try {
        await candidateHandle.writeFile(next);
        await candidateHandle.sync();
      } finally {
        await candidateHandle.close();
      }
    }
    const unsigned = {
        contractVersion: "1" as const,
        organizationId,
        expectedRevision,
        requestFingerprint,
        intendedDigest,
        candidate,
      },
      claim = {
        ...unsigned,
        integrityDigest: leadershipDigest(leadershipStableSerialize(unsigned)),
      },
      intentTarget = `${candidateTarget}.intent`,
      intentHandle = await open(
        intentTarget,
        constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY,
        0o600,
      ).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "EEXIST") throw error;
        return null;
      });
    if (intentHandle) {
      try {
        await intentHandle.writeFile(leadershipStableSerialize(claim));
        await intentHandle.sync();
      } finally {
        await intentHandle.close();
      }
    }
    const claimTarget = this.claimTarget(organizationId, expectedRevision);
    try {
      await link(intentTarget, claimTarget);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }
    this.faultInjector?.afterClaim?.();
    let winner: Awaited<
      ReturnType<FilesystemProductWorkflowArtifactRepository["workflowClaim"]>
    >;
    try {
      winner = await this.workflowClaim(claimTarget, organizationId);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const conflict = await this.readConflict(
        organizationId,
        requestFingerprint,
      );
      if (conflict) {
        await cleanupOwn();
        throw new ProductWorkflowRevisionConflictError();
      }
      const completed = await this.readAcknowledgement(
          organizationId,
          requestFingerprint,
        ),
        current = await this.read(organizationId);
      if (
        completed &&
        current.revision === completed.resultingRevision &&
        completed.intendedDigest === intendedDigest
      ) {
        await cleanupOwn();
        return current;
      }
      const own = await this.workflowClaim(intentTarget, organizationId);
      if (current.revision && current.revision !== own.expectedRevision) {
        await this.recordConflictAndRetire(claimTarget, own, current.revision);
        throw new ProductWorkflowRevisionConflictError();
      }
      throw new ProductWorkflowRecoveryBlockedError();
    }
    const winnerCandidate = path.join(path.dirname(target), winner.candidate),
      winnerStatus = await lstat(winnerCandidate);
    if (
      !winnerStatus.isFile() ||
      winnerStatus.isSymbolicLink() ||
      (winnerStatus.mode & 0o777) !== 0o600
    )
      throw new ProductWorkflowRecoveryBlockedError();
    const winnerBytes = new Uint8Array(await readFile(winnerCandidate));
    if (leadershipDigest(winnerBytes) !== winner.intendedDigest)
      throw new ProductWorkflowRecoveryBlockedError();
    let current = await this.read(organizationId);
    if (current.revision !== winner.intendedDigest) {
      if (current.revision !== winner.expectedRevision) {
        if (!current.revision) throw new ProductWorkflowRecoveryBlockedError();
        await this.recordConflictAndRetire(
          claimTarget,
          winner,
          current.revision,
        );
        throw new ProductWorkflowRevisionConflictError();
      }
      const publication = `${target}.${winner.intendedDigest}.publication`,
        publicationHandle = await open(
          publication,
          constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY,
          0o600,
        ).catch((error: NodeJS.ErrnoException) => {
          if (error.code !== "EEXIST") throw error;
          return null;
        });
      if (publicationHandle) {
        try {
          await publicationHandle.writeFile(winnerBytes);
          await publicationHandle.sync();
        } finally {
          await publicationHandle.close();
        }
      }
      try {
        const publicationBytes = new Uint8Array(await readFile(publication));
        if (leadershipDigest(publicationBytes) !== winner.intendedDigest)
          throw new ProductWorkflowRecoveryBlockedError();
        const rechecked = await this.read(organizationId);
        if (rechecked.revision !== winner.intendedDigest) {
          if (rechecked.revision !== winner.expectedRevision) {
            if (!rechecked.revision)
              throw new ProductWorkflowRecoveryBlockedError();
            await this.recordConflictAndRetire(
              claimTarget,
              winner,
              rechecked.revision,
            );
            throw new ProductWorkflowRevisionConflictError();
          }
          await rename(publication, target);
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        const completed = await this.read(organizationId);
        if (completed.revision !== winner.intendedDigest)
          throw new ProductWorkflowRecoveryBlockedError();
      }
      const directory = await open(path.dirname(target), constants.O_RDONLY);
      try {
        await directory.sync();
      } finally {
        await directory.close();
      }
      current = await this.read(organizationId);
    }
    if (current.revision !== winner.intendedDigest)
      throw new ProductWorkflowRecoveryBlockedError();
    this.faultInjector?.afterPublication?.();
    await this.acknowledgeAndRetire(claimTarget, winner, current);
    if (
      winner.requestFingerprint !== requestFingerprint ||
      winner.intendedDigest !== intendedDigest
    ) {
      await cleanupOwn();
      throw new ProductWorkflowRevisionConflictError();
    }
    return current;
  }
  async resetDevelopmentFixture(organizationId: string) {
    if (path.resolve(this.root) === path.resolve(this.defaultRoot))
      throw new Error("Product Workflow reset refused.");
    await this.noLink(this.root);
    const actual = await realpath(this.root),
      temporary = await realpath(tmpdir());
    if (
      !actual.startsWith(`${temporary}${path.sep}`) ||
      !path.basename(actual).startsWith("discovery-leadership-conversation-")
    )
      throw new Error("Product Workflow reset refused.");
    try {
      await rm(this.target(organizationId));
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
      throw error;
    }
  }
}
export function createProductWorkflowArtifactRepository(input: {
  root: string;
  environment: "development" | "sandbox" | "test";
  defaultRoot?: string;
  faultInjector?: Readonly<{
    afterClaim?(): void;
    afterPublication?(): void;
  }>;
}): ProductWorkflowArtifactRepository &
  Required<
    Pick<
      ProductWorkflowArtifactRepository,
      | "readHistoricalCheckpointLifecycle"
      | "mutateHistoricalCheckpointLifecycle"
    >
  > {
  if (!["development", "sandbox", "test"].includes(input.environment))
    throw new Error(
      "Product Workflow persistence is unavailable outside development.",
    );
  return new FilesystemProductWorkflowArtifactRepository(
    path.resolve(input.root),
    path.resolve(
      input.defaultRoot ??
        path.join(process.cwd(), ".discovery-runtime/product-workflow"),
    ),
    input.faultInjector,
  );
}
