<template>
  <div class="container">
    <div class="header-section">
      <h1>Pilih Barber Pilihanmu</h1>
      <p class="subjudul">Pilih tukang cukur profesional kami dan tentukan jadwal cukur favoritmu</p>
    </div>

    <!-- State Loading & Error -->
    <div v-if="isLoading" class="state-box">Memuat daftar barber...</div>
    <div v-else-if="errorMessage" class="state-box error">{{ errorMessage }}</div>

    <!-- Grid Katalog Barber (Barber-Centric dengan Status Libur) -->
    <div v-else class="barbers-grid">
      <div v-for="b in barbers" :key="b.id" :class="['barber-card-box', { 'is-off': b.is_off }]">
        <div class="avatar-wrapper">
          <img :src="b.avatar ? `${API_BASE_URL.replace('/api', '')}${b.avatar}` : 'https://via.placeholder.com/80'" 
               alt="Avatar" class="barber-avatar-grid" />
        </div>
        <div class="barber-info">
          <h3 class="barber-name">{{ b.name }}</h3>
          <p class="barber-desc">{{ b.description || 'Belum ada deskripsi profil.' }}</p>
          <div class="barber-rating">
            Rating: {{ (b.average_rating || 0).toFixed(1) }} / 5.0 ({{ b.total_reviews || 0 }} ulasan)
          </div>
          <div class="schedule-info">
            <span class="schedule-text">Hari: {{ b.work_days || 'Senin - Sabtu' }}</span>
            <span class="schedule-text">Jam: {{ b.operational_hours || '08:00 - 22:00 WIB' }}</span>
            <!-- Indikator Status sinkron dengan Admin -->
            <div :class="['status-badge', b.is_off ? 'status-libur' : 'status-masuk']">
              Status: {{ b.is_off ? 'Libur' : 'Masuk' }}
            </div>
          </div>
        </div>
        <div class="card-footer">
          <!-- Tombol Booking HANYA aktif jika BUKAN admin dan Barber TIDAK libur -->
          <template v-if="userRole !== 'admin'">
            <button v-if="!b.is_off" class="btn-book" @click="openBookingModal(b)">
              Booking Sekarang
            </button>
            <button v-else class="btn-book disabled" disabled>
              Barber Sedang Libur
            </button>
          </template>
          <!-- Label khusus untuk Admin -->
          <div v-else class="admin-notice">
            <span>Mode Lihat Admin</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form Booking Barber-Centric -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header-title">
          <h3>Konfirmasi Booking</h3>
          <button class="close-x" @click="showModal = false">×</button>
        </div>

        <!-- Barber Profile Preview Card -->
        <div v-if="selectedBarber" class="modal-barber-profile">
          <img :src="selectedBarber.avatar ? `${API_BASE_URL.replace('/api', '')}${selectedBarber.avatar}` : 'https://via.placeholder.com/45'" 
               alt="Barber Avatar" class="modal-barber-avatar" />
          <div class="modal-barber-meta">
            <h4>{{ selectedBarber.name }}</h4>
            <div class="modal-barber-stats">
              Rating: {{ (selectedBarber.average_rating || 0).toFixed(1) }} / 5.0 | Jam: {{ selectedBarber.operational_hours || '08:00 - 22:00 WIB' }}
            </div>
            <p :class="['modal-barber-desc', { expanded: isDescExpanded }]">
              {{ selectedBarber.description || 'Barber profesional siap memberikan hasil potongan terbaik.' }}
            </p>
            <button 
              v-if="selectedBarber.description && selectedBarber.description.length > 70" 
              type="button" 
              class="toggle-desc-btn" 
              @click="isDescExpanded = !isDescExpanded"
            >
              {{ isDescExpanded ? 'Tutup' : 'Selengkapnya...' }}
            </button>
          </div>
        </div>
        
        <form @submit.prevent="submitBooking">
          <!-- Pilihan Hari Cukur -->
          <div class="form-group">
            <label>Pilih Hari & Tanggal Cukur</label>
            <div class="date-quick-buttons">
              <button 
                type="button" 
                v-for="d in quickDates" 
                :key="d.value"
                :class="['date-btn', { active: bookingForm.booking_date === d.value }]"
                @click="selectDate(d.value)"
              >
                {{ d.label }}
              </button>
            </div>
          </div>

          <!-- Pilihan Jam Cukur (Durasi per 1 Jam / Realistis untuk Barber) -->
          <div class="form-group">
            <label>Pilih Jam Cukur (Durasi 1 Jam)</label>
            <div class="time-grid-container">
              <button 
                type="button"
                v-for="slot in timeSlotsWithStatus"
                :key="slot.time"
                :class="['time-btn', { active: bookingForm.booking_time === slot.time }]"
                :disabled="slot.isBooked || slot.isPassed"
                @click="bookingForm.booking_time = slot.time"
              >
                <span class="time-text">{{ slot.time }}</span>
                <span v-if="slot.isBooked" class="slot-status">Dibooking</span>
                <span v-else-if="slot.isPassed" class="slot-status">Lewat</span>
              </button>
            </div>
          </div>

          <!-- Metode Pembayaran -->
          <div class="form-group">
            <label>Metode Pembayaran</label>
            <div class="payment-box">
              Bayar langsung di kasir saat datang
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showModal = false" class="btn-secondary">Batal</button>
            <button 
              type="submit" 
              :disabled="isSubmitting" 
              class="btn-primary"
            >
              {{ isSubmitting ? 'Memproses...' : 'Konfirmasi Booking' }}
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
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import Toast from '@/components/Toast.vue'

const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const toastRef = ref(null)
const userRole = ref('')
const barbers = ref([])
const bookedTimes = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const showModal = ref(false)
const selectedBarber = ref(null)
const isSubmitting = ref(false)
const isDescExpanded = ref(false)

// Slot waktu diubah menjadi per 1 Jam penuh agar realistis untuk berbagai model rambut
const allTimeSlots = [
  '09:00', '10:00', '11:00', 
  '13:00', '14:00', '15:00', 
  '16:00', '17:00', '18:00', 
  '19:00', '20:00', '21:00'
]

const quickDates = computed(() => {
  const result = []
  const daysName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const monthsName = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  
  for (let i = 0; i < 2; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    const dayName = daysName[d.getDay()]
    const monthName = monthsName[d.getMonth()]
    
    let label = i === 0 ? `Hari Ini (${day} ${monthName})` : `${dayName}, ${day} ${monthName}`
    result.push({ label, value: dateStr })
  }
  return result
})

const bookingForm = ref({
  booking_date: '',
  booking_time: ''
})

const fetchBookedSlots = async () => {
  if (!selectedBarber.value || !bookingForm.value.booking_date) {
    bookedTimes.value = []
    return
  }

  const token = localStorage.getItem('token')
  try {
    const response = await fetch(`${API_BASE_URL}/bookings?barber_id=${selectedBarber.value.id}&date=${bookingForm.value.booking_date}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    if (response.ok) {
      const rawBookings = data.data || data
      bookedTimes.value = rawBookings
        .filter(b => b.status !== 'cancelled')
        .map(b => {
          const bookingDateObj = new Date(b.booking_time || b.BookingTime)
          return bookingDateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':')
        })
    }
  } catch (err) {
    console.error('Gagal memuat jadwal booking terisi', err)
  }
}

watch(() => bookingForm.value.booking_date, () => {
  fetchBookedSlots()
})

const selectDate = (dateVal) => {
  bookingForm.value.booking_date = dateVal
  bookingForm.value.booking_time = ''
}

const timeSlotsWithStatus = computed(() => {
  const todayStr = new Date().toLocaleDateString('en-CA')
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  return allTimeSlots.map(time => {
    const [h, m] = time.split(':').map(Number)
    
    let isPassed = false
    if (bookingForm.value.booking_date === todayStr) {
      if (h < currentHour || (h === currentHour && m <= currentMinute)) {
        isPassed = true
      }
    }

    const isBooked = bookedTimes.value.includes(time)

    return {
      time,
      isPassed,
      isBooked
    }
  })
})

const fetchData = async () => {
  isLoading.value = true
  errorMessage.value = ''
  const token = localStorage.getItem('token')

  try {
    const resB = await fetch(`${API_BASE_URL}/barbers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const dataB = await resB.json()
    if (resB.ok) {
      const rawB = dataB.data || dataB
      
      barbers.value = await Promise.all(rawB.map(async b => {
        const bId = b.ID || b.id
        let avgRating = 0
        let totalRev = 0
        try {
          const revRes = await fetch(`${API_BASE_URL}/barbers/${bId}/reviews`)
          const revData = await revRes.json()
          if (revRes.ok) {
            avgRating = revData.average_rating || 0
            totalRev = revData.total_reviews || 0
          }
        } catch (e) {
          console.error('Gagal mengambil review barber', e)
        }

        const isActive = b.IsActive ?? b.is_active ?? true
        const rawStatus = b.Status || b.status || ''
        const isOff = !isActive || rawStatus.toLowerCase() === 'libur' || rawStatus.toLowerCase() === 'off'

        return {
          id: bId,
          name: b.Name || b.name,
          description: b.Description || b.description || '',
          avatar: b.Avatar || b.avatar,
          work_days: b.WorkDays || b.work_days || 'Senin - Sabtu',
          operational_hours: b.OperationalHours || b.operational_hours || '08:00 - 22:00 WIB',
          average_rating: avgRating,
          total_reviews: totalRev,
          is_off: isOff
        }
      }))
    }
  } catch (err) {
    errorMessage.value = 'Gagal terhubung ke server.'
  } finally {
    isLoading.value = false
  }
}

const openBookingModal = (barber) => {
  if (barber.is_off) return

  const token = localStorage.getItem('token')
  if (!token) {
    toastRef.value?.triggerToast('Silakan login terlebih dahulu untuk membuat booking.', 'error')
    setTimeout(() => router.push('/login'), 1500)
    return
  }

  if (userRole.value === 'admin') {
    toastRef.value?.triggerToast('Akun Admin tidak dapat melakukan booking.', 'error')
    setTimeout(() => router.push('/admin/dashboard'), 1500)
    return
  }

  selectedBarber.value = barber
  isDescExpanded.value = false
  const todayStr = new Date().toLocaleDateString('en-CA')
  
  bookingForm.value = { booking_date: todayStr, booking_time: '' }
  bookedTimes.value = []
  showModal.value = true
}

const submitBooking = async () => {
  if (userRole.value === 'admin') {
    toastRef.value?.triggerToast('Aksi ditolak: Admin tidak diizinkan melakukan booking.', 'error')
    setTimeout(() => router.push('/admin/dashboard'), 1500)
    return
  }

  if (!bookingForm.value.booking_date || !bookingForm.value.booking_time) {
    toastRef.value?.triggerToast('Harap pilih tanggal dan jam booking!', 'error')
    return
  }

  isSubmitting.value = true
  const token = localStorage.getItem('token')

  try {
    const combinedDateTime = new Date(`${bookingForm.value.booking_date}T${bookingForm.value.booking_time}:00`).toISOString()

    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        barber_id: Number(selectedBarber.value.id),
        booking_time: combinedDateTime
      })
    })

    const resData = await response.json()

    if (response.ok) {
      toastRef.value?.triggerToast('Booking berhasil dibuat! Silakan cek di menu Booking Saya.', 'success')
      showModal.value = false
      setTimeout(() => router.push('/my-bookings'), 1500)
    } else {
      toastRef.value?.triggerToast(resData.error || 'Gagal membuat booking.', 'error')
    }
  } catch (err) {
    toastRef.value?.triggerToast('Terjadi kesalahan jaringan.', 'error')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  const role = localStorage.getItem('role') || localStorage.getItem('user_role')
  if (role) {
    userRole.value = role
  }
  fetchData()
})
</script>

<style scoped>
.container { 
  max-width: 1000px; 
  margin: 0 auto; 
  padding: 2rem 1.5rem; 
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.container::-webkit-scrollbar {
  display: none;
}

.header-section { text-align: center; margin-bottom: 2rem; }
.subjudul { color: #94a3b8; font-size: 0.9rem; }

.state-box { text-align: center; padding: 3rem; color: #94a3b8; }
.state-box.error { color: #f87171; }

.barbers-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); 
  gap: 1.2rem; 
}

.barber-card-box {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: opacity 0.2s ease;
}

.barber-card-box.is-off {
  opacity: 0.75;
  border-color: #475569;
}

.avatar-wrapper {
  margin-bottom: 0.6rem;
  margin-top: 0.2rem;
}

.barber-avatar-grid {
  width: 75px;
  height: 75px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f59e0b;
  box-shadow: 0 3px 6px rgba(0,0,0,0.12);
}

.barber-info {
  width: 100%;
  margin-bottom: 0.8rem;
}

.barber-name {
  font-size: 1.1rem;
  margin: 0 0 0.2rem 0;
  color: #f8fafc;
  font-weight: bold;
}

.barber-desc {
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.barber-rating {
  font-size: 0.8rem;
  font-weight: bold;
  color: #4ade80;
  margin-bottom: 0.5rem;
}

.schedule-info {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 0.4rem;
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.schedule-text {
  color: #cbd5e1;
}

.status-badge {
  margin-top: 0.25rem;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  display: inline-block;
  align-self: center;
}

.status-masuk {
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
}

.status-libur {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.card-footer {
  width: 100%;
  margin-top: auto;
}

.btn-book { 
  background: #f59e0b; 
  color: #000; 
  border: none; 
  width: 100%; 
  padding: 0.6rem; 
  border-radius: 8px; 
  font-weight: bold; 
  font-size: 0.85rem;
  cursor: pointer; 
}
.btn-book:hover:not(.disabled) { background: #d97706; }

.btn-book.disabled {
  background: #334155;
  color: #94a3b8;
  cursor: not-allowed;
  opacity: 0.7;
}

.admin-notice {
  text-align: center;
  padding: 0.6rem;
  font-size: 0.78rem;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
  border-radius: 8px;
  font-weight: 500;
}

/* Modal Styling */
.modal-overlay { 
  position: fixed; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  background: rgba(0, 0, 0, 0.75); 
  backdrop-filter: blur(4px);
  display: flex; 
  justify-content: center; 
  align-items: center; 
  z-index: 100; 
}

.modal-content { 
  background: #1e293b; 
  padding: 0.9rem 1.2rem; 
  border-radius: 12px; 
  border: 1px solid #334155; 
  width: 100%; 
  max-width: 440px; 
  color: #fff; 
  box-shadow: 0 15px 35px rgba(0,0,0,0.6); 
  overflow: hidden; 
}

.modal-header-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #334155;
  padding-bottom: 0.3rem;
}

.modal-header-title h3 {
  margin: 0;
  color: #f8fafc;
  font-size: 1rem;
  font-weight: bold;
}

.close-x {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
}
.close-x:hover { color: #fff; }

.modal-barber-profile {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 0.4rem 0.6rem;
  margin-bottom: 0.5rem;
}

.modal-barber-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f59e0b;
  flex-shrink: 0;
}

.modal-barber-meta {
  flex: 1;
}

.modal-barber-meta h4 {
  margin: 0 0 0.05rem 0;
  font-size: 0.85rem;
  color: #f8fafc;
}

.modal-barber-stats {
  font-size: 0.65rem;
  color: #4ade80;
  font-weight: 600;
  margin-bottom: 0.1rem;
}

.modal-barber-desc {
  margin: 0;
  font-size: 0.68rem;
  color: #94a3b8;
  line-height: 1.15;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-barber-desc.expanded {
  display: block;
  overflow: visible;
}

.toggle-desc-btn {
  background: none;
  border: none;
  color: #f59e0b;
  font-size: 0.65rem;
  font-weight: bold;
  padding: 0;
  margin-top: 0.05rem;
  cursor: pointer;
}
.toggle-desc-btn:hover {
  text-decoration: underline;
}

.form-group { margin-bottom: 0.45rem; }
.form-group label { display: block; font-size: 0.72rem; color: #94a3b8; margin-bottom: 0.1rem; font-weight: 600; }

.date-quick-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.35rem;
}

.date-btn {
  background: #0f172a;
  border: 1px solid #334155;
  color: #94a3b8;
  padding: 0.3rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.date-btn:hover { border-color: #f59e0b; color: #fff; }
.date-btn.active { background: rgba(245, 158, 11, 0.2); border-color: #f59e0b; color: #fbbf24; }

.time-grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.3rem;
}

.time-btn {
  background: #0f172a;
  border: 1px solid #334155;
  color: #cbd5e1;
  padding: 0.3rem 0.1rem;
  border-radius: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.time-btn:hover:not(:disabled) {
  border-color: #f59e0b;
  color: #fff;
}

.time-btn.active {
  background: rgba(245, 158, 11, 0.25);
  border-color: #f59e0b;
  color: #fbbf24;
}

.time-btn:disabled {
  background: #090d16;
  border-color: #1e293b;
  color: #475569;
  cursor: not-allowed;
}

.slot-status {
  font-size: 0.52rem;
  color: #ef4444;
  margin-top: 0.02rem;
  font-weight: normal;
}

.payment-box { 
  background: #0f172a; 
  border: 1px solid #334155; 
  padding: 0.35rem 0.5rem; 
  border-radius: 6px; 
  font-size: 0.72rem; 
  color: #cbd5e1; 
  font-weight: 500; 
}

.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
.btn-primary { background: #f59e0b; color: #000; border: none; padding: 0.4rem 0.9rem; border-radius: 6px; font-weight: bold; font-size: 0.78rem; cursor: pointer; }
.btn-primary:disabled { background: #64748b; cursor: not-allowed; opacity: 0.6; }
.btn-secondary { background: #475569; color: #fff; border: none; padding: 0.4rem 0.9rem; border-radius: 6px; font-size: 0.78rem; cursor: pointer; }
</style>