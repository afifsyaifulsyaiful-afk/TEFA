<template>
  <div class="container">
    <div class="header-section">
      <h1>Pilih Barber Pilihanmu</h1>
      <p class="subjudul">Pilih tukang cukur profesional kami dan tentukan jadwal cukur favoritmu</p>
    </div>

    <!-- State Loading & Error -->
    <div v-if="isLoading" class="state-box">Memuat daftar barber...</div>
    <div v-else-if="errorMessage" class="state-box error">{{ errorMessage }}</div>

    <!-- Grid Katalog Barber (Barber-Centric) -->
    <div v-else class="barbers-grid">
      <div v-for="b in barbers" :key="b.id" class="barber-card-box">
        <div class="avatar-wrapper">
          <img :src="b.avatar ? `${API_BASE_URL.replace('/api', '')}${b.avatar}` : 'https://via.placeholder.com/100'" 
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
          </div>
        </div>
        <div class="card-footer">
          <!-- Tombol Booking HANYA muncul jika BUKAN admin -->
          <button v-if="userRole !== 'admin'" class="btn-book" @click="openBookingModal(b)">
            Booking Sekarang
          </button>
          <!-- Label khusus untuk Admin -->
          <div v-else class="admin-notice">
            <span>Mode Lihat Admin (Booking Dinonaktifkan)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form Booking Barber-Centric -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Booking dengan Barber: {{ selectedBarber?.name }}</h3>
        
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

          <!-- Jam Cukur -->
          <div class="form-group">
            <label>Pilih Jam Cukur</label>
            <select v-model="bookingForm.booking_time" required class="form-control">
              <option value="" disabled>-- Pilih Jam Operasional --</option>
              <option 
                v-for="slot in timeSlotsWithStatus" 
                :key="slot.time" 
                :value="slot.time"
                :disabled="slot.isBooked || slot.isPassed"
              >
                {{ slot.time }} WIB {{ slot.isBooked ? '(Sudah Dibooking)' : (slot.isPassed ? '(Sudah Lewat)' : '') }}
              </option>
            </select>
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

const allTimeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00'
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

        return {
          id: bId,
          name: b.Name || b.name,
          description: b.Description || b.description || '',
          avatar: b.Avatar || b.avatar,
          work_days: b.WorkDays || b.work_days || 'Senin - Sabtu',
          operational_hours: b.OperationalHours || b.operational_hours || '08:00 - 22:00 WIB',
          average_rating: avgRating,
          total_reviews: totalRev
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

  /* Menghilangkan scrollbar vertikal pada container halaman Layanan */
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE dan Edge */
}

/* Chrome, Safari, dan Opera */
.container::-webkit-scrollbar {
  display: none;
}

.header-section { text-align: center; margin-bottom: 2.5rem; }
.subjudul { color: #94a3b8; }

.state-box { text-align: center; padding: 3rem; color: #94a3b8; }
.state-box.error { color: #f87171; }

.barbers-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
  gap: 1.5rem; 
}

.barber-card-box {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
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
  border: 3px solid #f59e0b;
  box-shadow: 0 4px 8px rgba(0,0,0,0.12);
}

.barber-info {
  width: 100%;
  margin-bottom: 1rem;
}

.barber-name {
  font-size: 1.2rem;
  margin: 0 0 0.3rem 0;
  color: #f8fafc;
  font-weight: bold;
}

.barber-desc {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0 0 0.6rem 0;
  line-height: 1.3;
}

.barber-rating {
  font-size: 0.85rem;
  font-weight: bold;
  color: #4ade80;
  margin-bottom: 0.6rem;
}

.schedule-info {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 0.5rem;
  font-size: 0.78rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.schedule-text {
  color: #cbd5e1;
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
  padding: 0.75rem; 
  border-radius: 8px; 
  font-weight: bold; 
  cursor: pointer; 
}
.btn-book:hover { background: #d97706; }

.admin-notice {
  text-align: center;
  padding: 0.75rem;
  font-size: 0.85rem;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
  border-radius: 8px;
  font-weight: 500;
}

/* Modal Styling */
.modal-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; justify-content:center; align-items:center; z-index:100; }
.modal-content { background: #1e293b; padding: 1.5rem; border-radius: 12px; border: 1px solid #334155; width: 100%; max-width: 480px; color: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
.modal-content h3 { margin-top: 0; margin-bottom: 1rem; color: #f8fafc; font-size: 1.1rem; }

.form-group { margin-bottom: 0.9rem; }
.form-group label { display: block; font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.3rem; font-weight: 600; }

.form-control { width: 100%; padding: 0.6rem; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: #fff; box-sizing: border-box; font-size: 0.9rem; }
.form-control:focus { outline: none; border-color: #f59e0b; }

/* Quick Date Buttons */
.date-quick-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}

.date-btn {
  background: #0f172a;
  border: 1px solid #334155;
  color: #94a3b8;
  padding: 0.55rem;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.date-btn:hover { border-color: #f59e0b; color: #fff; }
.date-btn.active { background: rgba(245, 158, 11, 0.2); border-color: #f59e0b; color: #fbbf24; }

.payment-box { 
  background: #0f172a; 
  border: 1px solid #334155; 
  padding: 0.6rem; 
  border-radius: 8px; 
  font-size: 0.85rem; 
  color: #cbd5e1; 
  font-weight: 500; 
}

.modal-actions { display: flex; justify-content: flex-end; gap: 0.8rem; margin-top: 1rem; }
.btn-primary { background: #f59e0b; color: #000; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: bold; cursor: pointer; }
.btn-primary:disabled { background: #64748b; cursor: not-allowed; opacity: 0.6; }
.btn-secondary { background: #475569; color: #fff; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; }
</style>