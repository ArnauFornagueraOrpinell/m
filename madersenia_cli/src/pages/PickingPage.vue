# PickingPage.vue

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
        @input="handleSearch"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </q-toolbar>

    <!-- Lista de Pickings -->
    <div class="picking-list q-gutter-y-md">
      <q-card
        v-for="(picking, pickingIndex) in displayedPickings"
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
                <palet-card
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
                  @update:packing="handlePackingUpdate(pickingIndex, packingIndex, $event)"
                  @deleted="handlePackingDeleted(pickingIndex, packingIndex)"
                  @product-deleted="handleProductDeleted(pickingIndex, packingIndex, $event)"
                />
              </div>
            </q-card-section>
          </div>
        </q-slide-transition>
      </q-card>
    </div>

    <!-- Estado vacío -->
    <div v-if="displayedPickings.length === 0" class="empty-state q-pa-xl text-center">
      <q-icon name="inventory_2" size="4rem" color="grey-5" />
      <div class="text-h6 text-grey-7 q-mt-md">No hay órdenes disponibles</div>
    </div>

    <!-- Botón de guardar (solo visible cuando hay cambios) -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]" v-if="hasChanges">
      <q-btn
        fab
        color="primary"
        icon="save"
        @click="handleSave"
      >
        <q-tooltip>Guardar cambios</q-tooltip>
      </q-btn>
    </q-page-sticky>

    <!-- Loading overlay -->
    <q-inner-loading :showing="loading">
      <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script>
import { ref, computed, watch } from 'vue'
import PaletCard from 'components/PaletCard.vue'
import { useQuasar } from 'quasar'

const API_URL = 'https://192.168.0.197:3002'
const PAGE_SIZE = 2

export default {
  name: 'PickingPage',
  
  components: {
    PaletCard
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
    const hasChanges = ref(false)

    // Computed properties
    const displayedPickings = computed(() => {
      if (!searchQuery.value) return pickings.value

      const query = searchQuery.value.toLowerCase()
      return pickings.value.filter(picking => {
        // Búsqueda por ID de picking
        if (picking.PICKING_ID.toString().toLowerCase().includes(query)) return true
        
        // Búsqueda en packings
        return picking.packings.some(packing => {
          // Búsqueda por OF_GROUP
          if (packing.OF_GROUP.toLowerCase().includes(query)) return true
          
          // Búsqueda en productos
          return packing.products.some(product => 
            product.CODI_PRODUCTE.toString().toLowerCase().includes(query) ||
            product.PRODUCT_ID.toLowerCase().includes(query) ||
            product.DESCRIPCIO.toLowerCase().includes(query)
          )
        })
      })
    })

    // Métodos
    const checkForChanges = () => {
      hasChanges.value = JSON.stringify(pickings.value) !== JSON.stringify(originalPickings.value)
    }

    const fetchPickings = async (page) => {
      loading.value = true
      try {
        const response = await fetch(`${API_URL}/page?page=${page}&length=${PAGE_SIZE}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Error al cargar los pickings')
        }

        pickings.value = data.data
        originalPickings.value = JSON.parse(JSON.stringify(data.data))
        totalPages.value = data.totalPages
        actualPage.value = page
        hasChanges.value = false
      } catch (error) {
        console.error('Error fetching pickings:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al cargar los pickings',
          caption: error.message
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

    const handlePackingUpdate = (pickingIndex, packingIndex, updatedPacking) => {
      pickings.value[pickingIndex].packings[packingIndex] = updatedPacking
      checkForChanges()
    }

    const handlePackingDeleted = async (pickingIndex, packingIndex) => {
      await fetchPickings(actualPage.value)
      selectedPacking.value = null
      selectedProducts.value = []
    }

    const handleProductDeleted = async (pickingIndex, packingIndex, productIndex) => {
      await fetchPickings(actualPage.value)
      selectedProducts.value = []
    }

    const handleSave = async () => {
      loading.value = true
      try {
        const response = await fetch(`${API_URL}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(pickings.value)
        })
        
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al guardar los cambios')
        }

        $q.notify({
          type: 'positive',
          message: 'Cambios guardados correctamente'
        })
        
        // Recargar datos después de guardar
        await fetchPickings(actualPage.value)
      } catch (error) {
        console.error('Error saving changes:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al guardar los cambios',
          caption: error.message
        })
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      // La búsqueda se maneja a través del computed property displayedPickings
    }

    // Watch para detectar cambios en pickings
    watch(pickings, () => {
      checkForChanges()
    }, { deep: true })

    // Inicialización
    fetchPickings(1)

    return {
      pickings,
      displayedPickings,
      selectedPicking,
      selectedPacking,
      selectedProducts,
      actualPage,
      totalPages,
      loading,
      searchQuery,
      hasChanges,
      getPickingsPage,
      handlePickingClick,
      handlePackingClick,
      handleProductClick,
      handlePackingUpdate,
      handlePackingDeleted,
      handleProductDeleted,
      handleSave,
      handleSearch
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

// Estilos para el botón de guardar
.q-page-sticky {
  z-index: 1000;
}
</style>