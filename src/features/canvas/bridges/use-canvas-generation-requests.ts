'use client';

import { useCallback, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { ModalFuncProps } from 'antd';

import { NODE_STATUS_IDLE, NODE_STATUS_LOADING } from '../domain/canvas-workspace-helpers';
import type { CanvasNodeData } from '../types';

type CanvasGenerationRequest = {
  targetNodeId: string;
  originNodeId: string;
  runningNodeId: string;
  controller: AbortController;
};

type CanvasGenerationRequestControllerOptions = {
  modal: { confirm: (config: ModalFuncProps) => unknown };
  setNodes: Dispatch<SetStateAction<CanvasNodeData[]>>;
  setRunningNodeId: Dispatch<SetStateAction<string | null>>;
};

export function useCanvasGenerationRequests({
  modal,
  setNodes,
  setRunningNodeId,
}: CanvasGenerationRequestControllerOptions) {
  const generationRequestsRef = useRef(new Map<string, CanvasGenerationRequest>());

  const startGenerationRequest = useCallback(
    (
      targetNodeId: string,
      originNodeId: string,
      runningId = originNodeId,
      controller = new AbortController(),
    ) => {
      const previous = generationRequestsRef.current.get(targetNodeId);
      if (previous?.controller !== controller) previous?.controller.abort();
      generationRequestsRef.current.set(targetNodeId, {
        targetNodeId,
        originNodeId,
        runningNodeId: runningId,
        controller,
      });
      return controller;
    },
    [],
  );

  const finishGenerationRequest = useCallback(
    (targetNodeId: string, controller: AbortController) => {
      const request = generationRequestsRef.current.get(targetNodeId);
      if (request?.controller === controller) generationRequestsRef.current.delete(targetNodeId);
    },
    [],
  );

  const stopGenerationByRunningId = useCallback(
    (runningId: string) => {
      const affectedNodeIds = new Set<string>();
      generationRequestsRef.current.forEach((request) => {
        if (request.runningNodeId !== runningId) return;
        request.controller.abort();
        generationRequestsRef.current.delete(request.targetNodeId);
        affectedNodeIds.add(request.targetNodeId);
        affectedNodeIds.add(request.originNodeId);
      });
      setRunningNodeId((current) => (current === runningId ? null : current));
      if (!affectedNodeIds.size) return;
      setNodes((prev) =>
        prev.map((node) =>
          affectedNodeIds.has(node.id) && node.metadata?.status === NODE_STATUS_LOADING
            ? {
                ...node,
                metadata: { ...node.metadata, status: NODE_STATUS_IDLE, errorDetails: undefined },
              }
            : node,
        ),
      );
    },
    [setNodes, setRunningNodeId],
  );

  const confirmStopGeneration = useCallback(
    (nodeId: string) => {
      modal.confirm({
        title: '停止生成？',
        content: '当前生成请求会被中断，已经生成完成的内容会保留。',
        okText: '停止',
        cancelText: '继续生成',
        okButtonProps: { danger: true },
        onOk: () => stopGenerationByRunningId(nodeId),
      });
    },
    [modal, stopGenerationByRunningId],
  );

  return {
    generationRequestsRef,
    startGenerationRequest,
    finishGenerationRequest,
    stopGenerationByRunningId,
    confirmStopGeneration,
  };
}
