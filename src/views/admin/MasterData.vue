<template>
  <div class="master-page">
    <div class="header-section">
      <div>
        <h2>Manajemen Data Master</h2>
        <p class="text-muted">Kelola layanan, barber, jadwal, dan data pelanggan Barberly.</p>
      </div>
      <!-- Tab Navigasi Internal -->
      <div class="sub-tabs">
        <button :class="{ active: currentSubTab === 'layanan' }" @click="currentSubTab = 'layanan'">Layanan</button>
        <button :class="{ active: currentSubTab === 'barber' }" @click="currentSubTab = 'barber'">Barber</button>
        <button :class="{ active: currentSubTab === 'jadwal' }" @click="currentSubTab = 'jadwal'">Jadwal</button>
        <button :class="{ active: currentSubTab === 'pelanggan' }" @click="currentSubTab = 'pelanggan'">Pelanggan</button>
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

    <!-- 2. TAB BARBER (TAMPILAN PER KOTAK / GRID) -->
    <div v-if="currentSubTab === 'barber'" class="card-container-section">
      <div class="card-header-flex">
        <h3>Daftar Tukang Cukur (Barber)</h3>
        <button @click="openBarberModal" class="btn-primary">+ Tambah Barber</button>
      </div>
      
      <div class="grid-cards">
        <div v-for="b in barbers" :key="b.rawId" class="barber-card-box">
          <div class="card-badge">#{{ b.rawId }}</div>
          <div class="avatar-wrapper">
            <img :src="b.avatar ? `${API_BASE_URL.replace('/api', '')}${b.avatar}` : 'https://via.placeholder.com/100'" 
                 alt="Avatar" class="barber-avatar-grid" />
          </div>
          <div class="barber-info">
            <h4 class="barber-name">{{ b.name }}</h4>
            <p class="barber-specialty"> {{ b.specialty || 'Semua Layanan' }}</p>
            <div class="barber-status-badge">
              <span class="badge-status">Aktif</span>
            </div>
          </div>
          <div class="card-actions">
            <button @click="openAvatarModal(b)" class="btn-secondary btn-sm">Upload Foto</button>
            <button @click="deleteItem('barbers', b.rawId)" class="btn-delete btn-sm">Hapus</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. TAB JADWAL BARBER (TAMPILAN PER KOTAK / GRID) -->
    <div v-if="currentSubTab === 'jadwal'" class="card-container-section">
      <div class="card-header-flex">
        <h3>Jadwal Kerja & Operasional Barber</h3>
      </div>
      
      <div class="grid-cards">
        <div v-for="b in barbers" :key="'j-'+b.rawId" class="barber-card-box">
          <div class="avatar-wrapper">
            <img :src="b.avatar ? `${API_BASE_URL.replace('/api', '')}${b.avatar}` : 'https://via.placeholder.com/100'" 
                 alt="Avatar" class="barber-avatar-grid" />
          </div>
          <div class="barber-info">
            <h4 class="barber-name">{{ b.name }}</h4>
            <p class="schedule-days"> {{ b.schedule?.days || 'Senin - Sabtu' }}</p>
            <p class="schedule-hours"> {{ b.schedule?.hours || '09:00 - 21:00 WIB' }}</p>
            <div class="barber-status-badge">
              <span :class="['badge-status', b.schedule?.status === 'Libur' ? 'badge-libur' : '']">
                {{ b.schedule?.status || 'Masuk' }}
              </span>
            </div>
          </div>
          <div class="card-actions">
            <button @click="openAvatarModal(b)" class="btn-secondary btn-sm">Upload Foto</button>
            <button @click="openScheduleModal(b)" class="btn-primary btn-sm">Atur Jadwal</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. TAB PELANGGAN -->
    <div v-if="currentSubTab === 'pelanggan'" class="card">
      <div class="card-header">
        <h3>Daftar Data Pelanggan Terdaftar</h3>
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
            <td colspan="4" class="empty-text">Belum ada akun pelanggan terdaftar.</td>
          </tr>
          <tr v-for="c in customers" :key="c.id">
            <td>#{{ c.id }}</td>
            <td><strong>{{ c.name }}</strong></td>
            <td>{{ c.email }} {{ c.phone !== '-' ? ` / ${c.phone}` : '' }}</td>
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
            <input type="text" v-model="newBarber.name" placeholder="Contoh: idsur" required />
          </div>

          <div class="form-group">
            <label>Spesialisasi (Bisa centang lebih dari satu):</label>
            <div class="services-checkbox-list">
              <label class="checkbox-item">
                <input 
                  type="checkbox" 
                  :checked="isAllServicesSelected" 
                  @change="toggleSelectAllServices" 
                />
                <strong>Pilih Semua Layanan</strong>
              </label>
              <hr class="divider" />
              <div v-if="services.length === 0" class="empty-services">
                Belum ada data layanan. Tambahkan di tab Layanan dulu.
              </div>
              <label v-for="s in services" :key="s.rawId" class="checkbox-item">
                <input 
                  type="checkbox" 
                  :value="s.name" 
                  v-model="selectedSpecialties" 
                />
                <span>{{ s.name }}</span>
              </label>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showBarberModal = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL UPLOAD FOTO / AVATAR BARBER -->
    <div v-if="showAvatarModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Upload Foto: {{ selectedBarberForAvatar?.name }}</h3>
        <form @submit.prevent="uploadAvatar">
          <div class="form-group">
            <label>Pilih File Foto (.jpg / .png)</label>
            <input type="file" @change="handleFileChange" accept="image/png, image/jpeg, image/jpg" class="form-input" required />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAvatarModal = false" class="btn-secondary">Batal</button>
            <button type="submit" :disabled="isUploadingAvatar" class="btn-primary">
              {{ isUploadingAvatar ? 'Mengunggah...' : 'Upload Foto' }}
            </button>
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
            <select v-model="scheduleForm.days" class="form-select" required>
              <option value="Senin - Sabtu">Senin - Sabtu</option>
              <option value="Senin - Jumat">Senin - Jumat</option>
              <option value="Setiap Hari (Senin - Minggu)">Setiap Hari (Senin - Minggu)</option>
              <option value="Sabtu & Minggu (Weekend Only)">Sabtu & Minggu (Weekend Only)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Jam Operasional (WIB)</label>
            <div class="time-range-picker">
              <div>
                <span class="time-label">Jam Buka:</span>
                <select v-model="scheduleForm.startHour" class="form-select time-select" required>
                  <option v-for="hour in hourOptions" :key="'start-'+hour" :value="hour">
                    {{ hour }} WIB
                  </option>
                </select>
              </div>
              <span class="time-separator">s/d</span>
              <div>
                <span class="time-label">Jam Tutup:</span>
                <select v-model="scheduleForm.endHour" class="form-select time-select" required>
                  <option v-for="hour in hourOptions" :key="'end-'+hour" :value="hour">
                    {{ hour }} WIB
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Status Kehadiran</label>
            <select v-model="scheduleForm.status" class="form-select" required>
              <option value="Masuk">Masuk</option>
              <option value="Libur">Libur</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showScheduleModal = false" class="btn-secondary">Batal</button>
            <button type="submit" :disabled="isSavingSchedule" class="btn-primary">
              {{ isSavingSchedule ? 'Menyimpan...' : 'Simpan Jadwal' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentSubTab = ref('layanan')

const updateTabFromRoute = () => {
  if (route.path.includes('master-barber')) currentSubTab.value = 'barber'
  else if (route.path.includes('master-services')) currentSubTab.value = 'layanan'
  else if (route.path.includes('master-schedule')) currentSubTab.value = 'jadwal'
  else if (route.path.includes('master-customers')) currentSubTab.value = 'pelanggan'
}

watch(() => route.path, updateTabFromRoute, { immediate: true })

const services = ref([])
const barbers = ref([])
const customers = ref([])

const hourOptions = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00'
]

// State Modal Layanan
const showServiceModal = ref(false)
const newService = ref({ name: '', price: 0, duration: 30 })

// State Modal Barber
const showBarberModal = ref(false)
const newBarber = ref({ name: '', specialty: '' })
const selectedSpecialties = ref([])

// State Modal Upload Avatar
const showAvatarModal = ref(false)
const selectedBarberForAvatar = ref(null)
const avatarFile = ref(null)
const isUploadingAvatar = ref(false)

const openAvatarModal = (barber) => {
  selectedBarberForAvatar.value = barber
  avatarFile.value = null
  showAvatarModal.value = true
}

const handleFileChange = (e) => {
  avatarFile.value = e.target.files[0]
}

const uploadAvatar = async () => {
  if (!avatarFile.value || !selectedBarberForAvatar.value) return

  isUploadingAvatar.value = true
  const formData = new FormData()
  formData.append('avatar', avatarFile.value)

  try {
    const res = await fetch(`${API_BASE_URL}/barbers/${selectedBarberForAvatar.value.rawId}/avatar`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })

    if (res.ok) {
      alert('Foto profil barber berhasil diunggah!')
      showAvatarModal.value = false
      fetchAllData()
    } else {
      const errData = await res.json()
      alert(errData.error || 'Gagal mengunggah foto.')
    }
  } catch (err) {
    console.error('Error uploading avatar:', err)
    alert('Terjadi kesalahan jaringan.')
  } finally {
    isUploadingAvatar.value = false
  }
}

const isAllServicesSelected = computed(() => {
  return services.value.length > 0 && selectedSpecialties.value.length === services.value.length
})

const toggleSelectAllServices = (e) => {
  if (e.target.checked) {
    selectedSpecialties.value = services.value.map(s => s.name)
  } else {
    selectedSpecialties.value = []
  }
}

// State Modal Jadwal
const showScheduleModal = ref(false)
const activeBarber = ref(null)
const isSavingSchedule = ref(false)
const scheduleForm = ref({ 
  days: 'Senin - Sabtu', 
  startHour: '08:00', 
  endHour: '22:00', 
  status: 'Masuk' 
})

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
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

    // 2. Fetch Barber langsung dari Database Server Backend
    const resB = await fetch(`${API_BASE_URL}/barbers`, { headers: { 'Authorization': `Bearer ${token}` } })
    const dataB = await resB.json()
    if (resB.ok) {
      const rawBarbers = dataB.data || dataB
      
      barbers.value = rawBarbers.map(i => {
        const barberId = i.ID || i.id
        const isActive = i.IsActive ?? i.is_active ?? i.IS_ACTIVE ?? true
        const workDays = i.WorkDays ?? i.work_days ?? 'Senin - Sabtu'
        let opHours = i.OperationalHours ?? i.operational_hours ?? '08:00 - 22:00 WIB'
        const avatarPath = i.Avatar || i.avatar || ''
        
        // Proteksi otomatis agar jam tidak terbalik
        if (opHours.includes('-')) {
          const parts = opHours.replace('WIB', '').trim().split('-')
          if (parts.length === 2) {
            const p1 = parts[0].trim()
            const p2 = parts[1].trim()
            if (p1 > p2) {
              opHours = `${p2} - ${p1} WIB`
            }
          }
        }
        
        return { 
          rawId: barberId, 
          name: i.Name || i.name, 
          specialty: i.Specialty || i.specialty,
          avatar: avatarPath,
          schedule: { 
            days: workDays, 
            hours: opHours, 
            status: isActive ? 'Masuk' : 'Libur' 
          }
        }
      })
    }

    // 3. Fetch Pelanggan Terdaftar
    const resCust = await fetch(`${API_BASE_URL}/admin/customers`, { 
      headers: { 'Authorization': `Bearer ${token}` } 
    })
    if (resCust.ok) {
      const dataCust = await resCust.json()
      const list = dataCust.data || dataCust
      customers.value = list.map(u => ({
        id: u.ID || u.id,
        name: u.Name || u.name,
        email: u.Email || u.email,
        phone: u.Phone || u.phone || '-',
        role: u.Role || u.role || 'Customer'
      }))
    }
  } catch (err) {
    console.error('Gagal mengambil data:', err)
  }
}

const openBarberModal = () => {
  newBarber.value = { name: '', specialty: '' }
  selectedSpecialties.value = services.value.map(s => s.name)
  showBarberModal.value = true
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
    if (selectedSpecialties.value.length === 0) {
      alert('Pilih minimal 1 spesialisasi untuk barber!')
      return
    }

    let formattedSpecialty = ''
    if (selectedSpecialties.value.length === services.value.length && services.value.length > 0) {
      formattedSpecialty = 'Semua Layanan'
    } else {
      formattedSpecialty = selectedSpecialties.value.join(', ')
    }

    const res = await fetch(`${API_BASE_URL}/barbers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: newBarber.value.name, specialty: formattedSpecialty })
    })

    if (res.ok) {
      showBarberModal.value = false
      newBarber.value = { name: '', specialty: '' }
      selectedSpecialties.value = []
      fetchAllData()
    } else { alert('Gagal menambah barber') }
  } catch (err) { console.error(err) }
}

const openScheduleModal = (barber) => {
  activeBarber.value = barber
  const existingSchedule = barber.schedule || {}

  let start = '08:00'
  let end = '22:00'
  
  if (existingSchedule.hours && existingSchedule.hours.includes('-')) {
    const parts = existingSchedule.hours.replace('WIB', '').trim().split('-')
    if (parts.length === 2) {
      const parsedStart = parts[0].trim()
      const parsedEnd = parts[1].trim()
      
      if (parsedStart > parsedEnd) {
        start = parsedEnd
        end = parsedStart
      } else {
        start = parsedStart
        end = parsedEnd
      }
    }
  }

  scheduleForm.value = {
    days: existingSchedule.days || 'Senin - Sabtu',
    startHour: start,
    endHour: end,
    status: existingSchedule.status || 'Masuk'
  }
  showScheduleModal.value = true
}

const saveSchedule = async () => {
  if (!activeBarber.value) return

  let start = scheduleForm.value.startHour
  let end = scheduleForm.value.endHour
  
  if (start > end) {
    const temp = start
    start = end
    end = temp
  }

  isSavingSchedule.value = true
  const isOff = scheduleForm.value.status === 'Libur'
  const formattedHours = `${start} - ${end} WIB`

  try {
    const res = await fetch(`${API_BASE_URL}/barbers/${activeBarber.value.rawId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ 
        is_active: !isOff,
        work_days: scheduleForm.value.days,
        operational_hours: formattedHours
      })
    })

    if (res.ok) {
      activeBarber.value.schedule = {
        days: scheduleForm.value.days,
        hours: formattedHours,
        status: scheduleForm.value.status
      }

      showScheduleModal.value = false
      fetchAllData()
    } else {
      alert('Gagal memperbarui jadwal ke database server.')
    }
  } catch (err) {
    console.error('Gagal menyimpan jadwal ke backend:', err)
    alert('Terjadi kesalahan jaringan saat menyimpan.')
  } finally {
    isSavingSchedule.value = false
  }
}

const deleteItem = async (endpoint, id) => {
  if (!confirm('Yakin ingin menghapus data ini?')) return
  await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
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

/* Grid Layout Styling (Per Kotak) */
.card-container-section { background: #fff; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; }
.card-header-flex h3 { margin: 0; font-size: 1.1rem; color: #0f172a; }

.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.2rem;
}

.barber-card-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.barber-card-box:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.08);
}

.card-badge {
  position: absolute;
  top: 10px;
  left: 12px;
  background: #e2e8f0;
  color: #475569;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.avatar-wrapper {
  margin-bottom: 0.8rem;
  margin-top: 0.5rem;
}

.barber-avatar-grid {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ffffff;
  box-shadow: 0 4px 8px rgba(0,0,0,0.12);
}

.barber-info {
  width: 100%;
  margin-bottom: 1rem;
}

.barber-name {
  margin: 0 0 0.3rem 0;
  font-size: 1rem;
  color: #0f172a;
  font-weight: bold;
}

.barber-specialty {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0 0 0.5rem 0;
}

.schedule-days {
  font-size: 0.8rem;
  color: #334155;
  font-weight: 600;
  margin: 0 0 0.2rem 0;
}

.schedule-hours {
  font-size: 0.8rem;
  color: #2563eb;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
}

.barber-status-badge {
  display: flex;
  justify-content: center;
  margin-top: 0.4rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  justify-content: center;
  border-top: 1px solid #e2e8f0;
  padding-top: 0.8rem;
  margin-top: auto;
}

.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left; }
.data-table th, .data-table td { padding: 0.75rem 0.5rem; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
.data-table th { background-color: #f8fafc; font-weight: 600; }

.badge-status { background-color: #dcfce7; color: #15803d; padding: 0.2rem 0.6rem; font-size: 0.75rem; font-weight: bold; border-radius: 4px; }
.badge-libur { background-color: #fee2e2; color: #b91c1c; }
.badge-role { background-color: #e0f2fe; color: #0369a1; padding: 0.2rem 0.5rem; font-size: 0.75rem; font-weight: bold; border-radius: 4px; }
.btn-primary { background-color: #2563eb; color: #fff; border: none; padding: 0.4rem 0.8rem; font-size: 0.8rem; font-weight: 600; border-radius: 6px; cursor: pointer; }
.btn-secondary { background-color: #64748b; color: #fff; border: none; padding: 0.4rem 0.8rem; font-size: 0.8rem; font-weight: 600; border-radius: 6px; cursor: pointer; }
.btn-delete { background-color: #ef4444; color: #fff; border: none; padding: 0.3rem 0.6rem; font-size: 0.75rem; font-weight: 600; border-radius: 6px; cursor: pointer; }
.btn-sm { padding: 0.3rem 0.6rem; font-size: 0.75rem; flex: 1; }
.empty-text { text-align: center; color: #64748b; padding: 1.5rem !important; }

/* Modal Styling & Checkbox List */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: #fff; padding: 1.5rem; border-radius: 10px; width: 100%; max-width: 420px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.modal-content h3 { margin-top: 0; margin-bottom: 1rem; color: #0f172a; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 0.3rem; }
.form-group input, .form-select, .form-input { width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; background: #fff; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem; }

.services-checkbox-list {
  max-height: 160px;
  overflow-y: auto;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.6rem;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #334155;
  cursor: pointer;
}

.checkbox-item input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.divider {
  border: 0;
  border-top: 1px solid #e2e8f0;
  margin: 0.2rem 0;
}

.empty-services {
  font-size: 0.8rem;
  color: #94a3b8;
  font-style: italic;
}

/* Time Picker Component Styling */
.time-range-picker {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: #f8fafc;
  padding: 0.6rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.time-range-picker div {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
}

.time-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}

.time-select {
  padding: 0.4rem;
  font-size: 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}

.time-separator {
  font-size: 0.8rem;
  font-weight: bold;
  color: #64748b;
  margin-top: 0.8rem;
}
</style>