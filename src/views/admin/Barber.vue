<template>
  <div class="barber-page">
    <div class="header-section">
      <div>
        <h2>Kelola Data Barber</h2>
        <p class="text-muted">Daftar tukang cukur (barber) yang aktif di Barberly.</p>
      </div>
      <button @click="showAddModal = true" class="btn-primary">+ Tambah Barber</button>
    </div>

    <!-- Loading & Error State -->
    <div v-if="isLoading" class="loading-state">Memuat data barber dari server...</div>
    <div v-if="errorMessage" class="error-state">{{ errorMessage }}</div>

    <div class="card" v-if="!isLoading">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Barber</th>
            <th>Spesialisasi / Kontak</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="barbers.length === 0">
            <td colspan="5" class="empty-text">Belum ada data barber.</td>
          </tr>
          <tr v-for="b in barbers" :key="b.rawId">
            <td>#{{ b.rawId }}</td>
            <td><strong>{{ b.name }}</strong></td>
            <td>{{ b.specialty || '-' }}</td>
            <td>
              <span class="badge-status active">Aktif</span>
            </td>
            <td>
              <button @click="deleteBarber(b.rawId)" class="btn-delete">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Tambah Barber -->
    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal-card">
        <h3>Tambah Barber Baru</h3>
        <form @submit.prevent="submitBarber">
          <div class="form-group">
            <label>Nama Barber</label>
            <input type="text" v-model="newBarber.name" required placeholder="Contoh: Rian Fade" />
          </div>
          <div class="form-group">
            <label>Spesialisasi / Keahlian</label>
            <input type="text" v-model="newBarber.specialty" placeholder="Contoh: Fade & Styling" />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddModal = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const barbers = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const showAddModal = ref(false)

const newBarber = ref({
  name: '',
  specialty: ''
})

const API_BASE_URL = 'http://192.168.69.139:8080/api'

const fetchBarbers = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const token = localStorage.getItem('token')
    // Sesuaikan endpoint backend Go Anda, misal /barbers atau /users?role=barber
    const response = await fetch(`${API_BASE_URL}/barbers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    const result = await response.json()

    if (response.ok) {
      const dataBarbers = result.data || result
      barbers.value = dataBarbers.map(item => ({
        rawId: item.ID || item.id,
        name: item.Name || item.name || 'Barber',
        specialty: item.Specialty || item.specialty || item.Phone || item.phone || ''
      }))
    } else {
      errorMessage.value = result.error || 'Gagal mengambil data barber.'
    }
  } catch (err) {
    errorMessage.value = 'Terjadi kesalahan koneksi ke server backend.'
  } finally {
    isLoading.value = false
  }
}

const submitBarber = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/barbers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: newBarber.value.name,
        specialty: newBarber.value.specialty
      })
    })

    if (response.ok) {
      showAddModal.value = false
      newBarber.value = { name: '', specialty: '' }
      fetchBarbers()
    } else {
      const errRes = await response.json().catch(() => ({}))
      alert(errRes.error || 'Gagal menambahkan barber.')
    }
  } catch (err) {
    alert('Terjadi kesalahan koneksi.')
  }
}

const deleteBarber = async (id) => {
  if (!confirm('Yakin ingin menghapus barber ini?')) return

  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/barbers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      fetchBarbers()
    } else {
      alert('Gagal menghapus barber.')
    }
  } catch (err) {
    alert('Terjadi kesalahan koneksi.')
  }
}

onMounted(() => {
  fetchBarbers()
})
</script>

<style scoped>
.barber-page { width: 100%; box-sizing: border-box; }
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.barber-page h2 { margin: 0; font-size: 1.35rem; color: #0f172a; }
.text-muted { color: #64748b; font-size: 0.85rem; margin: 0.25rem 0 0 0; }
.card { background: #fff; padding: 1.2rem; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left; }
.data-table th, .data-table td { padding: 0.75rem 0.5rem; border-bottom: 1px solid #f1f5f9; color: #334155; }
.data-table th { background-color: #f8fafc; color: #475569; font-weight: 600; }

.badge-status { background-color: #dcfce7; color: #15803d; padding: 0.25rem 0.5rem; font-size: 0.75rem; font-weight: 600; border-radius: 4px; }

.btn-primary { background-color: #2563eb; color: #fff; border: none; padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 600; border-radius: 6px; cursor: pointer; }
.btn-primary:hover { background-color: #1d4ed8; }
.btn-secondary { background-color: #e2e8f0; color: #334155; border: none; padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 600; border-radius: 6px; cursor: pointer; }
.btn-delete { background-color: #ef4444; color: #fff; border: none; padding: 0.3rem 0.6rem; font-size: 0.75rem; font-weight: 600; border-radius: 6px; cursor: pointer; }
.btn-delete:hover { background-color: #dc2626; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-card { background: #fff; padding: 1.5rem; border-radius: 10px; width: 100%; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.modal-card h3 { margin-top: 0; margin-bottom: 1rem; font-size: 1.1rem; color: #0f172a; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.3rem; }
.form-group input { width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; box-sizing: border-box; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.2rem; }

.loading-state, .error-state, .empty-text { text-align: center; padding: 1.5rem; color: #64748b; font-size: 0.9rem; }
.error-state { color: #ef4444; }
</style>