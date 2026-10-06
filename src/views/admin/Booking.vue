<template>
  <div class="booking-page">
    <h2>Kelola Data Booking</h2>
    <p class="text-muted">Daftar reservasi masuk dari pelanggan.</p>

    <!-- Loading & Error State -->
    <div v-if="isLoading" class="loading-state">Memuat data dari server...</div>
    <div v-if="errorMessage" class="error-state">{{ errorMessage }}</div>

    <div class="card" v-if="!isLoading">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Pelanggan</th>
            <!-- Kolom No. Telepon hanya muncul jika login pakai nomor telepon -->
            <th v-if="isPhoneLogin">No. Telepon</th>
            <th>Layanan</th>
            <th>Barber</th>
            <th>Tanggal & Waktu</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="bookings.length === 0">
            <td :colspan="isPhoneLogin ? 8 : 7" class="empty-text">Belum ada data booking.</td>
          </tr>
          <tr v-for="b in bookings" :key="b.rawId">
            <td>#{{ b.rawId }}</td>
            <td><strong>{{ b.customer }}</strong></td>
            <!-- Data No. Telepon dinamis dari backend -->
            <td v-if="isPhoneLogin">{{ b.phone }}</td>
            <td>{{ b.service }}</td>
            <td>{{ b.barber }}</td>
            <td>{{ b.datetime }}</td>
            <td>
              <span :class="['badge', b.status.toLowerCase()]">{{ b.status }}</span>
            </td>
            <td>
              <button 
                v-if="b.status === 'PENDING'"
                @click="updateStatus(b.rawId, 'completed')"
                class="btn-action-done">
                Selesai
              </button>
              <span v-else class="text-completed">Selesai</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Mengecek apakah login menggunakan nomor telepon (OTP)
const isPhoneLogin = ref(localStorage.getItem('is_phone_login') === 'true')

const bookings = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const API_BASE_URL = 'http://192.168.69.139:8080/api'

// Fungsi untuk mengambil data booking asli dari backend Go
const fetchBookings = async () => {
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

      bookings.value = dataBookings.map(item => {
        // Mapping Service
        let serviceName = 'Layanan Cukur'
        const s = item.Service || item.service
        if (typeof s === 'object' && s !== null) {
          serviceName = s.name || s.Name || 'Layanan Cukur'
        } else if (typeof s === 'string') {
          serviceName = s
        }

        // Mapping User/Pelanggan
        let customerName = 'Pelanggan'
        const u = item.User || item.user
        if (typeof u === 'object' && u !== null) {
          customerName = u.name || u.Name || 'Pelanggan'
        } else if (typeof u === 'string') {
          customerName = u
        }

        // Mapping Barber
        let barberName = '-'
        const b = item.Barber || item.barber
        if (typeof b === 'object' && b !== null) {
          barberName = b.name || b.Name || '-'
        } else if (typeof b === 'string') {
          barberName = b
        }

        return {
          rawId: item.ID || item.id,
          customer: customerName,
          phone: item.User?.Phone || item.User?.phone || item.Phone || item.phone || '-',
          service: serviceName,
          barber: barberName,
          datetime: (item.BookingTime || item.booking_time) ? new Date(item.BookingTime || item.booking_time).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-',
          status: (item.Status || item.status || 'PENDING').toUpperCase()
        }
      })
    } else {
      errorMessage.value = result.error || 'Gagal mengambil data booking dari server.'
    }
  } catch (err) {
    errorMessage.value = 'Terjadi kesalahan koneksi ke server backend.'
  } finally {
    isLoading.value = false
  }
}

// Fungsi untuk memperbarui status booking menjadi 'completed'
const updateStatus = async (id, status) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    })

    if (response.ok) {
      fetchBookings() // Ambil ulang data terbaru setelah di-update
    } else {
      const errRes = await response.json().catch(() => ({}))
      alert(errRes.error || 'Gagal memperbarui status.')
    }
  } catch (err) {
    alert('Terjadi kesalahan koneksi.')
  }
}

onMounted(() => {
  fetchBookings()
})
</script>

<style scoped>
.booking-page h2 { margin: 0; font-size: 1.35rem; color: #0f172a; }
.text-muted { color: #64748b; font-size: 0.85rem; margin-bottom: 1rem; }
.card { background: #fff; padding: 1.2rem; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left; }
.data-table th, .data-table td { padding: 0.75rem 0.5rem; border-bottom: 1px solid #f1f5f9; color: #334155; }
.data-table th { background-color: #f8fafc; color: #475569; font-weight: 600; }

.badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.5px; }
.badge.completed, .badge.selesai, .badge.done { background-color: #dcfce7; color: #15803d; }
.badge.pending, .badge.menunggu { background-color: #fef3c7; color: #b45309; }

.btn-action-done {
  background-color: #15803d;
  color: #ffffff;
  border: none;
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-action-done:hover { background-color: #166534; }

.text-completed { color: #94a3b8; font-size: 0.85rem; }
.loading-state, .error-state, .empty-text { text-align: center; padding: 1.5rem; color: #64748b; font-size: 0.9rem; }
.error-state { color: #ef4444; }
</style>