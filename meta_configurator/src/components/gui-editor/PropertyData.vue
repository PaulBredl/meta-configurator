<!--
Wrapper component that contains the actual component that allows the user to edit the value of a property.
The component is chosen based on the type of the property, see resolveCorrespondingComponent.
-->
<script setup lang="ts">
import type {ConfigTreeNodeData} from '@/model/configDataTreeNode';
import type {Path} from '@/model/path';
import {resolveCorrespondingComponent} from '@/components/gui-editor/resolveCorrespondingComponent';
import {pathToString} from '@/utility/pathUtils';
import Button from 'primevue/button';
import {useCurrentDataLink} from '@/data/useDataLink';

const props = defineProps<{
  nodeData: ConfigTreeNodeData;
}>();

const emit = defineEmits<{
  (e: 'update_property_value', path: Path, newValue: any): void;
  (e: 'remove_property', path: Path): void;
  (e: 'update_tree'): void;
}>();

function propagateUpdateValueEvent(newValue: any) {
  emit('update_property_value', props.nodeData.relativePath, newValue);
}
function propagateUpdateTreeEvent() {
  emit('update_tree');
}

function removeProperty() {
  emit('remove_property', props.nodeData.relativePath);
}

function isRequired(): boolean {
  return props.nodeData.parentSchema?.isRequired(props.nodeData.name as string) || false;
}

function shouldShowRemove(): boolean {
  return !isRequired() && useCurrentDataLink().dataAt(props.nodeData.absolutePath) !== undefined;
}
</script>

<template>
  <div class="grid-cols-5 content-center justify-between">
    <Component
      :id="pathToString(nodeData.absolutePath)"
      class="truncate col-span-4"
      style="width: 90%; max-width: 90%"
      :is="resolveCorrespondingComponent(nodeData)"
      @update:propertyData="(newValue: any) => propagateUpdateValueEvent(newValue)"
      @update:tree="() => propagateUpdateTreeEvent()" />

    <!-- x button to remove the property -->
    <Button
      class="h-full"
      style="width: 10%"
      v-if="shouldShowRemove()"
      icon="pi pi-times"
      severity="secondary"
      text
      aria-label="Remove"
      @click="removeProperty" />
  </div>
</template>

<style scoped>
div {
  display: flex;
  justify-content: space-between;
  vertical-align: middle;
  height: 30px;
}
</style>
