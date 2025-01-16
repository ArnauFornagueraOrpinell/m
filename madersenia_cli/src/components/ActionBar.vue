<template>
    <div class="action-bar">
      <transition 
        name="confirm-slide"
        enter-active-class="animated slideInLeft"
        leave-active-class="animated fadeOut slower slideOutLeft linear"
      >
        <div 
          v-if="selectedProducts.length > 0 && totalPalets > 0"
          class="action-button confirm half-width"
          @click.stop="$emit('confirm')"
        >
          CONFIRMAR: <b>{{ selectedPalets.length }}</b> PALETS
        </div>
        <div 
          v-else-if="totalPalets > 0"
          class="action-button confirm full-width"
          @click="$emit('confirm')"
        >
          CONFIRMAR: <b>{{ totalPalets }}</b> PALETS
        </div>
      </transition>
  
      <transition 
        name="delete-slide"
        enter-active-class="animated slideInLeft"
      >
        <div 
          v-if="selectedProducts.length > 0"
          class="action-button delete half-width"
          @click="$emit('delete')"
        >
          ELIMINAR: <b>{{ selectedProducts.length }}</b> 
          PRODUCTO{{ selectedProducts.length > 1 ? 'S' : '' }}
        </div>
      </transition>
    </div>
  </template>
  
  <script>
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
    emits: ['confirm', 'delete']
  }
  </script>
  
  <style lang="scss" scoped>
  .action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 56px;
    display: flex;
    z-index: 1000;
  
    .action-button {
      padding: 16px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: all 0.3s ease;
  
      b {
        font-size: 20px;
        margin: 0 8px;
      }
  
      &.confirm {
        background-color: #2e7d32;
        &:hover {
          background-color: darken(#2e7d32, 5%);
        }
      }
  
      &.delete {
        background-color: #d32f2f;
        &:hover {
          background-color: darken(#d32f2f, 5%);
        }
      }
  
      &.half-width {
        width: 50%;
      }
  
      &.full-width {
        width: 100%;
      }
    }
  }
  
  // Animaciones
  .confirm-slide-enter-active, 
  .confirm-slide-leave-active,
  .delete-slide-enter-active, 
  .delete-slide-leave-active {
    transition: transform 0.3s ease;
  }
  
  .confirm-slide-enter-from,
  .confirm-slide-leave-to {
    transform: translateX(100%);
  }
  
  .delete-slide-enter-from,
  .delete-slide-leave-to {
    transform: translateX(-100%);
  }
  </style>