<template>
    <div class="product-list">
      <transition-group
        name="list"
        tag="div"
        class="q-gutter-y-md"
      >
        <palet-card
          v-for="(palet, index) in palets"
          :key="`palet-${index}`"
          :palet="palet"
          :palet-index="index"
          :is-selected="selectedPaletIndexes.includes(index)"
          :selected-products="selectedProducts"
          @click="handlePaletClick(index)"
          @product-click="$emit('product-click', $event)"
          @add-product="$emit('add-product', index)"
        >
          <template #actions v-if="selectedPaletIndexes.includes(index)">
            <div class="row q-gutter-sm justify-end">
              <q-btn
                flat
                round
                color="primary"
                icon="qr_code_scanner"
                @click.stop="$emit('add-product', index)"
              >
                <q-tooltip>Escanear producto</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                @click.stop="$emit('delete-palet', index)"
              >
                <q-tooltip>Eliminar palet</q-tooltip>
              </q-btn>
            </div>
          </template>
        </palet-card>
      </transition-group>
  
      <!-- Estado vacío -->
      <div v-if="palets.length === 0" class="empty-state q-pa-xl text-center">
        <q-icon name="inventory_2" size="4rem" color="grey-5" />
        <div class="text-h6 text-grey-7 q-mt-md">No hay palets disponibles</div>
        <div class="text-grey-6 q-mt-sm">Crea un nuevo palet para comenzar</div>
      </div>
  
      <!-- Loading overlay -->
      <q-inner-loading :showing="loading">
        <q-spinner-dots size="50px" color="primary" />
      </q-inner-loading>
    </div>
  </template>
  
  <script>
  import { computed } from 'vue'
  import PaletCard from './PaletCard.vue'
  
  export default {
    name: 'ProductList',
    
    components: {
      PaletCard
    },
  
    props: {
      palets: {
        type: Array,
        required: true
      },
      selectedPalet: {
        type: Number,
        default: null
      },
      selectedProducts: {
        type: Array,
        default: () => []
      },
      loading: {
        type: Boolean,
        default: false
      }
    },
  
    emits: [
      'palet-click',
      'product-click',
      'add-product',
      'delete-palet'
    ],
  
    setup(props, { emit }) {
      const selectedPaletIndexes = computed(() => {
        if (props.selectedPalet === null) return []
        return [props.selectedPalet]
      })
  
      const handlePaletClick = (index) => {
        emit('palet-click', index)
      }
  
      return {
        selectedPaletIndexes,
        handlePaletClick
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .product-list {
    position: relative;
    min-height: 200px;
  
    .empty-state {
      border: 2px dashed #e0e0e0;
      border-radius: 8px;
      margin: 16px;
    }
  }
  
  // Animaciones de la lista
  .list-move,
  .list-enter-active,
  .list-leave-active {
    transition: all 0.5s ease;
  }
  
  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    transform: translateX(-30px);
  }
  
  .list-leave-active {
    position: absolute;
  }
  </style>
  
