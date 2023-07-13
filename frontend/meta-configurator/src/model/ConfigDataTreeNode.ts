import type {TreeNode} from 'primevue/tree';
import {JsonSchema} from '@/model/JsonSchema';
import type {Path, PathElement} from '@/model/path';

/**
 * Represents a node in the schema tree.
 * Compatible with the PrimeVue TreeNode interface.
 */
export interface ConfigDataTreeNode extends TreeNode {
  data: ConfigTreeNodeData;
  type: TreeNodeType.DATA;
}

export interface AddItemTreeNode extends TreeNode {
  data: AddItemTreeNodeData;
  type: TreeNodeType.ADD_ITEM;
}

export type GuiEditorTreeNode = ConfigDataTreeNode | AddItemTreeNode;

export enum TreeNodeType {
  DATA = 'data',
  ADD_ITEM = 'addItem',
}

export interface AddItemTreeNodeData {
  schema: JsonSchema; // schema of the items
  depth: number;
  relativePath: Path;
  name: PathElement;
  data?: any;
}

export interface ConfigTreeNodeData {
  name: PathElement;
  schema: JsonSchema;
  parentSchema?: JsonSchema;
  data: any;
  relativePath: Path;
  depth: number;
}