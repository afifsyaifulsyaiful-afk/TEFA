<template>
  <div class="master-page">
    <div class="header-section">
      <div>
        <h2>Manajemen Data Master</h2>
        <p class="text-muted">Kelola layanan, barber, jadwal, dan data pelanggan Barberly.</p>
      </div>
      <!-- Tab Navigasi Internal -->
      <div class="sub-tabs">
        <button :class="{ active: currentSubTab === 'layanan' }" @click="currentSubTab = 'layanan'">✂️ Layanan</button>
        <button :class="{ active: currentSubTab === 'barber' }" @click="currentSubTab = 'barber'">💈 Barber</button>
        <button :class="{ active: currentSubTab === 'jadwal' }" @click="currentSubTab = 'jadwal'">📅 Jadwal</button>
        <button :class="{ active: currentSubTab === 'pelanggan' }" @click="currentSubTab = 'pelanggan'">👥 Pelanggan</button>
      </div>
    </div>

    <!-- 1. TAB LAYANAN -->
    <div v-if="currentSubTab === 'layanan'" class="card">
      <div class="card-header">
        <h3>Daftar Layanan</h3>
        <button @click="showServiceModal = true" class="btn-primary">+ Tambah Layanan</button>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Layanan</th>
            <th>Harga</th>
            <th>Durasi</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in services" :key="s.rawId">
            <td>#{{ s.rawId }}</td>
            <td><strong>{{ s.name }}</strong></td>
            <td>Rp {{ s.price.toLocaleString('id-ID') }}</td>
            <td>{{ s.duration }} menit</td>
            <td><button @click="deleteItem('services', s.rawId)" class="btn-delete">Hapus</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 2. TAB BARBER -->
    <div v-if="currentSubTab === 'barber'" class="card">
      <div class="card-header">
        <h3>Daftar Tukang Cukur (Barber)</h3>
        <button @click="showBarberModal = true" class="btn-primary">+ Tambah Barber</button>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Barber</th>
            <th>Spesialisasi</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in barbers" :key="b.rawId">
            <td>#{{ b.rawId }}</td>
            <td><strong>{{ b.name }}</strong></td>
            <td>{{ b.specialty || '-' }}</td>
            <td><span class="badge-status">Aktif</span></td>
            <td><button @click="deleteItem('barbers', b.rawId)" class="btn-delete">Hapus</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 3. TAB JADWAL BARBER -->
    <div v-if="currentSubTab === 'jadwal'" class="card">
      <div class="card-header">
        <h3>Jadwal Kerja Barber</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Barber</th>
            <th>Hari Kerja</th>
            <th>Jam Operasional</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in barbers" :key="'j-'+b.rawId">
            <td><strong>{{ b.name }}</strong></td>
            <td>{{ b.schedule?.days || 'Senin - Sabtu' }}</td>
            <td>{{ b.schedule?.hours || '09:00 - 21:00' }}</td>
            <td>
              <span :class="['badge-status', b.schedule?.status === 'Libur' ? 'badge-libur' : '']">
                {{ b.schedule?.status || 'Masuk' }}
              </span>
            </td>
            <td>
              <button @click="openScheduleModal(b)" class="btn-secondary">Atur Jadwal</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 4. TAB PELANGGAN -->
    <div v-if="currentSubTab === 'pelanggan'" class="card">
      <div class="card-header">
        <h3>Daftar Data Pelanggan</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Pelanggan</th>
            <th>Email / Kontak</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="customers.length === 0">
            <td colspan="4" class="empty-text">Belum ada data pelanggan tersimpan.</td>
          </tr>
          <tr v-for="c in customers" :key="c.id">
            <td>#{{ c.id }}</td>
            <td><strong>{{ c.name }}</strong></td>
            <td>{{ c.email || c.phone || '-' }}</td>
            <td><span class="badge-role">{{ c.role || 'Customer' }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL TAMBAH LAYANAN -->
    <div v-if="showServiceModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Tambah Layanan Baru</h3>
        <form @submit.prevent="submitService">
          <div class="form-group">
            <label>Nama Layanan</label>
            <input type="text" v-model="newService.name" placeholder="Contoh: Haircut + Wash" required />
          </div>
          <div class="form-group">
            <label>Harga (Rp)</label>
            <input type="number" v-model="newService.price" placeholder="Contoh: 50000" required />
          </div>
          <div class="form-group">
            <label>Durasi (Menit)</label>
            <input type="number" v-model="newService.duration" placeholder="Contoh: 30" required />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showServiceModal = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL TAMBAH BARBER -->
    <div v-if="showBarberModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Tambah Barber Baru</h3>
        <form @submit.prevent="submitBarber">
          <div class="form-group">
            <label>Nama Barber</label>
            <input type="text" v-model="newBarber.name" placeholder="Contoh: Rian Fade" required />
          </div>
          <div class="form-group">
            <label>Spesialisasi</label>
            <input type="text" v-model="newBarber.specialty" placeholder="Contoh: Classic Cut & Pompadour" required />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showBarberModal = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL ATUR JADWAL BARBER -->
    <div v-if="showScheduleModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Atur Jadwal: {{ activeBarber?.name }}</h3>
        <form @submit.prevent="saveSchedule">
          <div class="form-group">
            <label>Hari Kerja</label>
            <input type="text" v-model="scheduleForm.days" placeholder="Contoh: Senin - Sabtu" required />
          </div>
          <div class="form-group">
            <label>Jam Operasional</label>
            <input type="text" v-model="scheduleForm.hours" placeholder="Contoh: 09:00 - 21:00" required />
          </div>
          <div class="form-group">
            <label>Status Kehadiran</label>
            <select v-model="scheduleForm.status" class="form-select">
              <option value="Masuk">Masuk</option>
              <option value="Libur">Libur</option>
              <option value="Cuti">Cuti</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showScheduleModal = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary">Simpan Jadwal</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentSubTab = ref('layanan')

const updateTabFromRoute = () => {
  if (route.path.includes('barber')) currentSubTab.value = 'barber'
  else if (route.path.includes('services')) currentSubTab.value = 'layanan'
  else if (route.path.includes('schedule')) currentSubTab.value = 'jadwal'
  else if (route.path.includes('customers')) currentSubTab.value = 'pelanggan'
}

watch(() => route.path, updateTabFromRoute, { immediate: true })

const services = ref([])
const barbers = ref([])
const customers = ref([])

// State Modal Layanan
const showServiceModal = ref(false)
const newService = ref({ name: '', price: 0, duration: 30 })

// State Modal Barber
const showBarberModal = ref(false)
const newBarber = ref({ name: '', specialty: '' })

// State Modal Jadwal
const showScheduleModal = ref(false)
const activeBarber = ref(null)
const scheduleForm = ref({ days: 'Senin - Sabtu', hours: '09:00 - 21:00', status: 'Masuk' })

const API_BASE_URL = 'http://192.168.69.139:8080/api'
const token = localStorage.getItem('token')

const fetchAllData = async () => {
  try {
    // 1. Fetch Layanan
    const resS = await fetch(`${API_BASE_URL}/services`, { headers: { 'Authorization': `Bearer ${token}` } })
    const dataS = await resS.json()
    if (resS.ok) {
      services.value = (dataS.data || dataS).map(i => ({ 
        rawId: i.ID || i.id, 
        name: i.Name || i.name, 
        price: i.Price || i.price, 
        duration: i.Duration || i.duration || i.Durasi || 30 
      }))
    }

    // 2. Fetch Barber
    const resB = await fetch(`${API_BASE_URL}/barbers`, { headers: { 'Authorization': `Bearer ${token}` } })
    const dataB = await resB.json()
    if (resB.ok) {
      barbers.value = (dataB.data || dataB).map(i => {
        const savedSchedule = JSON.parse(localStorage.getItem(`schedule_${i.ID || i.id}`))
        return { 
          rawId: i.ID || i.id, 
          name: i.Name || i.name, 
          specialty: i.Specialty || i.specialty,
          schedule: savedSchedule || { days: 'Senin - Sabtu', hours: '09:00 - 21:00', status: 'Masuk' }
        }
      })
    }

    // 3. Fetch Pelanggan dari data Booking (Mengatasi error 404 /api/users)
    const resBooking = await fetch(`${API_BASE_URL}/bookings`, { headers: { 'Authorization': `Bearer ${token}` } })
    const dataBooking = await resBooking.json()
    if (resBooking.ok) {
      const list = dataBooking.data || dataBooking
      const uniqueCust = []
      list.forEach((item) => {
        // Menangkap berbagai kemungkinan struktur relasi user di backend Go
        const name = item.User?.Name || item.User?.name || item.customer_name || item.CustomerName
        const email = item.User?.Email || item.User?.email || item.email || '-'
        const phone = item.User?.Phone || item.User?.phone || item.phone || '-'
        
        if (name && !uniqueCust.some(c => c.name === name)) {
          uniqueCust.push({
            id: uniqueCust.length + 1,
            name: name,
            email: email,
            phone: phone,
            role: 'Customer'
          })
        }
      })
      customers.value = uniqueCust
    }
  } catch (err) {
    console.error('Gagal mengambil data:', err)
  }
}

const submitService = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: newService.value.name, price: Number(newService.value.price), duration: Number(newService.value.duration) })
    })
    if (res.ok) {
      showServiceModal.value = false
      newService.value = { name: '', price: 0, duration: 30 }
      fetchAllData()
    } else { alert('Gagal menambah layanan') }
  } catch (err) { console.error(err) }
}

const submitBarber = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/barbers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: newBarber.value.name, specialty: newBarber.value.specialty })
    })
    if (res.ok) {
      showBarberModal.value = false
      newBarber.value = { name: '', specialty: '' }
      fetchAllData()
    } else { alert('Gagal menambah barber') }
  } catch (err) { console.error(err) }
}

const openScheduleModal = (barber) => {
  activeBarber.value = barber
  scheduleForm.value = { ...barber.schedule }
  showScheduleModal.value = true
}

const saveSchedule = () => {
  if (activeBarber.value) {
    localStorage.setItem(`schedule_${activeBarber.value.rawId}`, JSON.stringify(scheduleForm.value))
    activeBarber.value.schedule = { ...scheduleForm.value }
    showScheduleModal.value = false
  }
}

const deleteItem = async (endpoint, id) => {
  if (!confirm('Yakin ingin menghapus data ini?')) return
  await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (endpoint === 'barbers') {
    localStorage.removeItem(`schedule_${id}`)
  }
  fetchAllData()
}

onMounted(() => { fetchAllData() })
</script>

<style scoped>
.master-page { width: 100%; box-sizing: border-box; }
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.text-muted { color: #64748b; font-size: 0.85rem; margin: 0.25rem 0 0 0; }
.sub-tabs { display: flex; gap: 0.3rem; background: #e2e8f0; padding: 0.25rem; border-radius: 8px; }
.sub-tabs button { background: transparent; border: none; padding: 0.4rem 0.8rem; font-size: 0.8rem; font-weight: 600; color: #475569; cursor: pointer; border-radius: 6px; }
.sub-tabs button.active { background: #fff; color: #2563eb; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.card { background: #fff; padding: 1.2rem; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.card-header h3 { margin: 0; font-size: 1.05rem; color: #0f172a; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left; }
.data-table th, .data-table td { padding: 0.75rem 0.5rem; border-bottom: 1px solid #f1f5f9; color: #334155; }
.data-table th { background-color: #f8fafc; font-weight: 600; }
.badge-status { background-color: #dcfce7; color: #15803d; padding: 0.2rem 0.5rem; font-size: 0.75rem; font-weight: bold; border-radius: 4px; }
.badge-libur { background-color: #fee2e2; color: #b91c1c; }
.badge-role { background-color: #e0f2fe; color: #0369a1; padding: 0.2rem 0.5rem; font-size: 0.75rem; font-weight: bold; border-radius: 4px; }
.btn-primary { background-color: #2563eb; color: #fff; border: none; padding: 0.4rem 0.8rem; font-size: 0.8rem; font-weight: 600; border-radius: 6px; cursor: pointer; }
.btn-secondary { background-color: #64748b; color: #fff; border: none; padding: 0.4rem 0.8rem; font-size: 0.8rem; font-weight: 600; border-radius: 6px; cursor: pointer; }
.btn-delete { background-color: #ef4444; color: #fff; border: none; padding: 0.3rem 0.6rem; font-size: 0.75rem; font-weight: 600; border-radius: 6px; cursor: pointer; }
.empty-text { text-align: center; color: #64748b; padding: 1.5rem !important; }

/* Modal Styling */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: #fff; padding: 1.5rem; border-radius: 10px; width: 100%; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.modal-content h3 { margin-top: 0; margin-bottom: 1rem; color: #0f172a; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 0.3rem; }
.form-group input, .form-select { width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; background: #fff; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem; }
</style>