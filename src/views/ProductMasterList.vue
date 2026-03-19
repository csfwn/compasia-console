<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useProductStore } from "@/stores/productMaster";
import { uploadFile } from "@/api/productMaster";

// shadcn
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "vue-sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const store = useProductStore();

const search = ref("");
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

  if (search.value) {
    params.search = search.value;
  }

  await store.fetchProducts(params);
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
    const message = res.data?.message || "Upload success";

    toast.success(message);

    file.value = null;
    fileInputKey.value++;

    startPolling();

  } catch (error: any) {
    const msg =
      error?.response?.data?.message || "Upload failed";

    toast.error(msg);
  }
};

const nextPage = () => {
  const lastPage = store.products?.meta?.last_page || 1;

  if (page.value < lastPage) {
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

onMounted(fetchData);

onUnmounted(() => {
  stopPolling();
});
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 space-y-4 mt-15">
    <div class="flex items-center gap-3">
      <Input :key="fileInputKey" type="file" class="max-w-sm" @change="handleFileChange" />

      <Button size="sm" @click="handleUpload">
        Upload
      </Button>
    </div>
    <hr class="my-2" />
    <div class="flex justify-between items-center">
      <h3 class="text-md font-medium">Product Master List</h3>

      <div class="flex items-center gap-2 text-sm">
        <span>Search:</span>
        <Input v-model="search" class="w-36 h-8" @input="fetchData" />
      </div>
    </div>

    <!-- Table -->
    <div class="border rounded-md overflow-hidden text-sm">
      <Table>
        <TableHeader>
          <TableRow class="bg-gray-100">
            <TableHead class="w-12">No.</TableHead>
            <TableHead>Product ID</TableHead>
            <TableHead>Types</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead class="text-center">Quantity</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="(item, index) in store.products.data" :key="item.id">
            <TableCell>{{ index + 1 }}</TableCell>
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

    <!-- Footer -->
    <div class="flex justify-between text-xs text-gray-500">
      <span>
        Showing {{ store.products.data?.length || 0 }} of
        {{ store.products?.meta?.total || 0 }}
      </span>

      <div class="flex gap-1">
        <Button size="sm" variant="outline" :disabled="page === 1 || isPolling" @click="prevPage">
          Prev
        </Button>

        <Button size="sm" variant="outline">
          {{ page }}
        </Button>

        <Button size="sm" variant="outline" :disabled="page >= (store.products?.meta?.last_page || 1) || isPolling"
          @click="nextPage">
          Next
        </Button>
      </div>
    </div>

  </div>
</template>