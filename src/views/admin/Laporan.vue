<template>
  <div class="reports-page">
    <!-- Header Section -->
    <div class="page-header-flex">
      <div>
        <h1>Laporan & Ulasan</h1>
        <p class="subtitle">Pantau ringkasan transaksi pendapatan serta ulasan dan rating dari pelanggan Barberly.</p>
      </div>

      <!-- Tab Navigation Switcher -->
      <div class="tab-switcher">
        <button 
          :class="['tab-btn', activeTab === 'reports' ? 'active' : '']" 
          @click="activeTab = 'reports'"
        >
          Laporan Keuangan
        </button>
        <button 
          :class="['tab-btn', activeTab === 'reviews' ? 'active' : '']" 
          @click="activeTab = 'reviews'"
        >
          Ulasan Pelanggan
        </button>
      </div>
    </div>

    <!-- TAB 1: LAPORAN KEUANGAN -->
    <div v-if="activeTab === 'reports'" class="tab-content">
      <!-- Stat Cards Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-info">
            <p class="stat-title">TOTAL PENDAPATAN</p>
            <h3 class="stat-value">
              {{ isLoading ? '...' : 'Rp ' + totalRevenue.toLocaleString('id-ID') }}
            </h3>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <p class="stat-title">TOTAL TRANSAKSI SELESAI</p>
            <h3 class="stat-value">
              {{ isLoading ? '...' : completedTransactions.length + ' Layanan' }}
            </h3>
          </div>
        </div>
      </div>

      <!-- Tabel Riwayat Keuangan -->
      <div class="content-card">
        <div class="card-header">
          <div>
            <h3>Riwayat Transaksi Pendapatan</h3>
            <p class="card-subtitle">Daftar layanan barbershop yang telah selesai dan menghasilkan pemasukan.</p>
          </div>
        </div>

        <div v-if="isLoading" class="state-container">Memuat data transaksi...</div>
        <div v-else-if="errorMessage" class="state-container error">{{ errorMessage }}</div>

        <div v-else class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th width="60">No</th>
                <th>Tanggal</th>
                <th>Pelanggan</th>
                <th>Layanan</th>
                <th>Barber</th>
                <th class="text-right">Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="completedTransactions.length === 0">
                <td colspan="6" class="empty-row">Belum ada transaksi selesai yang tercatat.</td>
              </tr>
              <tr v-for="(item, index) in completedTransactions" :key="item.id">
                <td class="text-muted">{{ index + 1 }}</td>
                <td>{{ item.date }}</td>
                <td><span class="fw-medium">{{ item.customer }}</span></td>
                <td>{{ item.service }}</td>
                <td><span class="badge-barber">{{ item.barber }}</span></td>
                <td class="text-right amount-text">Rp {{ item.price.toLocaleString('id-ID') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: ULASAN PELANGGAN -->
    <div v-if="activeTab === 'reviews'" class="tab-content">
      <div class="content-card">
        <div class="card-header">
          <div>
            <h3>Ulasan & Rating Pelanggan</h3>
            <p class="card-subtitle">Daftar ulasan, komentar, dan bintang dari pelanggan yang telah menggunakan layanan.</p>
          </div>
        </div>

        <div v-if="isLoadingReviews" class="state-container">Memuat data ulasan...</div>
        <div v-else-if="reviewError" class="state-container error">{{ reviewError }}</div>

        <div v-else class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th width="60">No</th>
                <th>Tanggal</th>
                <th>Pelanggan</th>
                <th>Barber</th>
                <th width="140">Rating</th>
                <th>Komentar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reviewsList.length === 0">
                <td colspan="6" class="empty-row">Belum ada ulasan dari pelanggan.</td>
              </tr>
              <tr v-for="(rev, idx) in reviewsList" :key="rev.id || idx">
                <td class="text-muted">{{ idx + 1 }}</td>
                <td>{{ rev.date }}</td>
                <td><span class="fw-medium">{{ rev.customer }}</span></td>
                <td><span class="badge-barber">{{ rev.barber }}</span></td>
                <td>
                  <span class="badge-rating">{{ rev.rating }} / 5 Bintang</span>
                </td>
                <td class="comment-text">{{ rev.comment || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const activeTab = ref('reports')

const completedTransactions = ref([])
const reviewsList = ref([])

const isLoading = ref(true)
const isLoadingReviews = ref(true)
const errorMessage = ref('')
const reviewError = ref('')

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const totalRevenue = computed(() => {
  return completedTransactions.value.reduce((acc, item) => acc + item.price, 0)
})

const fetchFinancialReports = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const token = localStorage.getItem('token')
    if (!token) {
      errorMessage.value = 'Sesi berakhir, silakan login ulang.'
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
      const data = result.data || result
      const finished = data.filter(item => {
        const status = (item.Status || item.status || '').toUpperCase()
        return status === 'COMPLETED' || status === 'DONE' || status === 'SELESAI'
      })

      completedTransactions.value = finished.map((item, idx) => {
        let serviceName = '-'
        let price = 0
        const s = item.Service || item.service

        if (typeof s === 'object' && s !== null) {
          serviceName = s.name || s.Name || '-'
          price = s.price || s.Price || 0
        } else if (typeof s === 'string' && s.startsWith('{')) {
          try {
            const parsed = JSON.parse(s)
            serviceName = parsed.name || '-'
            price = parsed.price || 0
          } catch (e) {
            serviceName = s
          }
        } else {
          serviceName = item.service_name || s || '-'
          price = item.price || item.Price || 0
        }

        let customerName = '-'
        const u = item.User || item.user
        if (typeof u === 'object' && u !== null) {
          customerName = u.name || u.Name || '-'
        } else if (typeof u === 'string') {
          customerName = u
        }

        let barberName = '-'
        const b = item.Barber || item.barber
        if (typeof b === 'object' && b !== null) {
          barberName = b.name || b.Name || '-'
        } else if (typeof b === 'string') {
          barberName = b
        }

        const rawTime = item.BookingTime || item.booking_time
        const formattedDate = rawTime 
          ? new Date(rawTime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
          : '-'

        return {
          id: item.ID || item.id || idx,
          date: formattedDate,
          customer: customerName,
          service: serviceName,
          barber: barberName,
          price: price
        }
      })
    } else {
      errorMessage.value = result.error || 'Gagal memuat data laporan keuangan.'
    }
  } catch (err) {
    console.error(err)
    errorMessage.value = 'Terjadi kesalahan koneksi ke backend.'
  } finally {
    isLoading.value = false
  }
}

const fetchAdminReviews = async () => {
  isLoadingReviews.value = true
  reviewError.value = ''

  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await fetch(`${API_BASE_URL}/admin/reviews`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    const result = await response.json()

    if (response.ok) {
      const rawReviews = result.data || result
      reviewsList.value = rawReviews.map(rev => {
        let custName = 'Pelanggan'
        if (rev.User && rev.User.name) custName = rev.User.name
        else if (rev.user && rev.user.name) custName = rev.user.name

        let barbName = '-'
        if (rev.Barber && rev.Barber.name) barbName = rev.Barber.name
        else if (rev.barber && rev.barber.name) barbName = rev.barber.name

        const createdAt = rev.CreatedAt || rev.created_at
        const formattedDate = createdAt
          ? new Date(createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
          : '-'

        return {
          id: rev.ID || rev.id,
          date: formattedDate,
          customer: custName,
          barber: barbName,
          rating: rev.Rating || rev.rating || 0,
          comment: rev.Comment || rev.comment || ''
        }
      })
    } else {
      reviewError.value = result.error || 'Gagal memuat data ulasan.'
    }
  } catch (err) {
    console.error(err)
    reviewError.value = 'Terjadi kesalahan koneksi saat mengambil ulasan.'
  } finally {
    isLoadingReviews.value = false
  }
}

onMounted(() => {
  fetchFinancialReports()
  fetchAdminReviews()
})
</script>

<style scoped>
.reports-page {
  padding: 1.5rem;
  background-color: #f8fafc;
  min-height: 100vh;
  box-sizing: border-box;
}

.page-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.75rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-header-flex h1 {
  margin: 0;
  font-size: 1.65rem;
  font-weight: 700;
  color: #0f172a;
}

.subtitle {
  margin: 0.35rem 0 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.tab-switcher {
  display: flex;
  background-color: #e2e8f0;
  padding: 0.25rem;
  border-radius: 8px;
  gap: 0.25rem;
}

.tab-btn {
  background: transparent;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: #0f172a;
}

.tab-btn.active {
  background-color: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.75rem;
}

.stat-card {
  background: #ffffff;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-title {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.5px;
}

.stat-value {
  margin: 0.35rem 0 0 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
}

.content-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
  margin-bottom: 1.75rem;
  overflow: hidden;
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
}

.card-subtitle {
  margin: 0.2rem 0 0 0;
  font-size: 0.825rem;
  color: #64748b;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

.modern-table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
}

.modern-table td {
  padding: 1.0rem 1.25rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
}

.modern-table tbody tr:hover {
  background-color: #f8fafc;
}

.text-right {
  text-align: right;
}

.text-muted {
  color: #94a3b8;
}

.fw-medium {
  font-weight: 500;
  color: #0f172a;
}

.amount-text {
  color: #16a34a;
  font-weight: 700;
}

.badge-barber {
  background-color: #f1f5f9;
  color: #475569;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

.badge-rating {
  background-color: #fef9c3;
  color: #a16207;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8rem;
}

.comment-text {
  font-style: italic;
  color: #64748b;
}

.state-container {
  text-align: center;
  padding: 2.5rem;
  color: #64748b;
  font-size: 0.9rem;
}

.state-container.error {
  color: #ef4444;
}

.empty-row {
  text-align: center;
  color: #94a3b8;
  padding: 2rem !important;
}
</style>