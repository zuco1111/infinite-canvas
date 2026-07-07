export { localAgentFeatureManifest } from './manifest';
export { CanvasLocalAgentPanel } from './components/canvas-local-agent-panel';
export {
  useLocalAgentActivity,
  useLocalAgentConfirmTools,
  useLocalAgentConnected,
  useLocalAgentEnabled,
  useSetLocalAgentState,
} from './hooks/use-local-agent-ports';
export {
  type AgentAttachment,
  type AgentChatItem,
  type AgentEventLog,
  type AgentPendingToolCall,
  type AgentThreadSummary,
} from './stores/use-canvas-agent-store';
