<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoggedIn = ref(false)

onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    isLoggedIn.value = true
  }
})

// Logika Rute Tombol "Buat Booking Sekarang"
const handleBookingClick = () => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role') || localStorage.getItem('user_role')

  if (!token) {
    // 1. Jika belum login, bawa ke halaman Login
    router.push('/login')
  } else if (role === 'admin') {
    // 2. Jika login dengan akun ADMIN, bawa ke Dashboard Admin
    router.push('/admin/dashboard')
  } else {
    // 3. Jika login sebagai CUSTOMER, bawa ke halaman Layanan / Home
    router.push('/layanan')
  }
}

// Logout
const handleLogout = () => {
  localStorage.clear()
  isLoggedIn.value = false
  router.push('/login')
}
</script>

<template>
  <div class="home-container">
    <!-- Navbar -->
    <header class="navbar">
      <div class="brand">Barberly</div>
      <nav class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/layanan">Layanan</router-link>
        <!-- Tampilkan menu ini hanya saat user sudah login -->
        <router-link v-if="isLoggedIn" to="/my-bookings">Booking Saya</router-link>
        <router-link to="/tentang">Tentang Kami</router-link>
      </nav>

      <!-- Auth Buttons -->
      <div class="nav-auth">
        <router-link v-if="!isLoggedIn" to="/login" class="admin-link">
          Masuk
        </router-link>
        <button v-else @click="handleLogout" class="btn-logout">
          Keluar
        </button>
      </div>
    </header>

    <!-- Hero Content -->
    <main class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          Gaya Rambut Rapi,<br />
          Tampil Percaya Diri Setiap Hari.
        </h1>
        <button @click="handleBookingClick" class="btn-booking">
           Buat Booking Sekarang
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  /* Overlay gelap + background pattern */
  background: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), 
              url('../assets/images/bg-barber.png');
  
  /* Setting ukuran tile pattern agar tidak blur & tajam */
  background-size: 220px;
  background-repeat: repeat;
  background-position: top left;
  
  background-color: #121212;
  display: flex;
  flex-direction: column;
  color: #ffffff;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 3rem;
  background-color: #000000;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand {
  font-size: 1.6rem;
  font-family: serif;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  color: #b0b0b0;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.2s ease;
}

.nav-links a:hover,
.nav-links .router-link-active {
  color: #ffffff;
}

.nav-auth {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-link {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #ffffff;
  padding: 0.5rem 1.2rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.admin-link:hover {
  background: #ffffff;
  color: #000000;
  border-color: #ffffff;
}

.btn-logout {
  background: #ef4444;
  border: none;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-logout:hover {
  background: #dc2626;
}

.hero-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
}

.hero-content {
  max-width: 700px;
}

.hero-title {
  color: #ffffff !important;
  font-size: 2.3rem;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.5px;
  margin-bottom: 2.5rem;
  font-family: sans-serif;
}

.btn-booking {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: #ffc107;
  color: #000000;
  padding: 0.9rem 2.2rem;
  border: none;
  border-radius: 50px;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.btn-booking:hover {
  background-color: #e0a800;
  transform: translateY(-2px);
}
</style>