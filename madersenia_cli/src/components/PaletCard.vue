<template>
    <q-card 
      :id="paletId" 
      class="palet-card q-ma-md"
      :class="{ 'selected': isSelected }"
      @click="$emit('click')"
    >
      <q-item>
        <q-item-section>
          <q-item-label class="text-h6">
            {{ paletTitle }}
          </q-item-label>
        </q-item-section>
      </q-item>
  
      <q-card-section class="q-pa-md">
        <div class="text-subtitle2">OF: {{ palet.of_group }}</div>
      </q-card-section>
  
      <q-card-section class="products-section">
        <q-list>
          <q-item 
            v-for="(product, index) in palet.products" 
            :key="index"
            @click.stop
          >
            <q-item-section>
              <ProductComponent
                v-model="palet.products[index]"
                :id="getProductId(product)"
                :class="{ 'selected': selectedProducts.includes(product) }"
                @click.stop="$emit('product-click', product)"
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
    </q-card>
  </template>
  
  <script>
  import ProductComponent from './ProductComponent.vue'
  
  export default {
    name: 'PaletCard',
    components: {
      ProductComponent
    },
    props: {
      palet: {
        type: Object,
        required: true
      },
      paletIndex: {
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
      }
    },
    computed: {
      paletId() {
        return `palet-${this.paletIndex}`
      },
      paletTitle() {
        const paletNum = this.paletIndex + 1
        const ofNum = this.palet.NUM_DOCUMENT_OF?.toUpperCase() || this.palet.of_group
        const location = this.palet.products[0]?.UBICACIO_3?.toUpperCase() || ''
        return `PALET #${paletNum}-${ofNum}${location ? '-' + location : ''}`
      }
    },
    methods: {
      getProductId(product) {
        return `#${product.NUM_DOCUMENT_OF}-${product.CODI_PRODUCTE}`
      }
    },
    emits: ['click', 'product-click', 'add-product']
  }
  </script>
  
  <style lang="scss" scoped>
  .palet-card {
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.12);
    
    &.selected {
      border: 2px solid var(--q-primary);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  </style>