# 🖥️ Product Inventory Console (Frontend)

## 📌 Overview

This is the **frontend console application** for the Product Inventory Management System.

Built using **Vue 3 + TypeScript + Vite**, the console provides a clean and responsive UI for managing product inventory.

---

## ⚙️ Setup Instructions

### 1. Clone Project

```bash
git clone <your-repo-url>
cd project-folder
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
VITE_API_URL=http://localhost:8000/api
```

### 4. Run Server

```bash
npm run dev
```

## 🛠️ Tech Stack

* Vue 3 (Composition API + `<script setup>`)
* TypeScript
* Vite
* Pinia (State Management)
* Vue Router
* Axios (API Integration)
* shadcn-vue (UI Components)
* Sonner (Toast Notification)

---

## 🎯 Features

### ✅ Product Master Listing

* Display product master in a table
* Clean UI using shadcn components
* Backend-driven pagination

---

### ✅ Search

* Search by Product ID
* Server-side filtering
* Instant API call on input

---

### ✅ Excel Upload

* Upload `.xlsx` file

| Status | Action          |
| ------ | --------------- |
| Sold   | Deduct quantity |
| Buy    | Add quantity    |


---

### ✅ Async Update (Polling 🔥)

* Automatically refresh data after upload
* Detect data changes and stop polling
* No manual refresh required

---

### ✅ Toast Notification

* Success message from API displayed using Sonner
* Error handling with toast

---

