'use client';

import type { ChangeEvent, RefObject } from 'react';
import { Button, Modal } from 'antd';

import { AssetPickerModal, type InsertAssetPayload } from '@/features/assets';
import { CanvasNodeAngleDialog, type CanvasImageAngleParams } from '../canvas-node-angle-dialog';
import { CanvasNodeCropDialog, type CanvasImageCropRect } from '../canvas-node-crop-dialog';
import {
  CanvasNodeMaskEditDialog,
  type CanvasImageMaskEditPayload,
} from '../canvas-node-mask-edit-dialog';
import { CanvasNodeSplitDialog, type CanvasImageSplitParams } from '../canvas-node-split-dialog';
import {
  CanvasNodeUpscaleDialog,
  type CanvasImageUpscaleParams,
} from '../canvas-node-upscale-dialog';
import { CanvasNodeInfoModal } from '../canvas-node-hover-toolbar';
import type { CanvasNodeData } from '../../types';

type CanvasOverlaysProps = {
  imageInputRef: RefObject<HTMLInputElement>;
  onImageInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  infoNode: CanvasNodeData | null;
  cropNode: CanvasNodeData | null;
  maskEditNode: CanvasNodeData | null;
  splitNode: CanvasNodeData | null;
  upscaleNode: CanvasNodeData | null;
  superResolveNode: CanvasNodeData | null;
  angleNode: CanvasNodeData | null;
  previewNode: CanvasNodeData | null;
  clearConfirmOpen: boolean;
  assetPickerOpen: boolean;
  onInfoClose: () => void;
  onCropClose: () => void;
  onCropConfirm: (node: CanvasNodeData, crop: CanvasImageCropRect) => void;
  onMaskEditClose: () => void;
  onMaskEditConfirm: (node: CanvasNodeData, payload: CanvasImageMaskEditPayload) => void;
  onSplitClose: () => void;
  onSplitConfirm: (node: CanvasNodeData, params: CanvasImageSplitParams) => void;
  onUpscaleClose: () => void;
  onUpscaleConfirm: (node: CanvasNodeData, params: CanvasImageUpscaleParams) => void;
  onSuperResolveClose: () => void;
  onAngleClose: () => void;
  onAngleConfirm: (node: CanvasNodeData, params: CanvasImageAngleParams) => void;
  onPreviewClose: () => void;
  onClearClose: () => void;
  onClearConfirm: () => void;
  onAssetInsert: (payload: InsertAssetPayload) => void;
  onAssetPickerClose: () => void;
};

export function CanvasOverlays({
  imageInputRef,
  onImageInputChange,
  infoNode,
  cropNode,
  maskEditNode,
  splitNode,
  upscaleNode,
  superResolveNode,
  angleNode,
  previewNode,
  clearConfirmOpen,
  assetPickerOpen,
  onInfoClose,
  onCropClose,
  onCropConfirm,
  onMaskEditClose,
  onMaskEditConfirm,
  onSplitClose,
  onSplitConfirm,
  onUpscaleClose,
  onUpscaleConfirm,
  onSuperResolveClose,
  onAngleClose,
  onAngleConfirm,
  onPreviewClose,
  onClearClose,
  onClearConfirm,
  onAssetInsert,
  onAssetPickerClose,
}: CanvasOverlaysProps) {
  return (
    <>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*,video/*,audio/mpeg,audio/wav,audio/x-wav,.mp3,.wav"
        className="hidden"
        onChange={onImageInputChange}
      />

      <CanvasNodeInfoModal node={infoNode} open={Boolean(infoNode)} onClose={onInfoClose} />

      {cropNode?.metadata?.content ? (
        <CanvasNodeCropDialog
          dataUrl={cropNode.metadata.content}
          open={Boolean(cropNode)}
          onClose={onCropClose}
          onConfirm={(crop) => onCropConfirm(cropNode, crop)}
        />
      ) : null}

      {maskEditNode?.metadata?.content ? (
        <CanvasNodeMaskEditDialog
          dataUrl={maskEditNode.metadata.content}
          open={Boolean(maskEditNode)}
          onClose={onMaskEditClose}
          onConfirm={(payload) => onMaskEditConfirm(maskEditNode, payload)}
        />
      ) : null}

      {splitNode?.metadata?.content ? (
        <CanvasNodeSplitDialog
          dataUrl={splitNode.metadata.content}
          open={Boolean(splitNode)}
          onClose={onSplitClose}
          onConfirm={(params) => onSplitConfirm(splitNode, params)}
        />
      ) : null}

      {upscaleNode?.metadata?.content ? (
        <CanvasNodeUpscaleDialog
          dataUrl={upscaleNode.metadata.content}
          open={Boolean(upscaleNode)}
          onClose={onUpscaleClose}
          onConfirm={(params) => onUpscaleConfirm(upscaleNode, params)}
        />
      ) : null}

      <Modal
        title="AI 超分"
        open={Boolean(superResolveNode?.metadata?.content)}
        centered
        footer={null}
        onCancel={onSuperResolveClose}
      >
        <div className="py-8 text-center text-base font-medium">暂未实现</div>
      </Modal>

      {angleNode?.metadata?.content ? (
        <CanvasNodeAngleDialog
          dataUrl={angleNode.metadata.content}
          open={Boolean(angleNode)}
          onClose={onAngleClose}
          onConfirm={(params) => onAngleConfirm(angleNode, params)}
        />
      ) : null}

      <Modal
        title="图片详情"
        open={Boolean(previewNode?.metadata?.content)}
        centered
        onCancel={onPreviewClose}
        footer={null}
        width="auto"
        styles={{
          body: {
            padding: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            maxHeight: '80vh',
          },
        }}
      >
        {previewNode?.metadata?.content ? (
          <img
            src={previewNode.metadata.content}
            alt={previewNode.title || '图片'}
            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
          />
        ) : null}
      </Modal>

      <Modal
        title="清空画布？"
        open={clearConfirmOpen}
        centered
        onCancel={onClearClose}
        footer={
          <>
            <Button onClick={onClearClose}>取消</Button>
            <Button danger type="primary" onClick={onClearConfirm}>
              清空
            </Button>
          </>
        }
      >
        <p className="text-sm opacity-60">这会删除当前画布上的所有节点和连线。</p>
      </Modal>

      <AssetPickerModal
        open={assetPickerOpen}
        onInsert={onAssetInsert}
        onClose={onAssetPickerClose}
      />
    </>
  );
}
