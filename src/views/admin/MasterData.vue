<template>
  <div class="master-page">
    <div class="header-section">
      <div>
        <h2>Manajemen Data Master</h2>
        <p class="text-muted">Kelola profil barber, jadwal, dan data pelanggan Barberly.</p>
      </div>
      <!-- Tab Navigasi Internal -->
      <div class="sub-tabs">
        <button :class="{ active: currentSubTab === 'barber' }" @click="currentSubTab = 'barber'">Barber & Jadwal</button>
        <button :class="{ active: currentSubTab === 'pelanggan' }" @click="currentSubTab = 'pelanggan'">Pelanggan</button>
      </div>
    </div>

    <!-- 1. TAB BARBER & JADWAL TERGABUNG -->
    <div v-if="currentSubTab === 'barber'" class="card-container-section">
      <div class="card-header-flex">
        <h3>Daftar Tukang Cukur & Jadwal Operasional</h3>
        <button @click="openBarberModal" class="btn-primary-action">+ Tambah Barber</button>
      </div>
      
      <div class="grid-cards">
        <div v-for="b in barbers" :key="b.rawId" class="barber-card-box">
          <!-- Avatar diklik langsung untuk memicu upload foto -->
          <div class="avatar-wrapper" @click="openAvatarModal(b)" title="Klik untuk ubah foto">
            <img v-if="b.avatar" :src="`${API_BASE_URL.replace('/api', '')}${b.avatar}`" alt="Avatar" class="barber-avatar-grid" />
            <div v-else class="avatar-placeholder">
              <span class="camera-icon">📷</span>
              <span class="no-photo-text">Ubah Foto</span>
            </div>
          </div>

          <div class="barber-info">
            <h4 class="barber-name">{{ b.name }}</h4>
            <!-- Deskripsi dibatasi maksimal 2 baris agar kartu tidak kepanjangan -->
            <p class="barber-desc">{{ b.description || 'Belum ada deskripsi profil.' }}</p>
            <div class="barber-rating">
              Rating: {{ b.rating ? b.rating.toFixed(1) : '0.0' }} / 5.0
            </div>

            <!-- Informasi Jadwal yang Digabungkan -->
            <div class="schedule-box">
              <p class="schedule-days">Hari: {{ b.schedule?.days || 'Senin - Sabtu' }}</p>
              <p class="schedule-hours">Jam: {{ b.schedule?.hours || '08:00 - 22:00 WIB' }}</p>
              <div class="barber-status-badge">
                <span :class="['badge-status', b.schedule?.status === 'Libur' ? 'badge-libur' : '']">
                  Status: {{ b.schedule?.status || 'Masuk' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Tombol Aksi Card -->
          <div class="card-actions">
            <button @click="openEditBarberModal(b)" class="btn-action btn-warning">Edit</button>
            <button @click="openScheduleModal(b)" class="btn-action btn-primary">Jadwal</button>
            <button @click="deleteItem('barbers', b.rawId)" class="btn-action btn-delete">Hapus</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. TAB PELANGGAN -->
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

    <!-- MODAL TAMBAH BARBER -->
    <div v-if="showBarberModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Tambah Barber Baru</h3>
        <form @submit.prevent="submitBarber">
          <div class="form-group">
            <label>Nama Barber</label>
            <input type="text" v-model="newBarber.name" placeholder="Contoh: Budi Santoso" required />
          </div>

          <div class="form-group">
            <label>Deskripsi / Profil Singkat</label>
            <textarea v-model="newBarber.description" rows="3" placeholder="Ceritakan pengalaman atau keahlian khusus..." class="form-input" required></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeAllModals" class="btn-modal-sec">Batal</button>
            <button type="submit" class="btn-modal-pri">Simpan</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL EDIT BARBER -->
    <div v-if="showEditBarberModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Edit Data Barber: {{ editBarberForm.name }}</h3>
        <form @submit.prevent="submitEditBarber">
          <div class="form-group">
            <label>Nama Barber</label>
            <input type="text" v-model="editBarberForm.name" placeholder="Contoh: Budi Santoso" required />
          </div>

          <div class="form-group">
            <label>Deskripsi / Profil Singkat</label>
            <textarea v-model="editBarberForm.description" rows="3" placeholder="Ceritakan pengalaman atau keahlian khusus..." class="form-input" required></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeAllModals" class="btn-modal-sec">Batal</button>
            <button type="submit" :disabled="isEditingBarber" class="btn-modal-pri">
              {{ isEditingBarber ? 'Menyimpan...' : 'Perbarui Barber' }}
            </button>
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
            <button type="button" @click="closeAllModals" class="btn-modal-sec">Batal</button>
            <button type="submit" :disabled="isUploadingAvatar" class="btn-modal-pri">
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
                  <option v-for="hour in hourOptions" :key="'start-'+hour" :value="hour">{{ hour }} WIB</option>
                </select>
              </div>
              <span class="time-separator">s/d</span>
              <div>
                <span class="time-label">Jam Tutup:</span>
                <select v-model="scheduleForm.endHour" class="form-select time-select" required>
                  <option v-for="hour in hourOptions" :key="'end-'+hour" :value="hour">{{ hour }} WIB</option>
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
            <button type="button" @click="closeAllModals" class="btn-modal-sec">Batal</button>
            <button type="submit" :disabled="isSavingSchedule" class="btn-modal-pri">
              {{ isSavingSchedule ? 'Menyimpan...' : 'Simpan Jadwal' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Komponen Toast Terpusat -->
    <Toast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Toast from '@/components/Toast.vue'

const route = useRoute()
const currentSubTab = ref('barber')
const toastRef = ref(null)

const updateTabFromRoute = () => {
  if (route.path.includes('master-customers')) currentSubTab.value = 'pelanggan'
  else currentSubTab.value = 'barber'
}

watch(() => route.path, updateTabFromRoute, { immediate: true })

const barbers = ref([])
const customers = ref([])

const hourOptions = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00'
]

// State Modal Tambah Barber
const showBarberModal = ref(false)
const newBarber = ref({ name: '', description: '' })

// State Modal Edit Barber
const showEditBarberModal = ref(false)
const isEditingBarber = ref(false)
const editBarberForm = ref({ rawId: null, name: '', description: '' })

// Fungsi universal penutup modal sekaligus membuka kunci scroll halaman
const closeAllModals = () => {
  showBarberModal.value = false
  showEditBarberModal.value = false
  showAvatarModal.value = false
  showScheduleModal.value = false
  document.body.style.overflow = 'auto'
}

const openEditBarberModal = (barber) => {
  editBarberForm.value = {
    rawId: barber.rawId,
    name: barber.name,
    description: barber.description
  }
  document.body.style.overflow = 'hidden'
  showEditBarberModal.value = true
}

const submitEditBarber = async () => {
  isEditingBarber.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/barbers/${editBarberForm.value.rawId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        name: editBarberForm.value.name,
        description: editBarberForm.value.description
      })
    })

    if (res.ok) {
      // Update langsung secara lokal agar UI berubah seketika
      const index = barbers.value.findIndex(b => b.rawId === editBarberForm.value.rawId)
      if (index !== -1) {
        barbers.value[index].name = editBarberForm.value.name
        barbers.value[index].description = editBarberForm.value.description
      }

      closeAllModals()
      toastRef.value?.triggerToast('Data barber berhasil diperbarui!', 'success')
      fetchAllData()
    } else {
      const errData = await res.json()
      toastRef.value?.triggerToast(errData.error || 'Gagal memperbarui data barber.', 'error')
    }
  } catch (err) {
    console.error('Error updating barber:', err)
    toastRef.value?.triggerToast('Terjadi kesalahan jaringan.', 'error')
  } finally {
    isEditingBarber.value = false
  }
}

// State Modal Upload Avatar
const showAvatarModal = ref(false)
const selectedBarberForAvatar = ref(null)
const avatarFile = ref(null)
const isUploadingAvatar = ref(false)

const openAvatarModal = (barber) => {
  selectedBarberForAvatar.value = barber
  avatarFile.value = null
  document.body.style.overflow = 'hidden'
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
      closeAllModals()
      toastRef.value?.triggerToast('Foto profil barber berhasil diunggah!', 'success')
      fetchAllData()
    } else {
      const errData = await res.json()
      toastRef.value?.triggerToast(errData.error || 'Gagal mengunggah foto.', 'error')
    }
  } catch (err) {
    console.error('Error uploading avatar:', err)
    toastRef.value?.triggerToast('Terjadi kesalahan jaringan.', 'error')
  } finally {
    isUploadingAvatar.value = false
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
    const resB = await fetch(`${API_BASE_URL}/barbers`, { headers: { 'Authorization': `Bearer ${token}` } })
    const dataB = await resB.json()
    if (resB.ok) {
      const rawBarbers = dataB.data || dataB
      
      barbers.value = rawBarbers.map(i => {
        const barberId = i.ID || i.id
        const isActive = i.IsActive ?? i.is_active ?? true
        const workDays = i.WorkDays ?? i.work_days ?? 'Senin - Sabtu'
        let opHours = i.OperationalHours ?? i.operational_hours ?? '08:00 - 22:00 WIB'
        const avatarPath = i.Avatar || i.avatar || ''
        const description = i.Description || i.description || ''
        const rating = i.Rating || i.rating || 0.0
        
        return { 
          rawId: barberId, 
          name: i.Name || i.name, 
          description: description,
          rating: rating,
          avatar: avatarPath,
          schedule: { 
            days: workDays, 
            hours: opHours, 
            status: isActive ? 'Masuk' : 'Libur' 
          }
        }
      })
    }

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
  newBarber.value = { name: '', description: '' }
  document.body.style.overflow = 'hidden'
  showBarberModal.value = true
}

const submitBarber = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/barbers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ 
        name: newBarber.value.name, 
        description: newBarber.value.description
      })
    })

    if (res.ok) {
      closeAllModals()
      newBarber.value = { name: '', description: '' }
      toastRef.value?.triggerToast('Barber berhasil ditambahkan.', 'success')
      fetchAllData()
    } else { 
      toastRef.value?.triggerToast('Gagal menambah barber.', 'error') 
    }
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
      start = parts[0].trim()
      end = parts[1].trim()
    }
  }

  scheduleForm.value = {
    days: existingSchedule.days || 'Senin - Sabtu',
    startHour: start,
    endHour: end,
    status: existingSchedule.status || 'Masuk'
  }
  document.body.style.overflow = 'hidden'
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

      closeAllModals()
      toastRef.value?.triggerToast('Jadwal berhasil diperbarui.', 'success')
      fetchAllData()
    } else {
      toastRef.value?.triggerToast('Gagal memperbarui jadwal ke database server.', 'error')
    }
  } catch (err) {
    console.error('Gagal menyimpan jadwal ke backend:', err)
    toastRef.value?.triggerToast('Terjadi kesalahan jaringan saat menyimpan.', 'error')
  } finally {
    isSavingSchedule.value = false
  }
}

const deleteItem = async (endpoint, id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.ok) {
      toastRef.value?.triggerToast('Data berhasil dihapus.', 'success')
      fetchAllData()
    } else {
      toastRef.value?.triggerToast('Gagal menghapus data.', 'error')
    }
  } catch (err) {
    toastRef.value?.triggerToast('Terjadi kesalahan jaringan.', 'error')
  }
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

.card-container-section { background: #fff; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; }
.card-header-flex h3 { margin: 0; font-size: 1.1rem; color: #0f172a; }

.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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

.avatar-wrapper {
  margin-bottom: 0.8rem;
  margin-top: 0.5rem;
  cursor: pointer;
  position: relative;
}

.avatar-wrapper:hover .barber-avatar-grid,
.avatar-wrapper:hover .avatar-placeholder {
  opacity: 0.85;
  border-color: #2563eb;
}

.barber-avatar-grid {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ffffff;
  box-shadow: 0 4px 8px rgba(0,0,0,0.12);
  transition: all 0.2s ease;
}

.avatar-placeholder {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: #e2e8f0;
  border: 3px solid #ffffff;
  box-shadow: 0 4px 8px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  transition: all 0.2s ease;
}

.camera-icon {
  font-size: 1.4rem;
  line-height: 1;
}

.no-photo-text {
  font-size: 0.55rem;
  color: #64748b;
  font-weight: 600;
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

.barber-desc {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.barber-rating {
  font-size: 0.82rem;
  font-weight: bold;
  color: #d97706;
  margin-bottom: 0.6rem;
}

.schedule-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.6rem;
  margin-top: 0.5rem;
  font-size: 0.78rem;
}

.schedule-days {
  color: #334155;
  font-weight: 600;
  margin: 0 0 0.2rem 0;
}

.schedule-hours {
  color: #2563eb;
  font-weight: bold;
  margin: 0 0 0.4rem 0;
}

.barber-status-badge {
  display: flex;
  justify-content: center;
  margin-top: 0.3rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  justify-content: space-between;
  border-top: 1px solid #e2e8f0;
  padding-top: 0.8rem;
  margin-top: auto;
}

.btn-action {
  flex: 1;
  padding: 0.45rem 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  text-align: center;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn-action:hover {
  opacity: 0.85;
}

.btn-warning { 
  background-color: #f1f5f9; 
  color: #334155; 
  border-color: #cbd5e1; 
} 
.btn-warning:hover { 
  background-color: #e2e8f0; 
  color: #0f172a; 
}

.btn-primary { 
  background-color: #eff6ff; 
  color: #2563eb; 
  border-color: #bfdbfe; 
} 
.btn-primary:hover { 
  background-color: #dbeafe; 
}

.btn-delete { 
  background-color: #fef2f2; 
  color: #dc2626; 
  border-color: #fecaca; 
} 
.btn-delete:hover { 
  background-color: #fee2e2; 
}

.btn-primary-action { background-color: #2563eb; color: #fff; border: none; padding: 0.4rem 0.7rem; font-size: 0.78rem; font-weight: 600; border-radius: 6px; cursor: pointer; }

.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left; }
.data-table th, .data-table td { padding: 0.75rem 0.5rem; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
.data-table th { background-color: #f8fafc; font-weight: 600; }

.badge-status { background-color: #dcfce7; color: #15803d; padding: 0.2rem 0.6rem; font-size: 0.72rem; font-weight: bold; border-radius: 4px; }
.badge-libur { background-color: #fee2e2; color: #b91c1c; }
.badge-role { background-color: #e0f2fe; color: #0369a1; padding: 0.2rem 0.5rem; font-size: 0.75rem; font-weight: bold; border-radius: 4px; }
.empty-text { text-align: center; color: #64748b; padding: 1.5rem !important; }

/* Modal Styling */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: #fff; padding: 1.5rem; border-radius: 10px; width: 100%; max-width: 420px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 90vh; overflow-y: auto; }
.modal-content h3 { margin-top: 0; margin-bottom: 1rem; color: #0f172a; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 0.3rem; }
.form-group input, .form-select, .form-input, textarea.form-input { width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; background: #fff; font-family: inherit; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem; }

.btn-modal-pri { background-color: #2563eb; color: #fff; border: none; padding: 0.4rem 0.8rem; font-size: 0.8rem; font-weight: 600; border-radius: 6px; cursor: pointer; }
.btn-modal-sec { background-color: #64748b; color: #fff; border: none; padding: 0.4rem 0.8rem; font-size: 0.8rem; font-weight: 600; border-radius: 6px; cursor: pointer; }

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
  font-size: 0.80rem;
  font-weight: bold;
  color: #64748b;
  margin-top: 0.8rem;
}
</style>