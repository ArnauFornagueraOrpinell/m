import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/database',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/DatabasePage.vue') }],
  },
  {
    path: '/scan',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ScanPage.vue') }],
  },
  {
    path: '/pickings',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/PickingPage.vue') }],
  },
  {
    path: '/salir',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ExitPage.vue') }],
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
