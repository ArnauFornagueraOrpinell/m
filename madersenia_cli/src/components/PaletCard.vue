# PaletCard.vue

<template>
  <q-card 
    :id="packingId" 
    class="packing-card q-ma-md q-mt-lg"
    :class="{ 'selected': isSelected }"
    @click="handleCardClick"
  >
    <!-- Header siempre visible -->
    <div class="packing-header">
      <q-item>
        <q-item-section avatar>
          <q-btn
            flat
            round
            dense
            :icon="isExpanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right'"
            @click.stop="toggleExpand"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-h6">
            {{ packingTitle }}
          </q-item-label>
          <q-item-label caption>
            OF: {{ packingData.OF_GROUP }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row items-center">
            <q-chip color="primary" text-color="white" size="sm" class="q-mr-sm">
              {{ packingData.products.length }} productos
            </q-chip>
            <q-btn
              v-if="deletable"
              flat
              round
              dense
              color="negative"
              icon="delete"
              @click.stop="handleDeletePacking"
            >
              <q-tooltip>Eliminar packing</q-tooltip>
            </q-btn>
          </div>
        </q-item-section>
      </q-item>
    </div>

    <!-- Contenido expandible -->
    <q-slide-transition>
      <div v-show="isExpanded" @click.stop>
        <q-separator />
        <q-card-section class="products-section">
          <q-list>
            <q-item 
              v-for="(product, index) in packingData.products" 
              :key="getProductId(product)"
              @click.stop
            >
              <q-item-section>
                <ProductComponent
                  :model-value="product"
                  @update:model-value="(newValue) => handleProductUpdate(index, newValue)"
                  :id="getProductId(product)"
                  :class="{ 'selected': selectedProducts.includes(product) }"
                  @click.stop="$emit('product-click', product)"
                  :editable="editable"
                  :deletable="deletable"
                  @deleted="handleProductDeleted(index)"
                />
              </q-item-section>
            </q-item>
          </q-list>

          <!-- Opción para añadir nuevo producto cuando está seleccionado -->
          <q-card 
            v-if="isSelected && editable"
            class="add-product-card q-ma-sm"
            @click.stop="handleAddProduct"
          >
            <q-card-section class="row items-center justify-center">
              <q-icon name="add" size="24px" color="white" />
              <span class="text-white q-ml-sm">Añadir Producto</span>
            </q-card-section>
          </q-card>
        </q-card-section>
      </div>
    </q-slide-transition>

    <!-- Dialog para eliminar packing -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">
            ¿Está seguro de que desea eliminar este packing y todos sus productos?
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="deletePacking" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script>
import { ref, computed, watch } from 'vue'
import ProductComponent from './ProductComponent.vue'
import { useQuasar } from 'quasar'

const API_URL = 'https://192.168.0.197:3002'

export default {
  name: 'PaletCard',
  
  components: {
    ProductComponent
  },

  props: {
    packing: {
      type: Object,
      required: true
    },
    packingIndex: {
      type: Number,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    selectedProducts: {
      type: Array,
      default: () => []
    },
    editable: {
      type: Boolean,
      default: false
    },
    deletable: {
      type: Boolean,
      default: false
    }
  },

  emits: [
    'click',
    'product-click',
    'update:packing',
    'deleted',
    'product-deleted'
  ],

  setup(props, { emit }) {
    const $q = useQuasar()
    const isExpanded = ref(false)
    const showDeleteDialog = ref(false)
    const packingData = ref({ ...props.packing })

    // Watch for external changes to packing prop
    watch(() => props.packing, (newValue) => {
      packingData.value = { ...newValue }
    }, { deep: true })

    const toggleExpand = (event) => {
      event.stopPropagation()
      isExpanded.value = !isExpanded.value
    }

    const handleCardClick = () => {
      emit('click')
    }

    const handleProductUpdate = (index, updatedProduct) => {
      const updatedProducts = [...packingData.value.products]
      updatedProducts[index] = updatedProduct
      
      const updatedPacking = {
        ...packingData.value,
        products: updatedProducts
      }
      
      packingData.value = updatedPacking
      emit('update:packing', updatedPacking)
    }

    const handleProductDeleted = async (productIndex) => {
      try {
        const productToDelete = packingData.value.products[productIndex]
        const response = await fetch(`${API_URL}/delete-product/${productToDelete.PRODUCT_ID}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error('Error al eliminar el producto')
        }

        emit('product-deleted', productIndex)
        
        $q.notify({
          type: 'positive',
          message: 'Producto eliminado correctamente'
        })
      } catch (error) {
        console.error('Error deleting product:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al eliminar el producto',
          caption: error.message
        })
      }
    }

    const handleDeletePacking = () => {
      showDeleteDialog.value = true
    }

    const deletePacking = async () => {
      try {
        const response = await fetch(`${API_URL}/delete-packing/${packingData.value.PACKING_ID}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error('Error al eliminar el packing')
        }

        emit('deleted')
        
        $q.notify({
          type: 'positive',
          message: 'Packing eliminado correctamente'
        })
      } catch (error) {
        console.error('Error deleting packing:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al eliminar el packing',
          caption: error.message
        })
      }
    }

    const handleAddProduct = () => {
      // Template for new product
      const newProduct = {
        CODI_PRODUCTE: '',
        PRODUCT_ID: '',
        DESCRIPCIO: '',
        ANCHO: '',
        LARGO: '',
        GRUESO: '',
        TIPUS_EMBALATGE: '',
        UBICACIO_1: '',
        UBICACIO_2: '',
        UBICACIO_3: ''
      }

      const updatedPacking = {
        ...packingData.value,
        products: [...packingData.value.products, newProduct]
      }

      packingData.value = updatedPacking
      emit('update:packing', updatedPacking)
    }

    return {
      isExpanded,
      showDeleteDialog,
      packingData,
      toggleExpand,
      handleCardClick,
      handleProductUpdate,
      handleProductDeleted,
      handleDeletePacking,
      deletePacking,
      handleAddProduct
    }
  },

  computed: {
    packingId() {
      return `packing-${this.packingIndex}`
    },
    
    packingTitle() {
      const packingNum = this.packingIndex + 1
      const ofNum = this.packingData.OF_GROUP?.toUpperCase()
      const location = this.packingData.products[0]?.UBICACIO_3?.toUpperCase() || ''
      return `PACKING #${packingNum}-${ofNum}${location ? '-' + location : ''}`
    }
  },

  methods: {
    getProductId(product) {
      return `product-${product.PRODUCT_ID || 'new'}`
    }
  }
}
</script>

<style lang="scss" scoped>
.packing-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.12);
  
  &.selected {
    border: 2px solid var(--q-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .packing-header {
    cursor: pointer;
    &:hover {
      background: rgba(0,0,0,0.03);
    }
  }

  .add-product-card {
    background-color: #1e90ff;
    transition: all 0.2s ease;
    cursor: pointer;
    min-height: 56px;

    &:hover {
      background-color: darken(#1e90ff, 10%);
      transform: translateY(-1px);
    }
  }

  .products-section {
    max-height: 500px;
    overflow-y: auto;
  }
}

.q-slide-transition-enter-active,
.q-slide-transition-leave-active {
  transition: all 0.3s ease;
}

.q-slide-transition-enter-from,
.q-slide-transition-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>