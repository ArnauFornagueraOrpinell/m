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
          :key="picking.PICKING_ID"
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
                <div class="text-h6">ORDEN #{{ picking.PICKING_ID }}</div>
                <div class="text-caption">
                  Palets: {{ picking.packings.length }}
                </div>
              </div>
              <div class="col-auto">
                <q-btn
                  v-if="selectedPicking === pickingIndex"
                  flat
                  round
                  color="negative"
                  icon="delete"
                  @click.stop="confirmDeletePicking(picking)"
                >
                  <q-tooltip>Eliminar picking</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  :icon="selectedPicking === pickingIndex ? 'keyboard_arrow_down' : 'keyboard_arrow_right'"
                />
              </div>
            </div>
          </q-card-section>
  
          <!-- Lista de Packings -->
          <q-slide-transition>
            <div v-show="selectedPicking === pickingIndex">
              <q-separator />
              <q-card-section class="q-pa-none">
                <div class="q-pa-md q-gutter-y-md">
                  <packing-card
                    v-for="(packing, packingIndex) in picking.packings"
                    :key="packingIndex"
                    :packing="packing"
                    :packing-index="packingIndex"
                    :is-selected="selectedPacking === `${pickingIndex}-${packingIndex}`"
                    :selected-products="selectedProducts"
                    :editable="true"
                    :deletable="true"
                    @click="handlePackingClick(pickingIndex, packingIndex)"
                    @product-click="handleProductClick"
                    @deleted="handlePackingDeleted(pickingIndex, packingIndex)"
                    @product-deleted="handleProductDeleted(pickingIndex, packingIndex, $event)"
                  >
                  </packing-card>
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
  
      <!-- Diálogo de confirmación para eliminar picking -->
      <q-dialog v-model="showDeleteDialog" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar icon="warning" color="negative" text-color="white" />
            <span class="q-ml-sm">¿Está seguro de que desea eliminar este picking y todos sus packings relacionados?</span>
          </q-card-section>
  
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" v-close-popup />
            <q-btn flat label="Eliminar" color="negative" @click="deletePicking" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
  
      <!-- Barra de acciones -->
      <action-bar
        :selected-products="selectedProducts"
        :selected-packings="getSelectedPackings"
        :total-packings="getTotalPackings"
        @confirm="handleConfirm"
      />
  
      <!-- Loading overlay -->
      <q-inner-loading :showing="loading">
        <q-spinner-dots size="50px" color="primary" />
      </q-inner-loading>
    </q-page>
  </template>
  
  <script>
  import { ref, computed } from 'vue'
  import PackingCard from 'components/PackingCard.vue'
  import ActionBar from 'components/ActionBar.vue'
  import { api } from 'boot/axios'
  import { useQuasar } from 'quasar'
  
  const PAGE_SIZE = 2
  
  export default {
    name: 'PickingPage',
    
    components: {
      PackingCard,
      ActionBar
    },
  
    setup() {
      const $q = useQuasar()
      
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
      const showDeleteDialog = ref(false)
      const pickingToDelete = ref(null)
  
      // Computed
      const getSelectedPackings = computed(() => {
        if (!selectedPacking.value) return []
        const [pickingIndex, packingIndex] = selectedPacking.value.split('-')
        return [[pickingIndex, packingIndex]]
      })
  
      const getTotalPackings = computed(() => {
        return pickings.value.reduce((total, picking) => total + picking.packings.length, 0)
      })
  
      // Métodos
      const fetchPickings = async (page) => {
        loading.value = true
        try {
          const response = await api.get(`/page?page=${page}&length=${PAGE_SIZE}`)
          pickings.value = response.data.data
          originalPickings.value = JSON.parse(JSON.stringify(response.data.data))
          totalPages.value = response.data.totalPages
          actualPage.value = page
        } catch (error) {
          console.error('Error fetching pickings:', error)
          $q.notify({
            type: 'negative',
            message: 'Error al cargar los pickings',
            caption: error.response?.data?.error || error.message
          })
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
  
      const handlePackingClick = (pickingIndex, packingIndex) => {
        const packingId = `${pickingIndex}-${packingIndex}`
        selectedPacking.value = selectedPacking.value === packingId ? null : packingId
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
  
      const confirmDeletePicking = (picking) => {
        pickingToDelete.value = picking
        showDeleteDialog.value = true
      }
  
      const deletePicking = async () => {
        if (!pickingToDelete.value) return
  
        loading.value = true
        try {
          await api.delete(`/delete/${pickingToDelete.value.PICKING_ID}`)
          $q.notify({
            type: 'positive',
            message: 'Picking eliminado correctamente'
          })
          await fetchPickings(actualPage.value)
          selectedPicking.value = null
          selectedPacking.value = null
          selectedProducts.value = []
        } catch (error) {
          console.error('Error deleting picking:', error)
          $q.notify({
            type: 'negative',
            message: 'Error al eliminar el picking',
            caption: error.response?.data?.error || error.message
          })
        } finally {
          loading.value = false
          pickingToDelete.value = null
        }
      }
  
      const handlePackingDeleted = async (pickingIndex, packingIndex) => {
        await fetchPickings(actualPage.value)
        selectedPacking.value = null
        selectedProducts.value = []
      }
  
      const handleProductDeleted = async (pickingIndex, packingIndex, productIndex) => {
        await fetchPickings(actualPage.value)
      }
  
      const handleConfirm = async () => {
        loading.value = true
        try {
          await api.post('/save-pickings', pickings.value)
          $q.notify({
            type: 'positive',
            message: 'Cambios guardados correctamente'
          })
          await fetchPickings(actualPage.value)
        } catch (error) {
          console.error('Error saving changes:', error)
          $q.notify({
            type: 'negative',
            message: 'Error al guardar los cambios',
            caption: error.response?.data?.error || error.message
          })
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
        showDeleteDialog,
        getSelectedPackings,
        getTotalPackings,
        getPickingsPage,
        handlePickingClick,
        handlePackingClick,
        handleProductClick,
        handleConfirm,
        confirmDeletePicking,
        deletePicking,
        handlePackingDeleted,
        handleProductDeleted
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