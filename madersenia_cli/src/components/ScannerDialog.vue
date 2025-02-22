<template>
    <q-dialog v-model="dialogModel" persistent>
      <q-card class="scanner-dialog">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Escanear Código de Barras</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="handleClose" />
        </q-card-section>
  
        <q-card-section>
          <!-- Vista previa de la cámara -->
          <div class="scanner-viewport">
            <div id="interactive" class="viewport" />
          </div>
  
          <!-- Input manual -->
          <q-input
            v-model="localBarcode"
            label="Código de Barras"
            filled
            class="q-mt-md"
            @update:model-value="handleManualInput"
          >
            <template v-slot:append>
              <q-btn
                round
                dense
                flat
                icon="clear"
                @click="clearBarcode"
                v-if="localBarcode"
              />
            </template>
          </q-input>
  
          <!-- Lista de códigos leídos -->
          <div class="scanned-codes q-mt-md">
            <q-list separator>
              <q-item
                v-for="(code, index) in scannedCodes"
                :key="index"
                clickable
                :active="localBarcode === code"
                @click="selectCode(code)"
                v-ripple
              >
                <q-item-section>
                  <q-item-label>{{ code }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>
  
        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            @click="handleClose"
          />
          <q-btn
            unelevated
            label="Confirmar"
            color="primary"
            :disabled="!localBarcode"
            @click="confirmBarcode"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </template>
  
  <script>
  import { ref, computed, onBeforeUnmount, watch } from 'vue'
  import Quagga from 'quagga'
  
  export default {
    name: 'ScannerDialog',
    
    props: {
      modelValue: {
        type: Boolean,
        required: true
      }
    },
  
    emits: ['update:modelValue', 'barcode-detected', 'confirm'],
  
    setup(props, { emit }) {
      const localBarcode = ref('')
      const scannedCodes = ref([])
      const barcodeRegex = /^\d+-\d+-\d+-\d+$/
  
      const dialogModel = computed({
        get: () => props.modelValue,
        set: (value) => emit('update:modelValue', value)
      })

      const handleManualInput = (value) => {
        if (value && !scannedCodes.value.includes(value)) {
          scannedCodes.value.push(value)
          emit('barcode-detected', value)
        }
      }
  
      const initScanner = () => {
        Quagga.init({
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: document.querySelector('#interactive'),
            constraints: {
              facingMode: 'environment'
            }
          },
          decoder: {
            readers: ['code_128_reader']
          }
        }, (err) => {
          if (err) {
            console.error('Error iniciando Quagga:', err)
            return
          }
          Quagga.start()
        })
  
        Quagga.onDetected(handleDetection)
      }
  
      const handleDetection = (result) => {
        const code = result.codeResult.code
        if (code && code.length >= 20 && barcodeRegex.test(code)) {
          if (!scannedCodes.value.includes(code)) {
            scannedCodes.value.push(code)
          }
          localBarcode.value = code
          emit('barcode-detected', code)
        }
      }
  
      const selectCode = (code) => {
        localBarcode.value = code
        emit('barcode-detected', code)
      }
  
      const clearBarcode = () => {
        localBarcode.value = ''
        emit('barcode-detected', '')
      }

      const handleClose = () => {
        clearBarcode()
        dialogModel.value = false
      }
  
      const confirmBarcode = () => {
        if (localBarcode.value) {
          emit('confirm', localBarcode.value)
          dialogModel.value = false
        }
      }
  
      watch(() => props.modelValue, (newVal) => {
        if (newVal) {
          clearBarcode()
          scannedCodes.value = []
          setTimeout(initScanner, 100)
        } else {
          Quagga.stop()
        }
      })
  
      onBeforeUnmount(() => {
        Quagga.stop()
      })
  
      return {
        dialogModel,
        localBarcode,
        scannedCodes,
        selectCode,
        confirmBarcode,
        handleManualInput,
        clearBarcode,
        handleClose
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .scanner-dialog {
    min-width: 350px;
    max-width: 600px;
    width: 90vw;
  
    .scanner-viewport {
      position: relative;
      width: 100%;
      height: 300px;
      overflow: hidden;
      background: #000;
      border-radius: 8px;
  
      #interactive.viewport {
        position: relative;
        width: 100%;
        height: 100%;
  
        video, canvas {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
  
        canvas.drawingBuffer {
          position: absolute;
          top: 0;
          left: 0;
        }
      }
    }
  
    .scanned-codes {
      max-height: 200px;
      overflow-y: auto;
    }
  }
  </style>