<template>
    <q-page class="picking-page q-pa-md">
      <!-- Toolbar de búsqueda y paginación -->
      <q-toolbar class="bg-white shadow-1 rounded-borders q-mb-md">
        <q-btn-group flat>
          <q-btn
            flat
            round
            icon="chevron_left"
            :disable="actualPage <= 1"
            @click="getPickingsPage(actualPage - 1)"
          />
          <q-btn flat no-caps>
            Página {{ actualPage }} de {{ totalPages }}
          </q-btn>
          <q-btn
            flat
            round
            icon="chevron_right"
            :disable="actualPage >= totalPages"
            @click="getPickingsPage(actualPage + 1)"
          />
        </q-btn-group>
  
        <q-space />
  
        <q-input
          v-model="searchQuery"
          dense
          outlined
          placeholder="Buscar..."
          class="q-ml-md"
          style="width: 200px"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-toolbar>
  
      <!-- Lista de Pickings -->
      <div class="picking-list q-gutter-y-md">
        <q-card
          v-for="(picking, pickingIndex) in pickings"
          :key="picking.ID_PICKING"
          :class="{ 'selected-card': selectedPicking === pickingIndex }"
          class="picking-card"
        >
          <!-- Header del Picking -->
          <q-card-section
            class="picking-header cursor-pointer"
            @click="handlePickingClick(pickingIndex)"
          >
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6">ORDEN #{{ picking.ID_PICKING }}</div>
                <div class="text-caption">
                  Fecha: {{ picking.date }} | Orden: {{ picking.order }} | 
                  Palets: {{ picking.packings.length }}
                </div>
              </div>
              <q-btn
                flat
                round
                :icon="selectedPicking === pickingIndex ? 'keyboard_arrow_down' : 'keyboard_arrow_right'"
              />
            </div>
          </q-card-section>
  
          <!-- Lista de Palets -->
          <q-slide-transition>
            <div v-show="selectedPicking === pickingIndex">
              <q-separator />
              <q-card-section class="q-pa-none">
                <div class="q-pa-md q-gutter-y-md">
                  <palet-card
                    v-for="(palet, paletIndex) in picking.packings"
                    :key="paletIndex"
                    :palet="palet"
                    :palet-index="paletIndex"
                    :is-selected="selectedPacking === `${pickingIndex}-${paletIndex}`"
                    :selected-products="selectedProducts"
                    @click="handlePaletClick(pickingIndex, paletIndex)"
                    @product-click="handleProductClick"
                  >
                    <template #actions v-if="selectedPacking === `${pickingIndex}-${paletIndex}`">
                      <div class="row q-gutter-sm justify-end q-px-sm">
                        <q-btn
                          flat
                          round
                          color="negative"
                          icon="delete"
                          @click.stop="handleDeletePalet(pickingIndex, paletIndex)"
                        >
                          <q-tooltip>Eliminar palet</q-tooltip>
                        </q-btn>
                      </div>
                    </template>
                  </palet-card>
                </div>
              </q-card-section>
            </div>
          </q-slide-transition>
        </q-card>
      </div>
  
      <!-- Estado vacío -->
      <div v-if="pickings.length === 0" class="empty-state q-pa-xl text-center">
        <q-icon name="inventory_2" size="4rem" color="grey-5" />
        <div class="text-h6 text-grey-7 q-mt-md">No hay órdenes disponibles</div>
      </div>
  
      <!-- Barra de acciones -->
      <action-bar
        :selected-products="selectedProducts"
        :selected-palets="getSelectedPalets"
        :total-palets="getTotalPalets"
        @confirm="handleConfirm"
        @delete="handleDelete"
      />
  
      <!-- Loading overlay -->
      <q-inner-loading :showing="loading">
        <q-spinner-dots size="50px" color="primary" />
      </q-inner-loading>
    </q-page>
  </template>
  
  <script>
  import { ref, computed } from 'vue'
  import PaletCard from 'components/PaletCard.vue'
  import ActionBar from 'components/ActionBar.vue'
  
  const PAGE_SIZE = 2
  
  export default {
    name: 'PickingPage',
    
    components: {
      PaletCard,
      ActionBar
    },
  
    setup() {
      // Estado
      const pickings = ref([])
      const originalPickings = ref([])
      const selectedPicking = ref(null)
      const selectedPacking = ref(null)
      const selectedProducts = ref([])
      const actualPage = ref(1)
      const totalPages = ref(0)
      const loading = ref(false)
      const searchQuery = ref('')
  
      // Computed
      const getSelectedPalets = computed(() => {
        if (!selectedPacking.value) return []
        const [pickingIndex, paletIndex] = selectedPacking.value.split('-')
        return [[pickingIndex, paletIndex]]
      })
  
      const getTotalPalets = computed(() => {
        return pickings.value.reduce((total, picking) => total + picking.packings.length, 0)
      })
  
      // Métodos
      const fetchPickings = async (page) => {
        loading.value = true
        try {
          const response = await fetch(`https://192.168.0.197:3002/page?page=${page}&length=${PAGE_SIZE}`)
          const data = await response.json()
          pickings.value = data.data
          originalPickings.value = JSON.parse(JSON.stringify(data.data))
          totalPages.value = data.totalPages
          actualPage.value = page
        } catch (error) {
          console.error('Error fetching pickings:', error)
        } finally {
          loading.value = false
        }
      }
  
      const getPickingsPage = (page) => {
        if (page >= 1 && page <= totalPages.value) {
          fetchPickings(page)
        }
      }
  
      const handlePickingClick = (index) => {
        selectedPicking.value = selectedPicking.value === index ? null : index
        selectedPacking.value = null
        selectedProducts.value = []
      }
  
      const handlePaletClick = (pickingIndex, paletIndex) => {
        const paletId = `${pickingIndex}-${paletIndex}`
        selectedPacking.value = selectedPacking.value === paletId ? null : paletId
        selectedProducts.value = []
      }
  
      const handleProductClick = (product) => {
        const index = selectedProducts.value.indexOf(product)
        if (index === -1) {
          selectedProducts.value.push(product)
        } else {
          selectedProducts.value.splice(index, 1)
        }
      }
  
      const handleConfirm = async () => {
        loading.value = true
        try {
          const response = await fetch('https://192.168.0.197:3002/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pickings.value)
          })
          if (response.ok) {
            await fetchPickings(actualPage.value)
          }
        } catch (error) {
          console.error('Error saving changes:', error)
        } finally {
          loading.value = false
        }
      }
  
      const handleDelete = async () => {
        if (!selectedPacking.value && selectedProducts.value.length === 0) return
  
        const deletePayload = {}
        if (selectedProducts.value.length > 0) {
          deletePayload.product = selectedProducts.value[0].PRODUCT_ID
        } else if (selectedPacking.value) {
          const [pickingIndex, paletIndex] = selectedPacking.value.split('-')
          deletePayload.packing = pickings.value[pickingIndex].packings[paletIndex].ID_PACKING
        }
  
        loading.value = true
        try {
          const response = await fetch('https://192.168.0.197:3002/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(deletePayload)
          })
          if (response.ok) {
            await fetchPickings(actualPage.value)
            selectedPacking.value = null
            selectedProducts.value = []
          }
        } catch (error) {
          console.error('Error deleting items:', error)
        } finally {
          loading.value = false
        }
      }
  
      const handleDeletePalet = async (pickingIndex, paletIndex) => {
        const palet = pickings.value[pickingIndex].packings[paletIndex]
        const deletePayload = { packing: palet.ID_PACKING }
        
        loading.value = true
        try {
          const response = await fetch('https://192.168.0.197:3002/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(deletePayload)
          })
          if (response.ok) {
            await fetchPickings(actualPage.value)
            selectedPacking.value = null
          }
        } catch (error) {
          console.error('Error deleting palet:', error)
        } finally {
          loading.value = false
        }
      }
  
      // Inicialización
      fetchPickings(1)
  
      return {
        pickings,
        selectedPicking,
        selectedPacking,
        selectedProducts,
        actualPage,
        totalPages,
        loading,
        searchQuery,
        getSelectedPalets,
        getTotalPalets,
        getPickingsPage,
        handlePickingClick,
        handlePaletClick,
        handleProductClick,
        handleConfirm,
        handleDelete,
        handleDeletePalet
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .picking-page {
    padding-bottom: 72px;
  }
  
  .picking-card {
    transition: all 0.3s ease;
  
    &.selected-card {
      border: 2px solid var(--q-primary);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  
    .picking-header {
      &:hover {
        background: rgba(0, 0, 0, 0.03);
      }
    }
  }
  
  .empty-state {
    border: 2px dashed #e0e0e0;
    border-radius: 8px;
    margin: 16px;
  }
  </style>