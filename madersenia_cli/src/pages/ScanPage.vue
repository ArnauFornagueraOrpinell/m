<template>
    <q-page class="product-page q-pa-md">
      <!-- Diálogos de advertencia -->
      <warning-dialog
        v-model="showOfWarning"
        message="Selecciona una orden de fabricación antes de continuar"
      />
      
      <warning-dialog
        v-model="showBarcodeWarning"
        message="El código de barras ya se ha leído previamente"
      />
  
      <!-- Scanner Dialog -->
      <scanner-dialog
        v-model="showScanner"
        :selected-barcode="selectedBarcode"
        @barcode-detected="handleBarcodeDetected"
        @confirm="handleBarcodeConfirm"
      />
  
      <!-- Selector OF -->
      <of-selector
        v-model="selectedOf"
        :options="ofList"
        @selection="handleOfSelection"
      />
  
      <!-- Botón Nuevo Palet -->
      <q-card 
        v-show="!scanning"
        class="new-palet-card q-my-md cursor-pointer"
        @click="handleNewPalet"
      >
        <q-card-section class="flex items-center justify-center bg-primary text-white">
          <div class="text-h6">NUEVO PALET</div>
        </q-card-section>
      </q-card>
  
      <!-- Lista de Productos -->
      <product-list
        :palets="palets"
        :selected-palet="selectedPalet"
        :selected-products="selectedProducts"
        @palet-click="handlePaletClick"
        @product-click="handleProductClick"
        @add-product="handleAddProduct"
      />
  
      <!-- Mensaje sin pickings -->
      <div v-if="palets.length === 0" class="text-center q-pa-lg">
        <h3 class="text-h5 text-grey-7">No hay palets disponibles</h3>
      </div>
  
      <!-- Barra de acciones -->
      <action-bar
        :selected-products="selectedProducts"
        :selected-palets="selectedPalets"
        :total-palets="palets.length"
        @confirm="handleConfirm"
        @delete="handleDelete"
      />
    </q-page>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue'
  import WarningDialog from './WarningDialog.vue'
  import ScannerDialog from './ScannerDialog.vue'
  import OfSelector from './OfSelector.vue'
  import ProductList from './ProductList.vue'
  import ActionBar from './ActionBar.vue'
  
  export default {
    name: 'ProductPage',
    components: {
      WarningDialog,
      ScannerDialog,
      OfSelector,
      ProductList,
      ActionBar
    },
  
    setup() {
      const showOfWarning = ref(false)
      const showBarcodeWarning = ref(false)
      const showScanner = ref(false)
      const scanning = ref(false)
      const selectedBarcode = ref(null)
      const selectedOf = ref({})
      const ofList = ref([])
      const palets = ref([])
      const selectedPalet = ref(null)
      const selectedProducts = ref([])
      const selectedPalets = ref([])
  
      // Cargar OFs al montar el componente
      onMounted(async () => {
        try {
          const response = await fetch('https://192.168.0.197:3002/get-ofs')
          const data = await response.json()
          ofList.value = data.map(of => ({
            name: of.NUM_DOCUMENT_OF,
            value: of.NUM_DOCUMENT_OF
          }))
        } catch (error) {
          console.error('Error cargando OFs:', error)
        }
      })
  
      const handleOfSelection = (of) => {
        selectedOf.value = of
      }
  
      const handleNewPalet = () => {
        if (!selectedOf.value?.name) {
          showOfWarning.value = true
          return
        }
  
        palets.value.push({
          name: '',
          of_group: selectedOf.value.name,
          products: [],
          id: palets.value.length
        })
      }
  
      const handlePaletClick = (paletIndex) => {
        if (selectedPalets.value.includes(paletIndex)) {
          selectedPalets.value = selectedPalets.value.filter(p => p !== paletIndex)
        } else {
          selectedPalets.value.push(paletIndex)
        }
        selectedPalet.value = paletIndex
      }
  
      const handleProductClick = (product) => {
        const index = selectedProducts.value.indexOf(product)
        if (index === -1) {
          selectedProducts.value.push(product)
        } else {
          selectedProducts.value.splice(index, 1)
        }
      }
  
      const handleAddProduct = (paletIndex) => {
        selectedPalet.value = paletIndex
        showScanner.value = true
        scanning.value = true
      }
  
      const handleBarcodeDetected = (barcode) => {
        selectedBarcode.value = barcode
      }
  
      const handleBarcodeConfirm = async () => {
        try {
          const response = await fetch(`https://192.168.0.197:3002/get-product-by-barcode?barcode=${selectedBarcode.value}`)
          if (!response.ok) {
            throw new Error('Producto no encontrado')
          }
          const product = await response.json()
          
          if (palets.value[selectedPalet.value].of_group !== selectedOf.value.name) {
            throw new Error('OF no coincide')
          }
          
          palets.value[selectedPalet.value].products.push(product)
          showScanner.value = false
          scanning.value = false
          selectedBarcode.value = null
        } catch (error) {
          showBarcodeWarning.value = true
          console.error('Error al confirmar código:', error)
        }
      }
  
      const handleConfirm = async () => {
        try {
          const paletsToConfirm = selectedPalets.value.map(index => palets.value[index])
          const response = await fetch('https://192.168.0.197:3002/add-picking', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(paletsToConfirm),
          })
          
          if (!response.ok) {
            throw new Error('Error al confirmar palets')
          }
  
          palets.value = palets.value.filter((_, index) => !selectedPalets.value.includes(index))
          selectedProducts.value = []
          selectedPalets.value = []
          selectedPalet.value = null
        } catch (error) {
          console.error('Error en confirmación:', error)
        }
      }
  
      const handleDelete = () => {
        palets.value = palets.value.map(palet => ({
          ...palet,
          products: palet.products.filter(product => !selectedProducts.value.includes(product))
        }))
        selectedProducts.value = []
      }
  
      return {
        showOfWarning,
        showBarcodeWarning,
        showScanner,
        scanning,
        selectedBarcode,
        selectedOf,
        ofList,
        palets,
        selectedPalet,
        selectedProducts,
        selectedPalets,
        handleOfSelection,
        handleNewPalet,
        handlePaletClick,
        handleProductClick,
        handleAddProduct,
        handleBarcodeDetected,
        handleBarcodeConfirm,
        handleConfirm,
        handleDelete
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .product-page {
    padding-bottom: 72px; // Espacio para la barra de acciones
  
    .new-palet-card {
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }
  }
  </style>