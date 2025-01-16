<template>
    <div class="of-selector q-pa-md">
      <div class="row justify-center items-center q-col-gutter-md">
        <div class="col-12 col-sm-6 col-md-4">
          <multiselect
            v-model="selected"
            :options="options"
            placeholder="Selecciona una OF"
            label="name"
            track-by="name"
            class="of-multiselect"
            @input="handleSelection"
          >
            <template v-slot:noOptions>
              No hay órdenes de fabricación disponibles
            </template>
          </multiselect>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import Multiselect from 'vue-multiselect'
  import 'vue-multiselect/dist/vue-multiselect.css'
  
  export default {
    name: 'OfSelector',
    components: {
      Multiselect
    },
    props: {
      modelValue: {
        type: Object,
        default: () => ({})
      },
      options: {
        type: Array,
        required: true
      }
    },
    emits: ['update:modelValue', 'selection'],
    computed: {
      selected: {
        get() {
          return this.modelValue
        },
        set(value) {
          this.$emit('update:modelValue', value)
        }
      }
    },
    methods: {
      handleSelection(selected) {
        this.$emit('selection', selected)
      }
    }
  }
  </script>
  
  <style lang="scss">
  .of-selector {
    .of-multiselect {
      .multiselect__tags {
        min-height: 40px;
        padding: 8px 40px 0 8px;
        border-radius: 4px;
        border: 1px solid rgba(0, 0, 0, 0.24);
      }
      
      .multiselect__single {
        padding-left: 5px;
        font-size: 14px;
      }
      
      .multiselect__placeholder {
        padding-left: 5px;
        margin-bottom: 0;
        color: #757575;
      }
      
      .multiselect__input {
        border-radius: 4px;
        border: none;
        background: transparent;
      }
      
      .multiselect__content-wrapper {
        border-radius: 0 0 4px 4px;
        border: 1px solid rgba(0, 0, 0, 0.24);
      }
    }
  }
  </style>