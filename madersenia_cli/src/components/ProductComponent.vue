<template>
  <q-card 
    class="product-card q-ma-md" 
    :id="id"
    :class="{
      'editable': editable, 
      'collapsed': isCollapsed,
      'selected': isSelected
    }"
    flat
    bordered
    @click="handleCardClick"
  >
    <!-- Header con información principal -->
    <div 
      class="bg-primary text-white product-header"
      :class="{ 'collapsed': isCollapsed }"
    >
      <div class="row items-center q-pa-sm">
        <!-- Toggle collapse button -->
        <div class="col-auto">
          <q-btn
            flat
            round
            dense
            :icon="isCollapsed ? 'arrow_right' : 'arrow_drop_down'"
            @click.stop="toggleCollapse"
          />
        </div>
        <div class="col">
          <div class="row items-center justify-between">
            <div class="col-grow">
              <div class="text-h6 q-my-none">Producto #{{ model.CODI_PRODUCTE }}</div>
              <div class="text-subtitle2 q-my-none" v-if="!isCollapsed">Ref: {{ model.PRODUCT_ID }}</div>
            </div>
            <div class="col-auto row items-center" v-if="!isCollapsed">
              <q-badge 
                :color="editable ? 'positive' : 'grey'" 
                class="q-pa-sm q-mr-sm"
              >
                {{ editable ? 'Modo Edición' : 'Solo Lectura' }}
              </q-badge>
              <q-btn
                v-if="deletable"
                flat
                round
                dense
                color="negative"
                icon="delete"
                class="q-ml-sm"
                @click.stop="confirmDelete"
              >
                <q-tooltip>Eliminar producto</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido principal - Collapsible -->
    <q-slide-transition>
      <div v-show="!isCollapsed">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- Identificación del producto -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="model.CODI_PRODUCTE"
                @input="updateValue('CODI_PRODUCTE')"
                type="number"
                label="CODI_PRODUCTE"
                dense
                outlined
                :readonly="!editable"
                class="q-mb-md"
              />
              <q-input
                v-model="model.PRODUCT_ID"
                @input="updateValue('PRODUCT_ID')"
                label="Referencia"
                dense
                outlined
                :readonly="!editable"
                class="q-mb-md"
              />
            </div>

            <!-- Descripción -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="model.DESCRIPCIO"
                @input="updateValue('DESCRIPCIO')"
                label="Descripción"
                type="textarea"
                dense
                outlined
                :readonly="!editable"
                class="q-mb-md"
              />
            </div>

            <!-- Dimensiones -->
            <div class="col-12">
              <q-card-section class="text-subtitle2 q-pb-none">
                Dimensiones
              </q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model="model.ANCHO"
                    @input="updateValue('ANCHO')"
                    type="number"
                    label="Ancho"
                    dense
                    outlined
                    :readonly="!editable"
                    class="q-mb-md"
                  >
                    <template v-slot:append>
                      <div class="text-grey-7">mm</div>
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model="model.LARGO"
                    @input="updateValue('LARGO')"
                    type="number"
                    label="Largo"
                    dense
                    outlined
                    :readonly="!editable"
                    class="q-mb-md"
                  >
                    <template v-slot:append>
                      <div class="text-grey-7">mm</div>
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model="model.GRUESO"
                    @input="updateValue('GRUESO')"
                    type="number"
                    label="Grueso"
                    dense
                    outlined
                    :readonly="!editable"
                    class="q-mb-md"
                  >
                    <template v-slot:append>
                      <div class="text-grey-7">mm</div>
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Ubicación y embalaje -->
            <div class="col-12">
              <q-card-section class="text-subtitle2 q-pb-none">
                Ubicación y Embalaje
              </q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="model.TIPUS_EMBALATGE"
                    @input="updateValue('TIPUS_EMBALATGE')"
                    label="Tipus Embalatge"
                    dense
                    outlined
                    :readonly="!editable"
                    class="q-mb-md"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="model.UBICACIO_1"
                    @input="updateValue('UBICACIO_1')"
                    label="Edificio"
                    dense
                    outlined
                    :readonly="!editable"
                    class="q-mb-md"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="model.UBICACIO_2"
                    @input="updateValue('UBICACIO_2')"
                    label="Planta"
                    dense
                    outlined
                    :readonly="!editable"
                    class="q-mb-md"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="model.UBICACIO_3"
                    @input="updateValue('UBICACIO_3')"
                    label="Habitación"
                    dense
                    outlined
                    :readonly="!editable"
                    class="q-mb-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </div>
    </q-slide-transition>

    <!-- Diálogo de confirmación de eliminación -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">¿Está seguro de que desea eliminar este producto?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="deleteProduct" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script>
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';

const API_URL = 'https://192.168.0.197:3002'; // Base URL for API calls

export default {
  props: {
    editable: {
      type: Boolean,
      required: false,
      default: false
    },
    deletable: {
      type: Boolean,
      required: false,
      default: false
    },
    id: {
      type: Number,
      required: true
    },
    modelValue: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue', 'selected', 'deselected', 'deleted'],
  setup(props, { emit }) {
    const $q = useQuasar();
    const model = ref(props.modelValue);
    const isCollapsed = ref(false);
    const isSelected = ref(false);
    const showDeleteDialog = ref(false);

    const updateValue = (key) => {
      if (props.editable) {
        emit('update:modelValue', { ...model.value, [key]: model.value[key] });
      }
    }

    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value;
    }

    const handleCardClick = () => {
      isSelected.value = !isSelected.value;
      if (isSelected.value) {
        emit('selected', props.id);
      } else {
        emit('deselected', props.id);
      }
    }

    const confirmDelete = () => {
      showDeleteDialog.value = true;
    }

    const deleteProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/delete-product/${model.value.PRODUCT_ID}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Error al eliminar el producto');
        }

        $q.notify({
          type: 'positive',
          message: 'Producto eliminado correctamente'
        });
        emit('deleted', props.id);
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Error al eliminar el producto',
          caption: error.message
        });
      }
    }

    watch(() => props.modelValue, (newVal) => {
      model.value = newVal;
    });

    return {
      model,
      isCollapsed,
      isSelected,
      showDeleteDialog,
      updateValue,
      toggleCollapse,
      handleCardClick,
      confirmDelete,
      deleteProduct
    }
  }
};
</script>

<style scoped>
/* Los estilos se mantienen exactamente igual */
.product-card {
  transition: all 0.3s ease;
  border: 0;
  cursor: pointer;
}

.product-card.selected {
  outline: 2px solid var(--q-primary);
  background-color: rgba(var(--q-primary), 0.05);
}

.product-card.editable {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.product-card.editable:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

@media (max-width: 600px) {
  .product-card {
    margin: 8px !important;
  }
  
  .text-right {
    text-align: left !important;
    margin-top: 8px;
    margin-right: 8px;
  }
}

.product-card {
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.product-card.collapsed {
  background: transparent;
  border: none;
}

.product-card.collapsed :deep(.q-card__section) {
  padding: 0;
}

.collapsed .product-header {
  margin: 0;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.text-h6 {
  line-height: 1.2;
  font-size: 1.15rem;
}

.product-card:not(.collapsed) .product-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
</style>