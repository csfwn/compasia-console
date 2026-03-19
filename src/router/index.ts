import { createRouter, createWebHistory } from "vue-router";

import ProductMasterList from "@/views/ProductMasterList.vue";

const routes = [
  { path: "/", component: ProductMasterList },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;