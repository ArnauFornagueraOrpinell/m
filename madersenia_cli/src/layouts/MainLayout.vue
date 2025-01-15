<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated style="color: #AC162C;">
      <q-toolbar style="background-color: white;">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          style="color: #AC162C;"
        />


        <q-toolbar-title>
          <q-img
          src="~assets/logo.png"
          style="width: 10%; height: auto; max-height: 100px;"
        />
        </q-toolbar-title>
        <div id="search-toolbar">
        </div>


        <div>Madersenia v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      overlay
      style="color: white; background-color: #AC162C;"
    >
      <q-list>
        <q-item-label
          header
          @click="toggleLeftDrawer"
          class="hoverable"
          style="color: white;"
        >
          Menú
        </q-item-label>
        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
          class="hoverable"
          style="color: white;"
        />

      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EssentialLink, { EssentialLinkProps } from 'components/EssentialLink.vue';


let showSearch = false;
console.log(showSearch);

// const searchModel = ref('');

// const search = () => {
//     showSearch = window.location.href.includes('pickings');
// }

// computed
// window.addEventListener('popstate', search);
// window.addEventListener('pushstate', search);
// window.addEventListener('replacestate', search);

// console.log($route.name);
defineOptions({
  name: 'MainLayout'
});

const linksList: EssentialLinkProps[] = [
{
    title: 'Database',
    caption: 'Administrar la base de datos',
    icon: 'code',
    link: '#/database'
  },
  {
    title: 'Escanear Palets',
    caption: '',
    icon: 'record_voice_over',
    link: '/scan'
  },
  {
    title: 'Administrar Palets',
    caption: '',
    icon: 'record_voice_over',
    link: '/pickings'
  },
  {
    title: 'Registrar Expedicion',
    caption: '',
    icon: 'record_voice_over',
    link: '/scan-expedition'
  },
  {
    title: 'Administrar Expediciones',
    caption: '',
    icon: 'record_voice_over',
    link: '/expeditions'
  },
  {
    title: 'Salir',
    caption: '',
    icon: '',
    link: '/salir'
    
  }

];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

// function close() {
//   window.close();
// }

</script>

<style scoped>
.hoverable {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.hoverable:hover {
  background-color: #f0f0f0;
  color: black !important ;
}
</style>