<template>
  <div class="customer-layout">
    <!-- Navbar Pelanggan Tetap (Persisten) -->
    <header class="navbar">
      <div class="brand" @click="router.push('/')">Barberly</div>
      <nav class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/layanan">Barber</router-link>
        
        <router-link v-if="isLoggedIn && userRole !== 'admin'" to="/my-bookings">
          Booking Saya
        </router-link>

        <router-link v-if="isLoggedIn && userRole === 'admin'" to="/admin/dashboard" class="admin-dashboard-link">
          Dashboard Admin
        </router-link>

        <router-link to="/tentang">Tentang Kami</router-link>
      </nav>

      <div class="nav-auth">
        <router-link v-if="!isLoggedIn" to="/login" class="btn-login">
          Masuk
        </router-link>
        <button v-else @click="handleLogout" class="btn-logout">
          Keluar
        </button>
      </div>
    </header>

    <!-- Konten Halaman Pelanggan Dirender di Sini -->
    <main class="layout-main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoggedIn = ref(false)
const userRole = ref('')

const handleLogout = () => {
  localStorage.clear()
  isLoggedIn.value = false
  userRole.value = ''
  router.push('/login')
}

onMounted(() => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role') || localStorage.getItem('user_role')
  
  if (token) {
    isLoggedIn.value = true
    userRole.value = role
  }
})
</script>

<style>
/* Mematikan scrollbar bawaan body/html global agar tidak muncul garis abu-abu di kanan */
html, body {
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow: hidden;
  background-color: #121212;
}

/* Sembunyikan scrollbar global untuk Chrome, Safari, Edge, dan Firefox */
html::-webkit-scrollbar,
body::-webkit-scrollbar {
  display: none;
}
html, body {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>

<style scoped>
.customer-layout {
  height: 100vh;
  background-color: #121212;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.navbar { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 1.2rem 3rem; 
  background-color: #000; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
  position: relative;
  width: 100%;
  box-sizing: border-box;
  z-index: 10;
  flex-shrink: 0;
}

.brand { 
  font-size: 1.6rem; 
  font-family: serif; 
  font-weight: bold; 
  cursor: pointer; 
}

.nav-links { 
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex; 
  gap: 2rem; 
}

.nav-links a { 
  color: #b0b0b0; 
  text-decoration: none; 
}

/* Menggunakan router-link-exact-active agar hanya menyala saat benar-benar di halaman tersebut */
.nav-links a.router-link-exact-active { 
  color: #fff; 
  font-weight: bold; 
}

.admin-dashboard-link {
  color: #ffc107 !important;
  font-weight: bold;
}

.btn-logout { 
  background: #ef4444; 
  color: #fff; 
  border: none; 
  padding: 0.5rem 1rem; 
  border-radius: 4px; 
  cursor: pointer; 
}

.btn-login {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-login:hover {
  border-color: #f59e0b;
  color: #f59e0b;
}

.layout-main-content {
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  
  /* Mengatur agar konten bisa di-scroll jika panjang, tapi scrollbarnya disembunyikan sepenuhnya */
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer dan Edge lama */
}

/* Untuk Chrome, Safari, dan Opera */
.layout-main-content::-webkit-scrollbar {
  display: none;
}
</style>