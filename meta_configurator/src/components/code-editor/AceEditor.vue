<!--
 Code Editor component based on Ace Editor. Supports different data formats.
 Synchronized with file data from the store.
 -->
<script setup lang="ts">
import {onMounted} from 'vue';
import type {Editor} from 'brace';
import * as ace from 'brace';
import 'brace/mode/javascript';
import 'brace/mode/json';
import 'brace/mode/yaml';
import 'brace/theme/clouds';
import 'brace/theme/ambiance';
import 'brace/theme/monokai';
import {watchImmediate} from '@vueuse/core';
import {setupAnnotationsFromValidationErrors} from '@/components/code-editor/setupAnnotations';
import {setupLinkToCurrentSelection} from '@/components/code-editor/setupLinkToSelection';
import {useSettings} from '@/settings/useSettings';
import {setupLinkToData} from '@/components/code-editor/setupLinkToData';

onMounted(() => {
  const editor: Editor = ace.edit('code-editor');
  setupMode(editor);
  setupAceProperties(editor);

  setupLinkToData(editor);
  setupLinkToCurrentSelection(editor);
  setupAnnotationsFromValidationErrors(editor);
});

/**
 * change the mode depending on the data format.
 * to support new data formats, they need to be added here too.
 */
function setupMode(editor: Editor) {
  watchImmediate(
    () => useSettings().dataFormat,
    format => {
      if (format == 'json') {
        editor.getSession().setMode('ace/mode/json');
      } else if (format == 'yaml') {
        editor.getSession().setMode('ace/mode/yaml');
      }
    }
  );
}

function setupAceProperties(editor: Editor) {
  editor.$blockScrolling = Infinity;
  editor.setOptions({
    autoScrollEditorIntoView: true, // this is needed if editor is inside scrollable page
  });
  editor.setTheme('ace/theme/clouds');
  editor.setShowPrintMargin(false);

  // it's not clear why timeout is needed here, but without it the
  // ace editor starts flashing and becomes unusable
  window.setTimeout(() => {
    watchImmediate(
      () => useSettings().codeEditor.fontSize,
      fontSize => {
        if (editor && fontSize && fontSize > 6 && fontSize < 65) {
          editor.setFontSize(fontSize.toString() + 'px');
        }
      }
    );
  }, 0);
}
</script>

<template>
  <div class="h-full" id="code-editor" />
</template>

<style scoped></style>
