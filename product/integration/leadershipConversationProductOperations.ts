import type { LeadershipConversationOperationsDependencies } from "../workflow/leadershipConversation";
import { LeadershipConversationProductOperations } from "../workflow/leadershipConversation";
export function createLeadershipConversationProductOperations(dependencies:LeadershipConversationOperationsDependencies){return new LeadershipConversationProductOperations(dependencies);}
