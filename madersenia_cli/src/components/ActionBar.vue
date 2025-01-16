<template>
    <div class="action-bar">
      <div class="actions-container">
        <!-- Botón de eliminar -->
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
        >
          <q-btn
            v-if="selectedProducts.length > 0"
            class="delete-button"
            unelevated
            :class="{ 'half-width': showBothButtons, 'full-width': !showBothButtons }"
            color="negative"
            @click="$emit('delete')"
          >
            <div class="button-content">
              <q-icon name="delete" size="24px" class="q-mr-sm" />
              <span>
                ELIMINAR: <b>{{ selectedProducts.length }}</b> 
                PRODUCTO{{ selectedProducts.length > 1 ? 'S' : '' }}
              </span>
            </div>
          </q-btn>
        </transition>
  
        <!-- Botón de confirmar -->
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
        >
          <q-btn
            v-if="showConfirmButton"
            class="confirm-button"
            unelevated
            :class="{ 'half-width': showBothButtons, 'full-width': !showBothButtons }"
            color="positive"
            @click="$emit('confirm')"
          >
            <div class="button-content">
              <q-icon name="check_circle" size="24px" class="q-mr-sm" />
              <span>
                CONFIRMAR: <b>{{ confirmCount }}</b> 
                {{ confirmCount > 1 ? 'PALETS' : 'PALET' }}
              </span>
            </div>
          </q-btn>
        </transition>
      </div>
    </div>
  </template>
  
  <script>
  import { computed } from 'vue'
  
  export default {
    name: 'ActionBar',
    
    props: {
      selectedProducts: {
        type: Array,
        default: () => []
      },
      selectedPalets: {
        type: Array,
        default: () => []
      },
      totalPalets: {
        type: Number,
        required: true
      }
    },
  
    setup(props) {
      const showConfirmButton = computed(() => props.totalPalets > 0)
      const showBothButtons = computed(() => props.selectedProducts.length > 0 && props.totalPalets > 0)
      const confirmCount = computed(() => props.selectedPalets.length || props.totalPalets)
  
      return {
        showConfirmButton,
        showBothButtons,
        confirmCount
      }
    },
  
    emits: ['confirm', 'delete']
  }
  </script>
  
  <style lang="scss" scoped>
  .action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: white;
    z-index: 1000;
    padding: 8px;
    box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
  
    .actions-container {
      display: flex;
      gap: 8px;
      height: 100%;
      
      .q-btn {
        font-size: 14px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        height: 100%;
  
        &.half-width {
          width: 50%;
        }
  
        &.full-width {
          width: 100%;
        }
  
        .button-content {
          display: flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
        }
  
        b {
          font-size: 18px;
          font-weight: 600;
          margin: 0 4px;
        }
  
        &:hover {
          transform: translateY(-1px);
        }
  
        &:active {
          transform: translateY(0);
        }
      }
    }
  }
  
  // Hacer las animaciones más suaves
  .animated {
    animation-duration: 0.3s;
  }
  
  .fadeIn {
    animation-name: fadeIn;
  }
  
  .fadeOut {
    animation-name: fadeOut;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(10px);
    }
  }
  </style>