import api from "./axios";

export const getProducts = (params: any) => {
  return api.get("/product-master-lists", { params });
};

export const uploadFile = (formData: FormData) => {
  return api.post("/product-master-lists/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};