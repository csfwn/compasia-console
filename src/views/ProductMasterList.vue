<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useProductStore } from "@/stores/productMaster";
import { uploadFile } from "@/api/productMaster";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "vue-sonner";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-vue-next";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const store = useProductStore();

const search = ref("");
const debouncedSearch = ref("");
let debounceTimer: any = null;

const sort = ref("");
const page = ref(1);
const file = ref<File | null>(null);
const fileInputKey = ref(0);

let pollingInterval: any = null;
const isPolling = ref(false);
let lastSnapshot = "";

const fetchData = async () => {
  const params: any = {
    page: page.value,
  };

  if (debouncedSearch.value) params.search = debouncedSearch.value;
  if (sort.value) params.sort = sort.value;

  await store.fetchProducts(params);
};

const handleSort = (column: string) => {
  if (!sort.value) {
    sort.value = `${column}|asc`;
  } else {
    const [currentCol, currentDir] = sort.value.split("|");

    if (currentCol === column) {
      sort.value = `${column}|${currentDir === "asc" ? "desc" : "asc"}`;
    } else {
      sort.value = `${column}|asc`;
    }
  }

  page.value = 1;
  fetchData();
};

const getSortState = (column: string) => {
  if (!sort.value) return "none";

  const [currentCol, currentDir] = sort.value.split("|");

  if (currentCol !== column) return "none";

  return currentDir;
};

const isActiveSort = (column: string) => {
  return sort.value.startsWith(column);
};

watch(search, (val) => {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    debouncedSearch.value = val;
    page.value = 1;
    fetchData();
  }, 400);
});

const goToPage = (p: number) => {
  page.value = p;
  fetchData();
};

const nextPage = () => {
  const last = store.products?.meta?.last_page || 1;

  if (page.value < last) {
    page.value++;
    fetchData();
  }
};

const prevPage = () => {
  if (page.value > 1) {
    page.value--;
    fetchData();
  }
};

const startPolling = () => {
  if (pollingInterval) return;

  isPolling.value = true;
  lastSnapshot = JSON.stringify(store.products.data || []);

  pollingInterval = setInterval(async () => {
    await fetchData();

    const currentSnapshot = JSON.stringify(store.products.data || []);

    if (currentSnapshot !== lastSnapshot) {
      stopPolling();
    }

    lastSnapshot = currentSnapshot;
  }, 3000);
};

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  isPolling.value = false;
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  file.value = target.files?.[0] || null;
};

const handleUpload = async () => {
  if (!file.value) {
    toast.error("Please upload file");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", file.value);

    const res = await uploadFile(formData);

    toast.success(res.data?.message || "Upload success");

    file.value = null;
    fileInputKey.value++;

    startPolling();
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Upload failed");
  }
};

onMounted(fetchData);

onUnmounted(() => {
  stopPolling();
});
</script>

<template>
  <div class="max-w-5xl mx-auto p-5 space-y-4 mt-5">

    <div class="flex items-center gap-3">
      <Input :key="fileInputKey" type="file" class="max-w-sm" @change="handleFileChange" />
      <Button size="sm" class="cursor-pointer hover:opacity-80" @click="handleUpload">
        Upload
      </Button>
    </div>

    <hr />

    <div class="flex justify-between items-center">
      <h3 class="text-md font-medium">Product Master List</h3>
      <Input v-model="search" placeholder="Search" class="w-40 h-8" />
    </div>

    <div class="border rounded-md overflow-hidden text-sm">
      <Table>
        <TableHeader>
          <TableRow class="bg-gray-100">

            <TableHead v-for="col in [
              { key: 'id', label: 'ID' },
              { key: 'product_id', label: 'Product ID' },
              { key: 'type', label: 'Types' },
              { key: 'brand', label: 'Brand' },
              { key: 'model', label: 'Model' },
              { key: 'capacity', label: 'Capacity' },
              { key: 'quantity', label: 'Quantity', center: true },
            ]" :key="col.key" @click="handleSort(col.key)" :class="[
              'cursor-pointer select-none group',
              col.center ? 'text-center' : '',
              isActiveSort(col.key) ? 'text-black font-bold' : 'text-gray-800'
            ]">
              <div class="flex items-center gap-1 " :class="col.center ? 'justify-center' : ''">

                <span>{{ col.label }}</span>

                <span class="opacity-60 group-hover:opacity-100 transition">
                  <ArrowUpDown v-if="getSortState(col.key) === 'none'" class="w-3.5 h-3.5" />
                  <ArrowUp v-else-if="getSortState(col.key) === 'asc'" class="w-3.5 h-3.5 text-black" />
                  <ArrowDown v-else class="w-3.5 h-3.5 text-black" />
                </span>

              </div>
            </TableHead>

          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="item in store.products.data" :key="item.id" class="hover:bg-gray-50 transition">
            <TableCell>{{ item.id }}</TableCell>
            <TableCell>{{ item.product_id }}</TableCell>
            <TableCell>{{ item.type }}</TableCell>
            <TableCell>{{ item.brand }}</TableCell>
            <TableCell>{{ item.model }}</TableCell>
            <TableCell>{{ item.capacity }}</TableCell>
            <TableCell class="text-center font-medium">
              {{ item.quantity }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex items-center justify-between mt-4">
      <div class="text-sm text-gray-500"> Showing {{ store.products.data?.length || 0 }} of {{
        store.products?.meta?.total || 0 }} </div>
      <div>
        <Pagination :page="page" :items-per-page="store.products?.meta?.per_page" :total="store.products?.meta?.total">
          <PaginationContent v-slot="{ items }" class="flex items-center gap-1">
            <PaginationPrevious @click="prevPage" :disabled="page === 1" />
            <template v-for="(item, index) in items" :key="index">
              <PaginationItem v-if="item.type === 'page'" :value="item.value" :is-active="item.value === page"
                @click="goToPage(item.value)"> {{ item.value }} </PaginationItem>
            </template>
            <PaginationNext @click="nextPage" :disabled="page >= (store.products?.meta?.last_page || 1)" />
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  </div>
</template>