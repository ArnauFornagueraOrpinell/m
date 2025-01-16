<template>
    <q-dialog v-model="modelValue">
      <q-card class="warning-dialog">
        <q-card-section class="row items-center">
          <q-icon name="warning" color="warning" size="24px" />
          <span class="q-ml-sm text-body1">{{ message }}</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn 
            flat 
            :label="closeButtonText" 
            color="primary" 
            v-close-popup 
            class="q-px-md"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </template>
  
  <script>
  export default {
    name: 'WarningDialog',
    props: {
      modelValue: {
        type: Boolean,
        required: true
      },
      message: {
        type: String,
        required: true
      },
      closeButtonText: {
        type: String,
        default: 'Cerrar'
      }
    },
    emits: ['update:modelValue']
  }
  </script>
  
  <style scoped>
  .warning-dialog {
    min-width: 300px;
    max-width: 400px;
  }
  </style>