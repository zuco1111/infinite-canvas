'use client';

import {
  CANVAS_AGENT_PANEL_MOTION_MS,
  CanvasAssistantPanel,
  type CanvasAgentMode,
} from '@/features/assistant';
import { CanvasLocalAgentPanel } from '@/features/local-agent';
import type { CanvasAgentOp, CanvasAgentSnapshot } from '../../utils/canvas-agent-ops';
import type { CanvasAssistantSession, CanvasNodeData } from '../../types';

export { CANVAS_AGENT_PANEL_MOTION_MS };

type CanvasAgentDockProps = {
  codexCompactAgent: boolean;
  assistantMounted: boolean;
  agentSnapshot: CanvasAgentSnapshot;
  canUndoAgentOps: boolean;
  applyAgentOps: (ops?: CanvasAgentOp[]) => CanvasAgentSnapshot;
  undoAgentOps: () => CanvasAgentSnapshot | null;
  codexAutoConnect: boolean;
  nodes: CanvasNodeData[];
  selectedNodeIds: Set<string>;
  chatSessions: CanvasAssistantSession[];
  activeChatId: string | null;
  onSelectNodeIds: (ids: Set<string>) => void;
  onAssistantSessionsChange: (
    sessions: CanvasAssistantSession[],
    activeSessionId: string | null,
  ) => void;
  onPasteAssistantImage: (file: File) => void;
  agentMode: CanvasAgentMode;
  onAgentModeChange: (mode: CanvasAgentMode) => void;
  assistantClosing: boolean;
  onCollapse: () => void;
};

export function CanvasAgentDock({
  codexCompactAgent,
  assistantMounted,
  agentSnapshot,
  canUndoAgentOps,
  applyAgentOps,
  undoAgentOps,
  codexAutoConnect,
  nodes,
  selectedNodeIds,
  chatSessions,
  activeChatId,
  onSelectNodeIds,
  onAssistantSessionsChange,
  onPasteAssistantImage,
  agentMode,
  onAgentModeChange,
  assistantClosing,
  onCollapse,
}: CanvasAgentDockProps) {
  return (
    <>
      {codexCompactAgent && !assistantMounted ? (
        <CanvasLocalAgentPanel
          headless
          snapshot={agentSnapshot}
          canUndoOps={canUndoAgentOps}
          onApplyOps={applyAgentOps}
          onUndoOps={undoAgentOps}
          autoConnect={codexAutoConnect}
        />
      ) : null}
      {assistantMounted ? (
        <CanvasAssistantPanel
          nodes={nodes}
          selectedNodeIds={selectedNodeIds}
          snapshot={agentSnapshot}
          sessions={chatSessions}
          activeSessionId={activeChatId}
          onSelectNodeIds={onSelectNodeIds}
          onSessionsChange={onAssistantSessionsChange}
          onApplyOps={applyAgentOps}
          canUndoOps={canUndoAgentOps}
          onUndoOps={undoAgentOps}
          onPasteImage={onPasteAssistantImage}
          agentMode={agentMode}
          onAgentModeChange={onAgentModeChange}
          autoConnectLocal={codexAutoConnect}
          closing={assistantClosing}
          onCollapse={onCollapse}
        />
      ) : null}
    </>
  );
}
