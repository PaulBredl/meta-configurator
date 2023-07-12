import type {Ref, WritableComputedRef} from 'vue';
import {computed, ref} from 'vue';
import type {Path} from '@/model/path';
import {defineStore} from 'pinia';
import {useDataStore} from '@/store/dataStore';
import {JsonSchema} from '@/helpers/schema/JsonSchema';
import {pathToString} from '@/helpers/pathHelper';
import _ from 'lodash';
import {useSettingsStore} from '@/store/settingsStore';

export enum SessionMode {
  FileEditor = 'file_editor',
  SchemaEditor = 'schema_editor',
  Settings = 'settings',
}
export enum ChangeResponsible {
  None = 'none',
  CodeEditor = 'code_editor',
  GuiEditor = 'gui_editor',
  Routing = 'routing',
  FileUpload = 'file_upload',
}

/**
 * Store for common data.
 */
export const useSessionStore = defineStore('commonStore', () => {
  /**
   * The current path in the data tree. List of path keys (or array indices). Empty list for root path.
   */
  const currentPath: Ref<Path> = ref<Path>([]);
  const currentSelectedElement: Ref<Path> = ref<Path>([]);
  const currentMode: Ref<SessionMode> = ref<SessionMode>(SessionMode.FileEditor);
  const lastChangeResponsible: Ref<ChangeResponsible> = ref<ChangeResponsible>(
    ChangeResponsible.None
  );

  const fileData: WritableComputedRef<any> = computed({
    // getter
    get() {
      switch (currentMode.value) {
        case SessionMode.FileEditor:
          return useDataStore().fileData;

        case SessionMode.SchemaEditor:
          return useDataStore().schemaData;

        case SessionMode.Settings:
          return useSettingsStore().settingsData;

        default:
          throw new Error('Invalid mode');
      }
    },
    // setter
    set(newValue: any) {
      switch (currentMode.value) {
        case SessionMode.FileEditor:
          useDataStore().fileData = newValue;
          break;

        case SessionMode.SchemaEditor:
          useDataStore().schemaData = newValue;
          break;

        case SessionMode.Settings:
          useSettingsStore().settingsData = newValue;
          break;
      }
    },
  });

  const fileSchema = computed(() => {
    switch (currentMode.value) {
      case SessionMode.FileEditor:
        return useDataStore().schema;

      case SessionMode.SchemaEditor:
        return useDataStore().metaSchema;

      case SessionMode.Settings:
        return useSettingsStore().settingsSchema;

      default:
        throw new Error('Invalid mode');
    }
  });

  const fileSchemaObject = computed(() => {
    return fileSchema.value.jsonSchema;
  });

  const schemaAtCurrentPath: Ref<JsonSchema> = computed(
    () => fileSchema.value.subSchemaAt(currentPath.value) ?? new JsonSchema({})
  );

  /**
   * Returns the data at the given path.
   * @param path The array of keys to traverse.
   * @returns The data at the given path, or an empty object if the path does not exist.
   */
  function dataAtPath(path: Path): any {
    let currentData: any = fileData.value;

    for (const key of path) {
      if (!currentData[key]) {
        return {};
      }
      currentData = currentData[key];
    }

    return currentData;
  }

  function updateCurrentPath(proposedPath: Path): void {
    currentPath.value = proposedPath;
    const schema = schemaAtCurrentPath.value;
    if (!schema.hasType('object') && !schema.hasType('array')) {
      currentPath.value = proposedPath.slice(0, -1);
    }
  }

  function updateCurrentSelectedElement(proposedElement: Path): void {
    currentSelectedElement.value = proposedElement;
  }

  function updateDataAtPath(path: Path, newValue: any): void {
    const pathAsString = pathToString(path);
    _.set(fileData.value, pathAsString!!, newValue);
  }

  return {
    currentMode,
    fileData,
    fileSchema,
    fileSchemaObject,
    schemaAtCurrentPath,
    dataAtCurrentPath: computed(() => dataAtPath(currentPath.value)),
    currentPath,
    currentSelectedElement,
    lastChangeResponsible,
    updateCurrentPath,
    updateCurrentSelectedElement,
    updateDataAtPath,
  };
});
