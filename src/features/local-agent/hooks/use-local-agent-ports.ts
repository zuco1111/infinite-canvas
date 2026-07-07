'use client';

import { useCanvasAgentStore } from '../stores/use-canvas-agent-store';

export function useLocalAgentConnected() {
  return useCanvasAgentStore((state) => state.connected);
}

export function useLocalAgentActivity() {
  return useCanvasAgentStore((state) => state.activity);
}

export function useLocalAgentEnabled() {
  return useCanvasAgentStore((state) => state.enabled);
}

export function useLocalAgentConfirmTools() {
  return useCanvasAgentStore((state) => state.confirmTools);
}

export function useSetLocalAgentState() {
  return useCanvasAgentStore((state) => state.setAgentState);
}
