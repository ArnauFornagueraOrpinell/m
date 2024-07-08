<template>
  <q-card class="kanban-card" style="margin: 10px 0px 10px 0px;" :id="id">
    <q-card-section>
      <q-item>
        <q-item-section>
          <q-item-label>Nombre</q-item-label>
          <q-input
            v-model="model.width"
            @input="updateValue('width')"
            type="number"
            dense
            :readonly="!editable"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>Referencia</q-item-label>
          <q-input
            v-model="model.ref_piece"
            @input="updateValue('ref_piece')"
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
            v-model="model.description"
            @input="updateValue('description')"
            dense
            :readonly="!editable"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>Ancho</q-item-label>
          <q-input
            v-model="model.width"
            @input="updateValue('width')"
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
          <q-item-label>Alto</q-item-label>
          <q-input
            v-model="model.height"
            @input="updateValue('height')"
            type="number"
            dense
            :readonly="!editable"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>Grosor</q-item-label>
          <q-input
            v-model="model.thick"
            @input="updateValue('thick')"
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
            v-model="model.raw_material"
            @input="updateValue('raw_material')"
            dense
            :readonly="!editable"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>Edificio</q-item-label>
          <q-input
            v-model="model.building"
            @input="updateValue('building')"
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
            v-model="model.plant"
            @input="updateValue('plant')"
            dense
            :readonly="!editable"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>Habitación</q-item-label>
          <q-input
            v-model="model.room"
            @input="updateValue('room')"
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
