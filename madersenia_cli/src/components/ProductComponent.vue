<template>
  <q-card class="kanban-card" style="margin: 10px 0px 10px 0px;" :id="id">
    <q-card-section>
      <q-item>
        <q-item-section>
          <q-item-label>CODI_PRODUCTE</q-item-label>
          <q-input
            v-model="model.CODI_PRODUCTE"
            @input="updateValue('CODI_PRODUCTE')"
            type="number"
            dense
            :readonly="!editable"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>Referencia</q-item-label>
          <q-input
            v-model="model.PRODUCT_ID"
            @input="updateValue('PRODUCT_ID')"
            dense
            :readonly="!editable"
          />
        
        </q-item-section>
      </q-item>
    </q-card-section>
    <q-card-section>
      <q-item>
        <q-item-section>
          <q-item-label>Descripción</q-item-label>
          <q-input
            v-model="model.DESCRIPCIO"
            @input="updateValue('DESCRIPCIO')"
            dense
            :readonly="!editable"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>ANCHO</q-item-label>
          <q-input
            v-model="model.ANCHO"
            @input="updateValue('ANCHO')"
            type="number"
            dense
            :readonly="!editable"
          />
        </q-item-section>
      </q-item>
    </q-card-section>
    <q-card-section>
      <q-item>
        <q-item-section>
          <q-item-label>LARGO</q-item-label>
          <q-input
            v-model="model.LARGO"
            @input="updateValue('LARGO')"
            type="number"
            dense
            :readonly="!editable"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>GRUESO</q-item-label>
          <q-input
            v-model="model.GRUESO"
            @input="updateValue('GRUESO')"
            type="number"
            dense
            :readonly="!editable"
          />
        </q-item-section>
      </q-item>
    </q-card-section>
    <q-card-section>
      <q-item>
        <q-item-section>
          <q-item-label>Material</q-item-label>
          <q-input
            v-model="model.TIPUS_EMBALATGE"
            @input="updateValue('TIPUS_EMBALATGE')"
            dense
            :readonly="!editable"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>Edificio</q-item-label>
          <q-input
            v-model="model.UBICACIO_1"
            @input="updateValue('UBICACIO_1')"
            dense
            :readonly="!editable"
          />
        </q-item-section>
      </q-item>
    </q-card-section>
    <q-card-section>
      <q-item>
        <q-item-section>
          <q-item-label>Planta</q-item-label>
          <q-input
            v-model="model.UBICACIO_2"
            @input="updateValue('UBICACIO_2')"
            dense
            :readonly="!editable"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>Habitación</q-item-label>
          <q-input
            v-model="model.UBICACIO_3"
            @input="updateValue('UBICACIO_3')"
            dense
            :readonly="!editable"
          />
        </q-item-section>
      </q-item>
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
        this.$emit('update:modelValue', { ...model.value, [key]: model.value[key] });
      }
    }

    watch(model, () => {
      if (props.editable) {
        emit('update:modelValue', model.value);
      }
    });

    return {
      model,
      updateValue
    }
  }
};
</script>

<style scoped>
/* Estilos personalizados aquí si es necesario */
</style>
