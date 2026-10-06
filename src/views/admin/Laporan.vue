<template>
  <div class="laporan-container">
    <div class="header-section">
      <h2>Laporan Keuangan</h2>
      <p>Pantau ringkasan transaksi, pendapatan, dan rekapitulasi keuangan Barberly.</p>
    </div>

    <!-- KARTU RINGKASAN STATISTIK -->
    <div class="stats-grid">
      <div class="stat-card">
        <h4>Total Pendapatan</h4>
        <p class="stat-value">Rp {{ formatRupiah(summary?.total_revenue || 0) }}</p>
      </div>
      <div class="stat-card">
        <h4>Total Transaksi Selesai</h4>
        <p class="stat-value">{{ summary?.total_transactions || 0 }} Layanan</p>
      </div>
    </div>

    <!-- TABEL RIWAYAT TRANSAKSI -->
    <div class="card">
      <h3>Riwayat Transaksi Pendapatan</h3>
      <p class="section-desc">Daftar layanan barbershop yang telah selesai dan menghasilkan pemasukan.</p>
      
      <div v-if="loading" class="text-center py-4">
        <p>Memuat laporan keuangan...</p>
      </div>

      <div v-else-if="transactions.length > 0" class="table-responsive">
        <table class="data-table">
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
            <tr v-for="(item, index) in transactions" :key="item.id || index">
              <td>{{ index + 1 }}</td>
              <td>{{ formatDate(item.booking_time || item.created_at) }}</td>
              <td><strong>{{ item.user?.name || item.customer_name || 'Pelanggan' }}</strong></td>
              <td>
                <span class="service-tag">{{ item.service?.name || item.service_name || '-' }}</span>
              </td>
              <td>{{ item.barber?.name || item.barber_name || '-' }}</td>
              <td class="price-text">Rp {{ formatRupiah(item.service?.price || item.total_price || item.price || 0) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="placeholder-box">
        <p>📊 Belum ada data transaksi yang selesai.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const summary = ref({ total_revenue: 0, total_transactions: 0 })
const transactions = ref([])
const loading = ref(false)

const fetchFinancialReport = async () => {
  loading.value = true
  try {
    // Gunakan '/admin/reports/financial' (tanpa double /api)
    const response = await api.get('/admin/reports/financial')
    
    console.log('Respon Backend Laporan:', response.data)

    const result = response.data.data || response.data

    summary.value = {
      total_revenue: result.total_revenue ?? result.total_pendapatan ?? 0,
      total_transactions: result.total_transactions ?? result.total_layanan ?? result.total_booking ?? 0
    }

    const rawList = result.transactions || result.data || result.bookings || result.reports || []
    transactions.value = Array.isArray(rawList) ? rawList : []

  } catch (error) {
    console.error('Gagal memuat laporan keuangan:', error)
  } finally {
    loading.value = false
  }
}

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID').format(angka || 0)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  return new Date(dateString).toLocaleDateString('id-ID', options)
}

onMounted(() => {
  fetchFinancialReport()
})
</script>

<style scoped>
.laporan-container {
  padding: 0.5rem;
}

.header-section {
  margin-bottom: 1.5rem;
}

.header-section h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.3rem 0;
}

.header-section p {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stat-card h4 {
  margin: 0 0 0.4rem 0;
  font-size: 0.85rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: #031b33;
}

.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card h3 {
  margin: 0 0 0.2rem 0;
  font-size: 1.1rem;
  color: #1e293b;
}

.section-desc {
  color: #64748b;
  font-size: 0.85rem;
  margin-bottom: 1.2rem;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.data-table th, .data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.data-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
}

.service-tag {
  display: inline-block;
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.8rem;
}

.price-text {
  font-weight: 600;
  color: #16a34a;
}

.placeholder-box {
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  color: #64748b;
  font-weight: 500;
}

.text-center {
  text-align: center;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
</style>