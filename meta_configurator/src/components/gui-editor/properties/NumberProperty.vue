<!-- Numeric input for number and integer properties -->
<script setup lang="ts">
import InputNumber from 'primevue/inputnumber';
import {computed} from 'vue';
import type {PathElement} from '@/model/path';
import {JsonSchema} from '@/schema/jsonSchema';
import {generatePlaceholderText} from '@/utility/propertyPlaceholderGenerator';
import {ValidationResult} from '@/schema/validation/validationService';
import {GuiConstants} from '@/constants';

const props = defineProps<{
  propertyName: PathElement;
  propertyData: number | undefined;
  propertySchema: JsonSchema;
  validationResults: ValidationResult;
}>();

const emit = defineEmits<{
  (e: 'update:propertyData', newValue: number | undefined): void;
}>();

const valueProperty = computed({
  get() {
    return props.propertyData;
  },
  set(newValue) {
    if (newValue !== null && newValue !== undefined) {
      emit('update:propertyData', newValue);
    }
  },
});

function isValid(): boolean {
  return props.validationResults.valid;
}

function isInteger(): boolean {
  return props.propertySchema.hasType('integer');
}

const stepValue = computed(() => {
  return props.propertySchema.multipleOf ?? 1;
});
</script>

<template>
  <InputNumber
    class="h-8"
    :class="{'underline decoration-wavy decoration-red-600': !isValid()}"
    v-model="valueProperty"
    value="propertyName"
    mode="decimal"
    locale="en-US"
    :minFractionDigits="0"
    :maxFractionDigits="isInteger() ? 0 : GuiConstants.NUMBER_MAX_DECIMAL_PLACES"
    showButtons
    buttonLayout="stacked"
    :placeholder="generatePlaceholderText(props.propertySchema, props.propertyName)"
    :step="stepValue"
    @keydown.stop
    increment-button-class="p-button-text p-button-secondary"
    decrement-button-class="p-button-text p-button-secondary" />
</template>

<style scoped>
/* remove the border so it better fits to the table look,
   remove the box shadow, otherwise it looks buggy */
:deep(.p-inputtext) {
  border: none !important;
  box-shadow: none !important;
}
::placeholder {
  color: #a8a8a8;
}
</style>
