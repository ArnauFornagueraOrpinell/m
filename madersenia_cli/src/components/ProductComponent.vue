<template>
  <q-card 
    class="product-card q-ma-md" 
    :id="id"
    :class="{'editable': editable}"
  >
    <!-- Header con información principal -->
    <q-card-section class="bg-primary text-white">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6">
          <div class="text-h6">Producto #{{ model.CODI_PRODUCTE }}</div>
          <div class="text-subtitle2">Ref: {{ model.PRODUCT_ID }}</div>
        </div>
        <div class="col-12 col-sm-6 text-right">
          <q-badge 
            :color="editable ? 'positive' : 'grey'" 
            class="q-pa-sm"
          >
            {{ editable ? 'Modo Edición' : 'Solo Lectura' }}
          </q-badge>
        </div>
      </div>
    </q-card-section>

    <!-- Contenido principal -->
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

    const updateValue = (key) => {
      if (props.editable) {
        emit('update:modelValue', { ...model.value, [key]: model.value[key] });
      }
    }

    watch(() => props.modelValue, (newVal) => {
      model.value = newVal;
    });

    return {
      model,
      updateValue
    }
  }
};
</script>

<style scoped>
.product-card {
  transition: all 0.3s ease;
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
</style>