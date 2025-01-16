<template>
  <q-card 
    class="product-card q-ma-md" 
    :id="id"
    :class="{'editable': editable, 'collapsed': isCollapsed}"
    flat
    bordered
  >
    <!-- Header con información principal -->
    <div 
      class="bg-primary text-white product-header"
      :class="{ 'collapsed': isCollapsed }"
    >
      <div class="row items-center q-col-gutter-md">
        <!-- Toggle collapse button -->
        <div class="col-auto">
          <q-btn
            flat
            round
            dense
            :icon="isCollapsed ? 'arrow_right' : 'arrow_drop_down'"
            @click="toggleCollapse"
          />
        </div>
        <div class="col">
          <div class="row q-col-gutter-md items-center">
            <div class="col-12 col-sm-6">
              <div class="text-h6">Producto #{{ model.CODI_PRODUCTE }}</div>
              <div class="text-subtitle2" v-if="!isCollapsed">Ref: {{ model.PRODUCT_ID }}</div>
            </div>
            <div class="col-12 col-sm-6 text-right" v-if="!isCollapsed">
              <q-badge 
                :color="editable ? 'positive' : 'grey'" 
                class="q-pa-sm"
              >
                {{ editable ? 'Modo Edición' : 'Solo Lectura' }}
              </q-badge>
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
  </q-card>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  props: {
    editable: {
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
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = ref(props.modelValue);
    const isCollapsed = ref(false);

    const updateValue = (key) => {
      if (props.editable) {
        emit('update:modelValue', { ...model.value, [key]: model.value[key] });
      }
    }

    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value;
    }

    watch(() => props.modelValue, (newVal) => {
      model.value = newVal;
    });

    return {
      model,
      isCollapsed,
      updateValue,
      toggleCollapse
    }
  }
};
</script>

<style scoped>
.product-card {
  transition: all 0.3s ease;
  border: 0;
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

/* Ajuste para que solo se vea la barra azul cuando está colapsado */
.collapsed .product-header {
  margin-bottom: -1px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

/* Estilo específico para el texto cuando está colapsado */
.collapsed .text-h6 {
  font-size: 1rem;
  margin: 0;
  line-height: 1.2;
}

/* Estilos para el contenido expandido */
.product-card:not(.collapsed) .product-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
</style>