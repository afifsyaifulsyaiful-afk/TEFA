<template>
  <div class="my-bookings-page">
    <!-- Navbar -->
    <header class="navbar">
      <div class="brand" @click="router.push('/')">Barberly</div>
      <nav class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/layanan">Layanan</router-link>
        <router-link to="/my-bookings">Booking Saya</router-link>
        <router-link to="/tentang">Tentang Kami</router-link>
      </nav>
      <div class="nav-auth">
        <button class="btn-logout" @click="handleLogout">Keluar</button>
      </div>
    </header>

    <main class="container">
      <div class="top-bar">
        <button class="btn-back" @click="router.push('/')">
          ← Kembali ke Beranda
        </button>
      </div>

      <div class="header-section">
        <h1>Booking Saya</h1>
        <p class="subjudul">Cek status dan riwayat janji cukur rambutmu di sini</p>
      </div>

      <!-- State Loading & Error -->
      <div v-if="isLoading" class="state-box">
        Memuat data booking...
      </div>
      <div v-else-if="errorMessage" class="state-box error">
        {{ errorMessage }}
      </div>

      <!-- State Jika Belum Ada Booking -->
      <div v-else-if="bookings.length === 0" class="empty-state">
        <p>Kamu belum memiliki riwayat booking.</p>
        <button class="btn-booking-now" @click="router.push('/layanan')">
          Buat Booking Sekarang
        </button>
      </div>

      <!-- Daftar Card Booking -->
      <div v-else class="booking-grid">
        <div 
          v-for="item in bookings" 
          :key="item.id" 
          class="booking-card"
        >
          <div class="card-header">
            <span class="service-name">{{ item.service?.name || item.service_name || 'Layanan' }}</span>
            <span :class="['status-badge', getStatusClass(item.status)]">
              {{ formatStatus(item.status) }}
            </span>
          </div>

          <div class="card-body">
            <div class="info-row">
              <span class="label">Barber:</span>
              <span class="val">{{ item.barber?.name || item.barber_name || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Tanggal & Jam:</span>
              <span class="val highlight">{{ formatDate(item.booking_time) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Harga:</span>
              <span class="val price">Rp {{ Number(item.service?.price || item.price || 0).toLocaleString('id-ID') }}</span>
            </div>
            <!-- Informasi Metode Pembayaran Tanpa Emoji -->
            <div class="info-row payment-info">
              <span class="label">Metode Pembayaran:</span>
              <span class="val payment-method">
                Bayar Tunai di Kasir 
                <small class="payment-status-tag" :class="item.status === 'completed' ? 'tag-paid' : 'tag-unpaid'">
                  ({{ item.status === 'completed' ? 'Lunas' : 'Bayar Setelah Cukur' }})
                </small>
              </span>
            </div>
          </div>

          <!-- Batalkan Booking (Relasi Extend Use Case) -->
          <div v-if="item.status === 'pending' || item.status === 'confirmed'" class="card-footer">
            <button class="btn-cancel" @click="cancelBooking(item.id)">
              Batalkan Booking
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const bookings = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const fetchMyBookings = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await fetch(`${API_BASE_URL}/bookings/my`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const result = await response.json()

    if (response.ok) {
      bookings.value = result.data || result || []
    } else {
      errorMessage.value = result.error || 'Gagal memuat riwayat booking.'
    }
  } catch (err) {
    errorMessage.value = 'Kesalahan jaringan saat terhubung ke server.'
  } finally {
    isLoading.value = false
  }
}

// Format Tanggal ISO ke Bahasa Indonesia
const formatDate = (isoString) => {
  if (!isoString) return '-'
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(date)
}

// Styling Badge Status
const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'badge-pending'
    case 'confirmed': return 'badge-confirmed'
    case 'completed': return 'badge-completed'
    case 'cancelled': return 'badge-cancelled'
    default: return 'badge-default'
  }
}

const formatStatus = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'Menunggu Konfirmasi'
    case 'confirmed': return 'Dikonfirmasi'
    case 'completed': return 'Selesai'
    case 'cancelled': return 'Dibatalkan'
    default: return status
  }
}

// Batalkan Booking
const cancelBooking = async (id) => {
  if (!confirm('Apakah kamu yakin ingin membatalkan booking ini?')) return

  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      alert('Booking berhasil dibatalkan.')
      fetchMyBookings()
    } else {
      const res = await response.json()
      alert(res.error || 'Gagal membatalkan booking.')
    }
  } catch (err) {
    alert('Terjadi kesalahan jaringan.')
  }
}

const handleLogout = () => {
  localStorage.clear()
  router.push('/login')
}

onMounted(() => {
  fetchMyBookings()
})
</script>

<style scoped>
.my-bookings-page {
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
}

.nav-links a.active,
.nav-links a:hover,
.nav-links .router-link-active {
  color: #ffffff;
}

.btn-logout {
  background: #ef4444;
  border: none;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
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

.header-section {
  text-align: center;
  margin-bottom: 2.5rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subjudul {
  color: #94a3b8;
}

.state-box {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.state-box.error {
  color: #f87171;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #1e293b;
  border-radius: 12px;
  border: 1px solid #334155;
}

.empty-state p {
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.btn-booking-now {
  background: #f59e0b;
  color: #000;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  font-weight: 700;
  cursor: pointer;
}

.booking-grid {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.booking-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #334155;
  padding-bottom: 0.8rem;
  margin-bottom: 1rem;
}

.service-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f8fafc;
}

.status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-pending { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b; }
.badge-confirmed { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid #3b82f6; }
.badge-completed { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid #22c55e; }
.badge-cancelled { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; }

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
}

.label {
  color: #94a3b8;
}

.val {
  color: #e2e8f0;
  font-weight: 500;
}

.val.highlight {
  color: #fbbf24;
}

.val.price {
  font-weight: 700;
  color: #4ade80;
}

.payment-info {
  margin-top: 0.2rem;
  padding-top: 0.4rem;
  border-top: 1px dashed #334155;
}

.payment-method {
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.payment-status-tag {
  font-size: 0.75rem;
  font-weight: 600;
}

.tag-paid {
  color: #4ade80;
}

.tag-unpaid {
  color: #fbbf24;
}

.card-footer {
  margin-top: 1.2rem;
  padding-top: 0.8rem;
  border-top: 1px solid #334155;
  text-align: right;
}

.btn-cancel {
  background: transparent;
  border: 1px solid #ef4444;
  color: #f87171;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #ef4444;
  color: #ffffff;
}
</style>