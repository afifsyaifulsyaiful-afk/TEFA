<template>
  <div class="tentang-page">
    <!-- Navbar -->
    <header class="navbar">
      <div class="brand" @click="router.push('/')">Barberly</div>
      <nav class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/layanan">Layanan</router-link>
        <router-link v-if="isLoggedIn" to="/my-bookings">Booking Saya</router-link>
        <router-link to="/tentang">Tentang Kami</router-link>
      </nav>
      <div class="nav-auth">
        <button v-if="isLoggedIn" class="btn-logout" @click="handleLogout">
          Keluar
        </button>
        <router-link v-else to="/login" class="btn-login">
          Masuk
        </router-link>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container">
      <div class="top-bar">
        <button class="btn-back" @click="router.push('/')">
          ← Kembali ke Beranda
        </button>
      </div>

      <div class="header-section">
        <h1>Tentang {{ shopSettings.name || 'Barberly' }} </h1>
        <p class="subjudul">Layanan Potong Rambut Modern & Profesional</p>
      </div>

      <div class="content-card">
        <h3>Pengalaman Cukur Terbaik untuk Penampilan Maksimal</h3>
        <p>
          Barberly hadir untuk memberikan pengalaman cukur rambut terbaik dengan kapster profesional, 
          peralatan higienis, dan suasana tempat yang nyaman. Kami melayani berbagai gaya potong rambut 
          mulai dari gaya klasik hingga tren modern masa kini.
        </p>

        <div class="info-grid">
          <div class="info-item">
            <h4>Jam Operasional</h4>
            <p>{{ formattedOperatingHours }}</p>
          </div>
          <div class="info-item">
            <h4>Lokasi Utama</h4>
            <p>{{ shopSettings.address }}</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const isLoggedIn = ref(false)

// Lokasi default ditetapkan langsung ke lokasi kamu
const shopSettings = ref({
  name: 'Barberly',
  address: 'Payolansek, Payakumbuh Barat, Kota Payakumbuh, Sumatra Barat 26219',
  open_at: '09:00',
  close_at: '21:00',
  operating_hours: 'Senin - Minggu: 09:00 - 21:00 WIB'
})

// Format jam operasional
const formattedOperatingHours = computed(() => {
  if (shopSettings.value.open_at && shopSettings.value.close_at) {
    return `Senin - Minggu: ${shopSettings.value.open_at} - ${shopSettings.value.close_at} WIB`
  }
  return shopSettings.value.operating_hours || 'Senin - Minggu: 09:00 - 21:00 WIB'
})

const fetchSettings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings`)
    if (response.ok) {
      const result = await response.json()
      
      let rawData = result.data || result.settings || result

      if (Array.isArray(rawData) && rawData.length > 0) {
        rawData = rawData[0]
      }

      if (rawData && typeof rawData === 'object') {
        const fetchedAddress = rawData.address || rawData.location || rawData.alamat
        if (fetchedAddress) {
          shopSettings.value.address = fetchedAddress
        }
        if (rawData.name) shopSettings.value.name = rawData.name
        if (rawData.open_at) shopSettings.value.open_at = rawData.open_at
        if (rawData.close_at) shopSettings.value.close_at = rawData.close_at
      }
    }
  } catch (err) {
    console.error('Gagal mengambil pengaturan toko dari backend:', err)
  }
}

onMounted(() => {
  const token = localStorage.getItem('token')
  isLoggedIn.value = !!token
  fetchSettings()
})

const handleLogout = () => {
  localStorage.clear()
  isLoggedIn.value = false
  router.push('/login')
}
</script>

<style scoped>
.tentang-page {
  min-height: 100vh;
  background-color: #121212;
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
  cursor: pointer;
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

.btn-login {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #ffffff;
  padding: 0.5rem 1.2rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-login:hover {
  background: #ffffff;
  color: #000000;
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

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.top-bar {
  margin-bottom: 1rem;
}

.btn-back {
  background: none;
  border: none;
  color: #fbbf24;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.btn-back:hover {
  text-decoration: underline;
}

.header-section {
  text-align: center;
  margin-bottom: 2.5rem;
}

h1 {
  font-size: 2.2rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.subjudul {
  color: #cbd5e1;
  font-size: 1rem;
}

.content-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  padding: 2rem;
}

.content-card h3 {
  color: #fbbf24;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.content-card p {
  color: #cbd5e1;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  border-top: 1px solid #334155;
  padding-top: 1.5rem;
}

.info-item h4 {
  color: #f8fafc;
  margin-bottom: 0.4rem;
}

.info-item p {
  color: #94a3b8;
  margin: 0;
}
</style>