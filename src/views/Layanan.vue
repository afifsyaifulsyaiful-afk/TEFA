<template>
  <div class="layanan-page">
    <!-- Navbar -->
    <header class="navbar">
      <div class="brand" @click="router.push('/')">Barberly</div>
      <nav class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/layanan">Layanan</router-link>
        <router-link to="/my-bookings">Booking Saya</router-link>
        <router-link to="/tentang">Tentang Kami</router-link>
      </nav>
      <div class="nav-auth">
        <button class="btn-logout" @click="handleLogout">Keluar</button>
      </div>
    </header>

    <main class="container">
      <div class="header-section">
        <h1>Pilih Layanan Cukur ✂️</h1>
        <p class="subjudul">Pilih layanan terbaik kami dan tentukan jadwal cukur favoritmu</p>
      </div>

      <!-- State Loading & Error -->
      <div v-if="isLoading" class="state-box">Memuat daftar layanan...</div>
      <div v-else-if="errorMessage" class="state-box error">{{ errorMessage }}</div>

      <!-- Grid Daftar Layanan Pelanggan -->
      <div v-else class="services-grid">
        <div v-for="service in services" :key="service.id" class="service-card">
          <div class="card-body">
            <h3 class="service-title">{{ service.name }}</h3>
            <p class="service-duration">⏱️ Durasi: {{ service.duration || 30 }} Menit</p>
            <p class="service-price">Rp {{ Number(service.price).toLocaleString('id-ID') }}</p>
          </div>
          <div class="card-footer">
            <button class="btn-book" @click="openBookingModal(service)">
              Booking Sekarang
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Form Booking -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Booking Layanan: {{ selectedService?.name }}</h3>
        
        <form @submit.prevent="submitBooking">
          <!-- Pilih Barber dengan Foto & Scrollbar Rapi -->
          <div class="form-group">
            <label>Pilih Barber</label>
            <div class="barber-list-container">
              <div 
                v-for="b in barbers" 
                :key="b.id" 
                :class="['barber-list-item', { active: bookingForm.barber_id === b.id }]"
                @click="selectBarber(b.id)"
              >
                <img 
                  :src="b.avatar ? `${API_BASE_URL.replace('/api', '')}${b.avatar}` : 'https://via.placeholder.com/60'" 
                  alt="Avatar" 
                  class="barber-list-avatar"
                />
                <div class="barber-list-info">
                  <span class="barber-list-name">{{ b.name }}</span>
                  <span class="barber-list-spec">⭐ {{ b.specialty || 'Semua Layanan' }}</span>
                </div>
                <div class="radio-indicator"></div>
              </div>
            </div>
          </div>

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

          <!-- Jam Cukur dengan Penanda Jam yang Sudah Dibooking -->
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const services = ref([])
const barbers = ref([])
const bookedTimes = ref([]) // Menyimpan daftar jam yang sudah dibooking oleh barber pada tanggal tertentu
const isLoading = ref(true)
const errorMessage = ref('')

const showModal = ref(false)
const selectedService = ref(null)
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
  barber_id: '',
  booking_date: '',
  booking_time: ''
})

// Fungsi untuk mengambil data booking yang sudah ada dari server berdasarkan barber & tanggal
const fetchBookedSlots = async () => {
  if (!bookingForm.value.barber_id || !bookingForm.value.booking_date) {
    bookedTimes.value = []
    return
  }

  const token = localStorage.getItem('token')
  try {
    const response = await fetch(`${API_BASE_URL}/bookings?barber_id=${bookingForm.value.barber_id}&date=${bookingForm.value.booking_date}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    if (response.ok) {
      const rawBookings = data.data || data
      // Ambil jam dari waktu booking yang sudah ada (format: HH:MM)
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

// Pantau perubahan barber atau tanggal untuk memperbarui slot jam yang terisi
watch(() => [bookingForm.value.barber_id, bookingForm.value.booking_date], () => {
  fetchBookedSlots()
})

const selectBarber = (id) => {
  bookingForm.value.barber_id = id
  bookingForm.value.booking_time = ''
}

const selectDate = (dateVal) => {
  bookingForm.value.booking_date = dateVal
  bookingForm.value.booking_time = ''
}

// Menghasilkan daftar jam lengkap dengan status apakah sudah dibooking atau sudah lewat
const timeSlotsWithStatus = computed(() => {
  const todayStr = new Date().toLocaleDateString('en-CA')
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  return allTimeSlots.map(time => {
    const [h, m] = time.split(':').map(Number)
    
    // Cek apakah jam sudah lewat (hanya berlaku jika memilih hari ini)
    let isPassed = false
    if (bookingForm.value.booking_date === todayStr) {
      if (h < currentHour || (h === currentHour && m <= currentMinute)) {
        isPassed = true
      }
    }

    // Cek apakah jam sudah dibooking orang lain
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
    const resS = await fetch(`${API_BASE_URL}/services`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const dataS = await resS.json()
    if (resS.ok) {
      const rawS = dataS.data || dataS
      services.value = rawS.map(s => ({
        id: s.ID || s.id,
        name: s.Name || s.name,
        price: s.Price || s.price,
        duration: s.Duration || s.duration || 30
      }))
    }

    const resB = await fetch(`${API_BASE_URL}/barbers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const dataB = await resB.json()
    if (resB.ok) {
      const rawB = dataB.data || dataB
      barbers.value = rawB.map(b => ({
        id: b.ID || b.id,
        name: b.Name || b.name,
        specialty: b.Specialty || b.specialty,
        avatar: b.Avatar || b.avatar
      }))
    }
  } catch (err) {
    errorMessage.value = 'Gagal terhubung ke server.'
  } finally {
    isLoading.value = false
  }
}

const openBookingModal = (service) => {
  const token = localStorage.getItem('token')
  if (!token) {
    alert('Silakan login terlebih dahulu untuk membuat booking.')
    router.push('/login')
    return
  }

  selectedService.value = service
  const todayStr = new Date().toLocaleDateString('en-CA')
  
  bookingForm.value = { barber_id: '', booking_date: todayStr, booking_time: '' }
  bookedTimes.value = []
  showModal.value = true
}

const submitBooking = async () => {
  if (!bookingForm.value.barber_id) {
    alert('Harap pilih barber terlebih dahulu!')
    return
  }
  if (!bookingForm.value.booking_date || !bookingForm.value.booking_time) {
    alert('Harap pilih tanggal dan jam booking!')
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
        service_id: Number(selectedService.value.id),
        barber_id: Number(bookingForm.value.barber_id),
        booking_time: combinedDateTime
      })
    })

    const resData = await response.json()

    if (response.ok) {
      alert('Booking berhasil dibuat! Silakan cek di menu Booking Saya.')
      showModal.value = false
      router.push('/my-bookings')
    } else {
      alert(resData.error || 'Gagal membuat booking.')
    }
  } catch (err) {
    alert('Terjadi kesalahan jaringan.')
  } finally {
    isSubmitting.value = false
  }
}

const handleLogout = () => {
  localStorage.clear()
  router.push('/login')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.layanan-page { min-height: 100vh; background-color: #121212; color: #fff; }
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 3rem; background-color: #000; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
.brand { font-size: 1.6rem; font-family: serif; font-weight: bold; cursor: pointer; }
.nav-links { display: flex; gap: 2rem; }
.nav-links a { color: #b0b0b0; text-decoration: none; }
.nav-links a.router-link-active { color: #fff; font-weight: bold; }
.btn-logout { background: #ef4444; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }

.container { max-width: 1000px; margin: 0 auto; padding: 2rem 1.5rem; }
.header-section { text-align: center; margin-bottom: 2.5rem; }
.subjudul { color: #94a3b8; }

.state-box { text-align: center; padding: 3rem; color: #94a3b8; }
.state-box.error { color: #f87171; }

.services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
.service-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; }
.service-title { font-size: 1.2rem; margin-top: 0; margin-bottom: 0.5rem; color: #f8fafc; }
.service-duration { font-size: 0.85rem; color: #94a3b8; margin-bottom: 1rem; }
.service-price { font-size: 1.3rem; font-weight: bold; color: #4ade80; margin: 0; }

.btn-book { background: #f59e0b; color: #000; border: none; width: 100%; padding: 0.75rem; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 1rem; }
.btn-book:hover { background: #d97706; }

/* Modal Styling */
.modal-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; justify-content:center; align-items:center; z-index:100; }
.modal-content { background: #1e293b; padding: 1.5rem; border-radius: 12px; border: 1px solid #334155; width: 100%; max-width: 480px; color: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }

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

/* Barber List Compact */
.barber-list-container {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-height: 135px;
  overflow-y: auto;
  padding-right: 0.2rem;
}

.barber-list-container::-webkit-scrollbar {
  width: 4px;
}
.barber-list-container::-webkit-scrollbar-track {
  background: transparent;
}
.barber-list-container::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}

.barber-list-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 0.45rem 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.barber-list-item:hover { border-color: #f59e0b; }
.barber-list-item.active { border-color: #f59e0b; background: rgba(245, 158, 11, 0.12); }

.barber-list-avatar {
  width: 42px;
  height: 42px;
  min-width: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f59e0b;
}

.barber-list-info { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
.barber-list-name { font-size: 0.88rem; font-weight: bold; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.barber-list-spec { font-size: 0.72rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.radio-indicator {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #475569;
}

.barber-list-item.active .radio-indicator {
  border-color: #f59e0b;
  background: #f59e0b;
  box-shadow: inset 0 0 0 2px #0f172a;
}

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