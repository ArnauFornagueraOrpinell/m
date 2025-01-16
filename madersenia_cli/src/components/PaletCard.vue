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
              OF: {{ packing.OF_GROUP }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row items-center">
              <q-chip color="primary" text-color="white" size="sm" class="q-mr-sm">
                {{ packing.products.length }} productos
              </q-chip>
              <q-btn
                v-if="deletable"
                flat
                round
                dense
                color="negative"
                icon="delete"
                @click.stop="confirmDelete"
              >
                <q-tooltip>Eliminar packing</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
        
        <!-- Slot para acciones -->
        <slot name="actions"></slot>
      </div>
  
      <!-- Contenido expandible -->
      <q-slide-transition>
        <div v-show="isExpanded" @click.stop>
          <q-separator />
          <q-card-section class="products-section">
            <q-list>
              <q-item 
                v-for="(product, index) in packing.products" 
                :key="index"
                @click.stop
              >
                <q-item-section>
                  <ProductComponent
                    :model-value="packing.products[index]"
                    @update:model-value="$emit('update:product', { index, value: $event })"
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
  
            <q-card 
              v-if="isSelected"
              class="add-product-card q-ma-sm"
              @click.stop="$emit('add-product')"
            >
              <q-card-section class="row items-center justify-center">
                <q-icon name="add" size="24px" color="white" />
                <span class="text-white q-ml-sm">Añadir Producto</span>
              </q-card-section>
            </q-card>
          </q-card-section>
        </div>
      </q-slide-transition>
  
      <!-- Diálogo de confirmación de eliminación -->
      <q-dialog v-model="showDeleteDialog" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar icon="warning" color="negative" text-color="white" />
            <span class="q-ml-sm">¿Está seguro de que desea eliminar este packing y todos sus productos relacionados?</span>
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
import { ref } from 'vue'
import ProductComponent from './ProductComponent.vue'
import { useQuasar } from 'quasar'

const API_URL = 'https://192.168.0.197:3002' // Base URL for API calls

export default {
  name: 'PackingCard',
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
  setup(props, { emit }) {
    const $q = useQuasar()
    const isExpanded = ref(false)
    const showDeleteDialog = ref(false)

    const toggleExpand = (event) => {
      event.stopPropagation()
      isExpanded.value = !isExpanded.value
    }

    const handleCardClick = () => {
      emit('click')
    }

    const confirmDelete = () => {
      showDeleteDialog.value = true
    }

    const deletePacking = async () => {
      try {
        const response = await fetch(`${API_URL}/delete-packing/${props.packing.PACKING_ID}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Error al eliminar el packing');
        }

        $q.notify({
          type: 'positive',
          message: 'Packing eliminado correctamente'
        });
        emit('deleted', props.packingIndex);
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Error al eliminar el packing',
          caption: error.message
        });
      }
    }

    const handleProductDeleted = (productIndex) => {
      emit('product-deleted', productIndex)
    }

    return {
      isExpanded,
      showDeleteDialog,
      toggleExpand,
      handleCardClick,
      confirmDelete,
      deletePacking,
      handleProductDeleted
    }
  },
  computed: {
    packingId() {
      return `packing-${this.packingIndex}`
    },
    packingTitle() {
      const packingNum = this.packingIndex + 1
      const ofNum = this.packing.OF_GROUP?.toUpperCase()
      const location = this.packing.products[0]?.UBICACIO_3?.toUpperCase() || ''
      return `PACKING #${packingNum}-${ofNum}${location ? '-' + location : ''}`
    }
  },
  methods: {
    getProductId(product) {
      return `#${product.PRODUCT_ID}`
    }
  },
  emits: [
    'click', 
    'product-click', 
    'add-product', 
    'update:product', 
    'deleted',
    'product-deleted'
  ]
}
</script>

<style lang="scss" scoped>
/* Los estilos se mantienen exactamente igual */
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