<template>
  <div class="dashboard-container">
    <header class="top-header">
      <h1>Dashboard Utama</h1>
      <p class="date-info">Kelola operasional barbershop dengan mudah dan cepat.</p>
    </header>

    <!-- Statistik Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <p class="stat-title">Total Pelanggan</p>
        <h3 class="stat-value">{{ stats.totalCustomers }}</h3>
      </div>
      <div class="stat-card">
        <p class="stat-title">Total Booking</p>
        <h3 class="stat-value">{{ stats.totalBookings }}</h3>
      </div>
      <div class="stat-card">
        <p class="stat-title">Total Layanan</p>
        <h3 class="stat-value">{{ stats.totalServices }}</h3>
      </div>
      <div class="stat-card">
        <p class="stat-title">Total Pendapatan</p>
        <h3 class="stat-value">Rp {{ stats.totalRevenue.toLocaleString('id-ID') }}</h3>
      </div>
    </div>

    <!-- Tabel Booking Terbaru -->
    <div class="table-section">
      <div class="table-header">
        <h3>Booking Terbaru</h3>
        <span class="indicator-info" v-if="isPhoneLogin">Mode: Login No. Telepon (Menampilkan No. HP)</span>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">Memuat data dari server...</div>

      <!-- Error State -->
      <div v-if="errorMessage" class="error-state">{{ errorMessage }}</div>

      <div class="table-responsive" v-if="!isLoading">
        <table class="booking-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Pelanggan</th>
              <th v-if="isPhoneLogin">No. Telepon</th>
              <th>Layanan</th>
              <th>Waktu</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="recentBookings.length === 0">
              <td :colspan="isPhoneLogin ? 7 : 6" class="empty-text">Belum ada data booking.</td>
            </tr>
            <tr v-for="booking in recentBookings" :key="booking.id">
              <td>{{ booking.id }}</td>
              <td>{{ booking.name }}</td>
              <td v-if="isPhoneLogin">{{ booking.phone }}</td>
              <td>{{ booking.service }}</td>
              <td>{{ booking.time }}</td>
              <td>
                <span :class="['badge', booking.status.toLowerCase()]">{{ booking.status }}</span>
              </td>
              <td>
                <!-- Tombol hanya tampil jika status masih PENDING -->
                <button 
                  v-if="booking.status === 'PENDING'"
                  @click="updateBookingToDone(booking.rawId)"
                  class="btn-action-done">
                  Tandai Selesai
                </button>
                <!-- Jika sudah COMPLETED / DONE / SELESAI, tampilkan teks Selesai -->
                <span v-else class="text-completed">Selesai</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isPhoneLogin = ref(localStorage.getItem('is_phone_login') === 'true')

// Variabel data reaktif
const recentBookings = ref([])
const stats = ref({
  totalCustomers: 1240,
  totalBookings: 0,
  totalServices: 8,
  totalRevenue: 14500000
})

const isLoading = ref(true)
const errorMessage = ref('')

// Ganti IP dengan IP backend Go partner Anda
const API_BASE_URL = 'http://192.168.69.139:8080/api'

const fetchDashboardData = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const token = localStorage.getItem('token')

    if (!token) {
      errorMessage.value = 'Token tidak ditemukan, silakan login ulang.'
      isLoading.value = false
      return
    }

    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    const result = await response.json()

    if (response.ok) {
      const dataBookings = result.data || result

      recentBookings.value = dataBookings.map(item => {
        let serviceName = 'Layanan Cukur'
        const s = item.Service || item.service || item.service_name || item.ServiceName
        
        if (typeof s === 'object' && s !== null) {
          serviceName = s.name || s.Name || s.service_name || 'Layanan Cukur'
        } else if (typeof s === 'string') {
          if (s.startsWith('{')) {
            try {
              const parsed = JSON.parse(s)
              serviceName = parsed.name || parsed.Name || 'Layanan Cukur'
            } catch (e) {
              serviceName = s
            }
          } else {
            serviceName = s
          }
        }

        let customerName = 'Pelanggan'
        const u = item.User || item.user || item.customer_name
        if (typeof u === 'object' && u !== null) {
          customerName = u.name || u.Name || u.username || 'Pelanggan'
        } else if (typeof u === 'string') {
          customerName = u
        }

        const rawBookingId = item.ID || item.id

        return {
          rawId: rawBookingId,
          id: `#${rawBookingId}`,
          name: customerName,
          phone: item.User?.Phone || item.User?.phone || item.Phone || item.phone || '-',
          service: serviceName,
          time: (item.BookingTime || item.booking_time) ? new Date(item.BookingTime || item.booking_time).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Baru saja',
          status: (item.Status || item.status || 'PENDING').toUpperCase()
        }
      })

      stats.value.totalBookings = recentBookings.value.length
    } else {
      errorMessage.value = result.error || 'Gagal mengambil data dari server'
    }
  } catch (err) {
    errorMessage.value = 'Terjadi kesalahan koneksi ke server backend'
  } finally {
    isLoading.value = false
  }
}

// Fungsi untuk menembak API backend Go (/bookings/:id/status) dengan status 'completed'
const updateBookingToDone = async (id) => {
  try {
    const token = localStorage.getItem('token')
    
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'completed' })
    })

    if (response.ok) {
      // Refresh data dari database setelah berhasil di-update
      fetchDashboardData()
    } else {
      const errRes = await response.json().catch(() => ({}))
      alert(errRes.error || 'Gagal memperbarui status ke server.')
    }
  } catch (err) {
    console.error(err)
    alert('Terjadi kesalahan koneksi saat menghubungi backend.')
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.dashboard-container {
  padding: 0;
  width: 100%;
  box-sizing: border-box;
}

.top-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.date-info {
  margin: 0.25rem 0 1.5rem 0;
  color: #64748b;
  font-size: 0.875rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #ffffff;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.stat-title {
  margin: 0;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  margin: 0.5rem 0 0 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

/* Table Section */
.table-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.table-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
}

.indicator-info {
  font-size: 0.75rem;
  color: #2563eb;
  background: #eff6ff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.loading-state, .error-state, .empty-text {
  text-align: center;
  padding: 1.5rem;
  color: #64748b;
  font-size: 0.9rem;
}

.error-state {
  color: #ef4444;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.booking-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

.booking-table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.booking-table td {
  padding: 0.85rem 1rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
}

/* Status Badges */
.badge {
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.badge.completed, .badge.selesai, .badge.done {
  background-color: #dcfce7;
  color: #15803d;
}

.badge.pending, .badge.menunggu {
  background-color: #fef3c7;
  color: #b45309;
}

/* Tombol Aksi */
.btn-action-done {
  background-color: #15803d;
  color: #ffffff;
  border: none;
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-action-done:hover {
  background-color: #166534;
}

.text-completed {
  color: #94a3b8;
  font-size: 0.85rem;
}
</style>