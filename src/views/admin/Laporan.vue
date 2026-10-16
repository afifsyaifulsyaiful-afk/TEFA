<template>
  <div class="financial-report-container">
    <header class="top-header">
      <h1>Laporan Keuangan</h1>
      <p class="subtitle">Pantau ringkasan transaksi, pendapatan, dan rekapitulasi keuangan Barberly.</p>
    </header>

    <!-- Stat Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <p class="stat-title">TOTAL PENDAPATAN</p>
        <h3 class="stat-value">
          {{ isLoading ? '...' : 'Rp ' + totalRevenue.toLocaleString('id-ID') }}
        </h3>
      </div>
      <div class="stat-card">
        <p class="stat-title">TOTAL TRANSAKSI SELESAI</p>
        <h3 class="stat-value">
          {{ isLoading ? '...' : completedTransactions.length + ' Layanan' }}
        </h3>
      </div>
    </div>

    <!-- Tabel Riwayat -->
    <div class="table-section">
      <div class="table-header">
        <h3>Riwayat Transaksi Pendapatan</h3>
        <p class="table-subtitle">Daftar layanan barbershop yang telah selesai dan menghasilkan pemasukan.</p>
      </div>

      <div v-if="isLoading" class="loading-state">Memuat data transaksi real...</div>
      <div v-else-if="errorMessage" class="error-state">{{ errorMessage }}</div>

      <div v-else class="table-responsive">
        <table class="report-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Pelanggan</th>
              <th>Layanan</th>
              <th>Barber</th>
              <th>Pendapatan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="completedTransactions.length === 0">
              <td colspan="6" class="empty-text">Belum ada transaksi selesai yang tercatat.</td>
            </tr>
            <tr v-for="(item, index) in completedTransactions" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.date }}</td>
              <td>{{ item.customer }}</td>
              <td>{{ item.service }}</td>
              <td>{{ item.barber }}</td>
              <td class="amount-text">Rp {{ item.price.toLocaleString('id-ID') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const completedTransactions = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Hitung total akumulasi pendapatan dari daftar transaksi completed
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

      // Filter hanya booking dengan status COMPLETED / SELESAI
      const finished = data.filter(item => {
        const status = (item.Status || item.status || '').toUpperCase()
        return status === 'COMPLETED' || status === 'DONE' || status === 'SELESAI'
      })

      // Mapping data terstruktur
      completedTransactions.value = finished.map((item, idx) => {
        // Ambil Nama Layanan & Harga
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

        // Ambil Nama Pelanggan
        let customerName = '-'
        const u = item.User || item.user
        if (typeof u === 'object' && u !== null) {
          customerName = u.name || u.Name || '-'
        } else if (typeof u === 'string') {
          customerName = u
        }

        // Ambil Nama Barber
        let barberName = '-'
        const b = item.Barber || item.barber
        if (typeof b === 'object' && b !== null) {
          barberName = b.name || b.Name || '-'
        } else if (typeof b === 'string') {
          barberName = b
        }

        // Formating Tanggal
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

onMounted(() => {
  fetchFinancialReports()
})
</script>

<style scoped>
.financial-report-container {
  padding: 0;
  width: 100%;
}

.top-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.subtitle {
  margin: 0.25rem 0 1.5rem 0;
  color: #64748b;
  font-size: 0.875rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stat-title {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.5px;
}

.stat-value {
  margin: 0.5rem 0 0 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
}

.table-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.table-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
}

.table-subtitle {
  margin: 0.25rem 0 1rem 0;
  font-size: 0.8rem;
  color: #64748b;
}

.loading-state, .error-state, .empty-text {
  text-align: center;
  padding: 2rem;
  color: #64748b;
  font-size: 0.875rem;
}

.error-state {
  color: #ef4444;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

.report-table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.report-table td {
  padding: 0.85rem 1rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
}

.amount-text {
  color: #15803d;
  font-weight: 700;
}
</style>