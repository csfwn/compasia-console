import { defineStore } from "pinia";
import { getProducts } from "@/api/productMaster";

export const useProductStore = defineStore("product", {
  state: () => ({
    products: {},
    loading: false,
  }),

  actions: {
    async fetchProducts(params: any) {
      this.loading = true;
      const res = await getProducts(params);
      this.products = res.data;
      this.loading = false;
    },
  },
});