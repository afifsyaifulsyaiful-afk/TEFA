<template>
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
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Lokasi default ditetapkan langsung
const shopSettings = ref({
  name: 'Barberly',
  address: 'Payolansek, Payakumbuh Barat, Kota Payakumbuh, Sumatra Barat 26219',
  open_at: '09:00',
  close_at: '21:00',
  operating_hours: 'Senin - Minggu: 09:00 - 21:00 WIB'
})

// Format jam operasional yang sudah diperbaiki
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
  fetchSettings()
})
</script>

<style scoped>
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