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
        <h3 class="stat-value">{{ isLoadingStats ? '...' : stats.totalCustomers }}</h3>
      </div>
      <div class="stat-card">
        <p class="stat-title">Total Booking</p>
        <h3 class="stat-value">{{ isLoadingStats ? '...' : stats.totalBookings }}</h3>
      </div>
      <div class="stat-card">
        <p class="stat-title">Total Layanan</p>
        <h3 class="stat-value">{{ isLoadingStats ? '...' : stats.totalServices }}</h3>
      </div>
      <div class="stat-card">
        <p class="stat-title">Total Pendapatan</p>
        <h3 class="stat-value">
          {{ isLoadingStats ? '...' : 'Rp ' + stats.totalRevenue.toLocaleString('id-ID') }}
        </h3>
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
                <!-- Jika status PENDING, tampilkan tombol Tandai Selesai dan Tolak/Batal -->
                <div v-if="booking.status === 'PENDING'" class="action-buttons">
                  <button 
                    @click="updateBookingStatus(booking.rawId, 'completed')"
                    class="btn-action-done">
                    Tandai Selesai
                  </button>
                  <button 
                    @click="updateBookingStatus(booking.rawId, 'cancelled')"
                    class="btn-action-cancel">
                    Tolak / Batal
                  </button>
                </div>

                <!-- Jika sudah COMPLETED / DONE / SELESAI -->
                <span v-else-if="booking.status === 'COMPLETED' || booking.status === 'DONE' || booking.status === 'SELESAI'" class="text-completed">
                  Selesai
                </span>

                <!-- Jika status CANCELLED / BATAL -->
                <span v-else-if="booking.status === 'CANCELLED' || booking.status === 'BATAL'" class="text-cancelled">
                  Dibatalkan
                </span>

                <!-- Default status lainnya -->
                <span v-else class="text-completed">-</span>
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
  totalCustomers: 0,
  totalBookings: 0,
  totalServices: 0,
  totalRevenue: 0
})

const isLoading = ref(true)
const isLoadingStats = ref(true)
const errorMessage = ref('')

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Fetch data statistik real dari backend (/admin/dashboard-stats)
const fetchDashboardStats = async () => {
  isLoadingStats.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    const result = await response.json()

    if (response.ok && result.data) {
      stats.value.totalCustomers = result.data.total_pelanggan || 0
      stats.value.totalBookings = result.data.total_booking || 0
      stats.value.totalServices = result.data.total_layanan || 0
      stats.value.totalRevenue = result.data.total_pendapatan || 0
    }
  } catch (err) {
    console.error('Gagal mengambil data statistik:', err)
  } finally {
    isLoadingStats.value = false
  }
}

// Fetch data list booking untuk tabel (/bookings)
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
    } else {
      errorMessage.value = result.error || 'Gagal mengambil data dari server'
    }
  } catch (err) {
    errorMessage.value = 'Terjadi kesalahan koneksi ke server backend'
  } finally {
    isLoading.value = false
  }
}

// Fungsi fleksibel untuk mengubah status booking ('completed' / 'cancelled')
const updateBookingStatus = async (id, newStatus) => {
  const confirmMessage = newStatus === 'cancelled'
    ? 'Apakah Anda yakin ingin membatalkan/menolak booking ini?'
    : 'Tandai booking ini sebagai selesai?'

  if (!confirm(confirmMessage)) return

  try {
    const token = localStorage.getItem('token')
    
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    })

    if (response.ok) {
      // Refresh data booking & statistik setelah status diperbarui
      fetchDashboardData()
      fetchDashboardStats()
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
  fetchDashboardStats()
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

.badge.cancelled, .badge.batal {
  background-color: #fee2e2;
  color: #dc2626;
}

/* Action Buttons Container */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Tombol Tandai Selesai */
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

/* Tombol Tolak / Batal */
.btn-action-cancel {
  background-color: #dc2626;
  color: #ffffff;
  border: none;
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-action-cancel:hover {
  background-color: #b91c1c;
}

.text-completed {
  color: #94a3b8;
  font-size: 0.85rem;
}

.text-cancelled {
  color: #ef4444;
  font-size: 0.85rem;
}
</style>