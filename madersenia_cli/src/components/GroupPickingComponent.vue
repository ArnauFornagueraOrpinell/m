<template>
  <q-card class="kanban-card" style="margin: 10px 0px 10px 0px;">
    <q-card-section >
      <q-item>
        <q-item-section>
          <q-item-label>Nombre del Grupo</q-item-label>
          <q-item-label caption>{{ $props.groupName }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item-label>Cantidad de Pickings</q-item-label>
          <q-item-label caption>{{ pickings && pickings.length }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-card-section>
    <q-card-section v-show="showPickings">
      <PickingComponent
        v-for="(picking, index) in pickings || []"
        :key="index"
        :name="picking.NAME"
        :ref_piece="picking.ref_piece"
        :description="picking.description"
        :width="picking.width"
        :height="picking.height"
        :thick="picking.thick"
        :raw_material="picking.raw_material"
        :building="picking.building"
        :plant="picking.plant"
        :room="picking.room"
      />
    </q-card-section>
  </q-card>
</template>

<script >

// import { ref } from 'vue';
// import PickingComponent from 'components/PickingComponent.vue';

defineProps({
  groupName: String,
  pickings: Array,
});

</script>