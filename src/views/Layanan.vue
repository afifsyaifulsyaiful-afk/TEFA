<template>
  <div class="layanan-page">
    <!-- Navbar Atas -->
    <header class="navbar">
      <div class="brand" @click="router.push('/')">Barberly</div>
      <nav class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/layanan">Layanan</router-link>
        <router-link to="/tentang-kami">Tentang Kami</router-link>
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

    <div class="layanan-container">
      <!-- Tombol Kembali Tunggal -->
      <div class="top-bar">
        <button class="btn-back" @click="router.push('/')">
          ← Kembali ke Beranda
        </button>
      </div>

      <!-- Header Page -->
      <div class="header-section">
        <h1>Daftar Layanan 💈</h1>
        <p class="subjudul">Pilih layanan yang kamu inginkan untuk melakukan booking</p>
      </div>

      <!-- State Loading & Error -->
      <div v-if="isLoadingServices" class="loading-state">
        Memuat daftar layanan...
      </div>
      <div v-else-if="serviceFetchError" class="error-state">
        {{ serviceFetchError }}
      </div>

      <!-- Grid Daftar Layanan -->
      <div v-else class="layanan-list">
        <div 
          v-for="service in services" 
          :key="service.id" 
          class="layanan-card"
        >
          <h3>✂️ {{ service.name }}</h3>
          <!-- Menggunakan fungsi getDuration agar tidak bernilai 0 -->
          <p>Durasi estimasi: {{ getDuration(service) }} menit</p>
          <span class="harga">Rp {{ Number(service.price).toLocaleString('id-ID') }}</span>
          <button class="btn-pilih" @click="openBookingModal(service)">
            Pilih Layanan
          </button>
        </div>
      </div>

      <!-- MODAL POPUP BOOKING FORM -->
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeBookingModal">
        <div class="modal-card">
          <div class="modal-header">
            <h2>Buat Janji Cukur</h2>
            <button class="btn-close" @click="closeBookingModal">✕</button>
          </div>

          <form @submit.prevent="submitBooking" class="booking-form">
            <!-- Layanan Terpilih -->
            <div class="form-group">
              <label>Layanan Terpilih</label>
              <input type="text" :value="selectedService?.name" disabled class="input-disabled" />
            </div>

            <!-- Pilih Barber -->
            <div class="form-group">
              <label>Pilih Barber</label>
              <select v-model="bookingForm.barber_id" required>
                <option value="" disabled>-- Pilih Tukang Cukur --</option>
                <option v-for="barber in barbers" :key="barber.id" :value="barber.id">
                  {{ barber.name }} {{ barber.specialty ? `(${barber.specialty})` : '' }}
                </option>
              </select>
            </div>

            <!-- Tanggal & Jam Booking -->
            <div class="form-group">
              <label>Waktu Booking</label>
              <input 
                v-model="bookingForm.booking_time" 
                type="datetime-local" 
                required 
              />
            </div>

            <!-- Pesan Alert Status -->
            <div v-if="submitMessage.text" :class="['alert', submitMessage.isError ? 'alert-error' : 'alert-success']">
              {{ submitMessage.text }}
            </div>

            <!-- Tombol Kirim Booking -->
            <button type="submit" :disabled="isSubmitting" class="btn-submit">
              {{ isSubmitting ? 'Memproses Booking...' : 'Konfirmasi Booking' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_BASE_URL = 'http://192.168.69.139:8080/api'

const isLoggedIn = ref(false)
const services = ref([])
const barbers = ref([])
const isLoadingServices = ref(true)
const serviceFetchError = ref('')

// State Modal Pop-up Booking
const isModalOpen = ref(false)
const selectedService = ref(null)
const isSubmitting = ref(false)
const submitMessage = ref({ text: '', isError: false })

const bookingForm = ref({
  barber_id: '',
  booking_time: ''
})

// Helper untuk memeriksa dan menentukan nilai durasi layanan
const getDuration = (service) => {
  const dur = service.duration_min || service.duration || service.DurationMin || service.duration_minutes
  return dur && Number(dur) > 0 ? dur : 30
}

const checkAuth = () => {
  const token = localStorage.getItem('token')
  isLoggedIn.value = !!token
}

const handleLogout = () => {
  localStorage.clear()
  isLoggedIn.value = false
  router.push('/login')
}

// Fetch Data Layanan & Barber dari Backend Go
const fetchData = async () => {
  isLoadingServices.value = true
  serviceFetchError.value = ''

  try {
    const [resServices, resBarbers] = await Promise.all([
      fetch(`${API_BASE_URL}/services`),
      fetch(`${API_BASE_URL}/barbers`)
    ])

    if (!resServices.ok) throw new Error('Gagal mengambil data layanan')
    
    const dataServices = await resServices.json()
    const dataBarbers = await resBarbers.json()

    services.value = dataServices.data || dataServices || []
    barbers.value = dataBarbers.data || dataBarbers || []
  } catch (err) {
    serviceFetchError.value = 'Gagal terhubung ke server backend.'
  } finally {
    isLoadingServices.value = false
  }
}

// Buka Modal & Cek Autentikasi Customer
const openBookingModal = (service) => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }

  selectedService.value = service
  bookingForm.value = { barber_id: '', booking_time: '' }
  submitMessage.value = { text: '', isError: false }
  isModalOpen.value = true
}

// Tutup Modal Booking
const closeBookingModal = () => {
  isModalOpen.value = false
  selectedService.value = null
}

// Submit Booking ke Endpoint POST /api/bookings
const submitBooking = async () => {
  isSubmitting.value = true
  submitMessage.value = { text: '', isError: false }

  try {
    const token = localStorage.getItem('token')
    
    const payload = {
      service_id: Number(selectedService.value.id),
      barber_id: Number(bookingForm.value.barber_id),
      booking_time: new Date(bookingForm.value.booking_time).toISOString()
    }

    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (response.ok) {
      submitMessage.value = { text: 'Booking berhasil dibuat! Silahkan tunggu konfirmasi.', isError: false }
      setTimeout(() => {
        closeBookingModal()
        router.push('/')
      }, 1500)
    } else {
      submitMessage.value = { text: result.error || 'Gagal membuat booking', isError: true }
    }
  } catch (err) {
    submitMessage.value = { text: 'Kesalahan jaringan saat mengirim booking', isError: true }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  checkAuth()
  fetchData()
})
</script>

<style scoped>
.layanan-page {
  min-height: 100vh;
  background-color: #121212;
  color: #ffffff;
}

/* NAVBAR STYLING */
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

/* LAYANAN CONTAINER */
.layanan-container {
  max-width: 1100px;
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
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
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

.loading-state, .error-state {
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: #94a3b8;
}

.layanan-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.75rem;
}

.layanan-card {
  background: #1e293b;
  padding: 1.8rem;
  border: 1px solid #334155;
  border-radius: 14px;
  text-align: center;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.layanan-card:hover {
  transform: translateY(-5px);
  border-color: #f59e0b;
  box-shadow: 0 10px 25px rgba(245, 158, 11, 0.15);
}

.layanan-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #f8fafc;
  font-weight: 600;
}

.layanan-card p {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 1.2rem;
}

.harga {
  display: block;
  font-size: 1.4rem;
  font-weight: 700;
  color: #fbbf24;
  margin-bottom: 1.25rem;
}

.btn-pilih {
  width: 100%;
  padding: 0.85rem;
  background: #f59e0b;
  color: #000000;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-pilih:hover {
  background: #d97706;
}

/* STYLING MODAL FORM POPUP */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  color: #0f172a;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f172a;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #64748b;
}

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  text-align: left;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.form-group input, .form-group select {
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
}

.input-disabled {
  background-color: #f1f5f9;
  color: #64748b;
}

.btn-submit {
  background-color: #f59e0b;
  color: #000000;
  padding: 0.85rem;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  margin-top: 0.5rem;
}

.btn-submit:hover {
  background-color: #d97706;
}

.btn-submit:disabled {
  background-color: #fcd34d;
  cursor: not-allowed;
}

.alert {
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
}

.alert-success { background: #dcfce7; color: #15803d; }
.alert-error { background: #fee2e2; color: #b91c1c; }
</style>