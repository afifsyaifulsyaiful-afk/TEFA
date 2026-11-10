<template>
  <div class="container">
    <div class="top-bar">
      <button class="btn-back" @click="router.push('/')">
        Kembali ke Beranda
      </button>
    </div>

    <div class="header-section">
      <h1>Booking Saya</h1>
      <p class="subjudul">Cek status dan riwayat janji cukur rambutmu di sini</p>
    </div>

    <!-- State Loading & Error -->
    <div v-if="isLoading" class="state-box">
      Memuat data booking...
    </div>
    <div v-else-if="errorMessage" class="state-box error">
      {{ errorMessage }}
    </div>

    <!-- State Jika Belum Ada Booking -->
    <div v-else-if="bookings.length === 0" class="empty-state">
      <p>Kamu belum memiliki riwayat booking.</p>
      <button class="btn-booking-now" @click="router.push('/layanan')">
        Buat Booking Sekarang
      </button>
    </div>

    <!-- Daftar Card Booking -->
    <div v-else class="booking-grid">
      <div 
        v-for="item in sortedBookings" 
        :key="item.id || item.ID" 
        class="booking-card"
      >
        <div class="card-header">
          <span class="service-name">Booking Barber: {{ item.barber?.name || item.Barber?.Name || item.barber_name || 'Barber' }}</span>
          <span :class="['status-badge', getStatusClass(item.status || item.Status)]">
            {{ formatStatus(item.status || item.Status) }}
          </span>
        </div>

        <div class="card-body">
          <div class="info-row">
            <span class="label">Barber:</span>
            <span class="val">{{ item.barber?.name || item.Barber?.Name || item.barber_name || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Jadwal Cukur:</span>
            <span class="val highlight">{{ formatDate(item.booking_time || item.BookingTime) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Waktu Dipesan:</span>
            <span class="val">{{ formatDate(item.created_at || item.CreatedAt) }}</span>
          </div>
          <!-- Informasi Metode Pembayaran -->
          <div class="info-row payment-info">
            <span class="label">Metode Pembayaran:</span>
            <span class="val payment-method">
              Bayar Tunai di Kasir 
              <small class="payment-status-tag" :class="(item.status || item.Status) === 'completed' ? 'tag-paid' : 'tag-unpaid'">
                ({{ (item.status || item.Status) === 'completed' ? 'Lunas' : 'Bayar Setelah Cukur' }})
              </small>
            </span>
          </div>
        </div>

        <!-- Footer Card -->
        <div class="card-footer">
          <!-- Tombol Batal jika masih pending / confirmed -->
          <button v-if="(item.status || item.Status) === 'pending' || (item.status || item.Status) === 'confirmed'" class="btn-cancel" @click="cancelBooking(item.id || item.ID)">
            Batalkan Booking
          </button>

          <!-- Tombol Beri Ulasan jika sudah selesai (completed) dan belum direview -->
          <button v-if="(item.status || item.Status) === 'completed' && !item.review && !item.Review" class="btn-review" @click="openReviewModal(item)">
            Beri Ulasan Barber
          </button>

          <!-- Keterangan jika sudah selesai dan sudah pernah di-review -->
          <span v-if="(item.status || item.Status) === 'completed' && (item.review || item.Review)" class="reviewed-tag">
            Ulasan Telah Dikirim ({{ (item.review || item.Review).rating || (item.review || item.Review).Rating }} Bintang)
          </span>
        </div>
      </div>
    </div>

    <!-- Modal Beri Ulasan -->
    <div v-if="showReviewModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Beri Ulasan untuk Barber</h3>
        <p class="modal-subtitle">Bagikan pengalaman cukur rambut Anda bersama <strong>{{ selectedBookingForReview?.barber?.name || selectedBookingForReview?.Barber?.Name || selectedBookingForReview?.barber_name || 'Barber' }}</strong></p>
        
        <form @submit.prevent="submitReview">
          <div class="form-group">
            <label>Rating (1 - 5 Bintang)</label>
            <select v-model="reviewForm.rating" class="form-select" required>
              <option value="5">5 Bintang (Sangat Puas)</option>
              <option value="4">4 Bintang (Puas)</option>
              <option value="3">3 Bintang (Cukup)</option>
              <option value="2">2 Bintang (Kurang)</option>
              <option value="1">1 Bintang (Sangat Buruk)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Komentar / Ulasan</label>
            <textarea v-model="reviewForm.comment" rows="3" placeholder="Tuliskan komentar atau pujian untuk hasil cukur..." class="form-textarea"></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showReviewModal = false" class="btn-secondary">Batal</button>
            <button type="submit" :disabled="isSubmittingReview" class="btn-primary">
              {{ isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan' }}
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Toast from '@/components/Toast.vue'

const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const toastRef = ref(null)
const userRole = ref('')
const bookings = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const showReviewModal = ref(false)
const selectedBookingForReview = ref(null)
const reviewForm = ref({
  rating: 5,
  comment: ''
})
const isSubmittingReview = ref(false)

const fetchMyBookings = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await fetch(`${API_BASE_URL}/bookings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const result = await response.json()

    if (response.ok) {
      bookings.value = result.data || result || []
    } else {
      errorMessage.value = result.error || 'Gagal memuat riwayat booking.'
    }
  } catch (err) {
    errorMessage.value = 'Kesalahan jaringan saat terhubung ke server.'
  } finally {
    isLoading.value = false
  }
}

const sortedBookings = computed(() => {
  return [...bookings.value].sort((a, b) => {
    const statusA = (a.status || a.Status || '').toLowerCase()
    const statusB = (b.status || b.Status || '').toLowerCase()

    const isActiveA = statusA === 'pending' || statusA === 'confirmed'
    const isActiveB = statusB === 'pending' || statusB === 'confirmed'

    if (isActiveA && !isActiveB) return -1
    if (!isActiveA && isActiveB) return 1

    const timeA = new Date(a.created_at || a.CreatedAt || 0).getTime()
    const timeB = new Date(b.created_at || b.CreatedAt || 0).getTime()
    return timeB - timeA
  })
})

const formatDate = (isoString) => {
  if (!isoString) return '-'
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(date)
}

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'badge-pending'
    case 'confirmed': return 'badge-confirmed'
    case 'completed': return 'badge-completed'
    case 'rejected':
    case 'declined': return 'badge-rejected'
    case 'cancelled': return 'badge-cancelled'
    default: return 'badge-default'
  }
}

const formatStatus = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'Menunggu Konfirmasi'
    case 'confirmed': return 'Dikonfirmasi'
    case 'completed': return 'Selesai'
    case 'rejected':
    case 'declined': return 'Ditolak Admin'
    case 'cancelled': return 'Dibatalkan'
    default: return status
  }
}

const openReviewModal = (booking) => {
  selectedBookingForReview.value = booking
  reviewForm.value = { rating: 5, comment: '' }
  showReviewModal.value = true
}

const submitReview = async () => {
  if (!selectedBookingForReview.value) return

  isSubmittingReview.value = true
  try {
    const token = localStorage.getItem('token')
    const bookingId = selectedBookingForReview.value.id || selectedBookingForReview.value.ID

    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        booking_id: Number(bookingId),
        rating: Number(reviewForm.value.rating),
        comment: reviewForm.value.comment
      })
    })

    const result = await res.json()
    if (res.ok) {
      toastRef.value?.triggerToast('Ulasan berhasil dikirim!', 'success')
      showReviewModal.value = false
      fetchMyBookings()
    } else {
      toastRef.value?.triggerToast(result.error || 'Gagal mengirim ulasan.', 'error')
    }
  } catch (err) {
    console.error(err)
    toastRef.value?.triggerToast('Terjadi kesalahan jaringan.', 'error')
  } finally {
    isSubmittingReview.value = false
  }
}

const cancelBooking = async (id) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      toastRef.value?.triggerToast('Booking berhasil dibatalkan.', 'success')
      fetchMyBookings()
    } else {
      const res = await response.json()
      toastRef.value?.triggerToast(res.error || 'Gagal membatalkan booking.', 'error')
    }
  } catch (err) {
    toastRef.value?.triggerToast('Terjadi kesalahan jaringan.', 'error')
  }
}

onMounted(() => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role') || localStorage.getItem('user_role')

  if (!token) {
    router.push('/login')
    return
  }

  userRole.value = role

  if (role === 'admin') {
    toastRef.value?.triggerToast('Akses ditolak: Akun Admin tidak memiliki halaman Booking Saya.', 'error')
    setTimeout(() => router.push('/admin/dashboard'), 1500)
    return
  }

  fetchMyBookings()
})
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.top-bar {
  margin-bottom: 1rem;
}

.btn-back {
  background: none;
  border: none;
  color: #fbbf24;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.header-section {
  text-align: center;
  margin-bottom: 2.5rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subjudul {
  color: #94a3b8;
}

.state-box {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.state-box.error {
  color: #f87171;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #1e293b;
  border-radius: 12px;
  border: 1px solid #334155;
}

.empty-state p {
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.btn-booking-now {
  background: #f59e0b;
  color: #000;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  font-weight: 700;
  cursor: pointer;
}

.booking-grid {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.booking-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #334155;
  padding-bottom: 0.8rem;
  margin-bottom: 1rem;
}

.service-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f8fafc;
}

.status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-pending { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b; }
.badge-confirmed { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid #3b82f6; }
.badge-completed { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid #22c55e; }
.badge-rejected { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; }
.badge-cancelled { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; }

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
}

.label {
  color: #94a3b8;
}

.val {
  color: #e2e8f0;
  font-weight: 500;
}

.val.highlight {
  color: #fbbf24;
}

.payment-info {
  margin-top: 0.2rem;
  padding-top: 0.4rem;
  border-top: 1px dashed #334155;
}

.payment-method {
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.payment-status-tag {
  font-size: 0.75rem;
  font-weight: 600;
}

.tag-paid {
  color: #4ade80;
}

.tag-unpaid {
  color: #fbbf24;
}

.card-footer {
  margin-top: 1.2rem;
  padding-top: 0.8rem;
  border-top: 1px solid #334155;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
}

.btn-cancel {
  background: transparent;
  border: 1px solid #ef4444;
  color: #f87171;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #ef4444;
  color: #ffffff;
}

.btn-review {
  background: #f59e0b;
  border: none;
  color: #000000;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-review:hover {
  background: #d97706;
}

.reviewed-tag {
  color: #4ade80;
  font-size: 0.85rem;
  font-weight: 600;
  background: rgba(34, 197, 94, 0.1);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #1e293b;
  border: 1px solid #334155;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #f8fafc;
  font-size: 1.25rem;
}

.modal-subtitle {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 0.4rem;
}

.form-select, .form-textarea {
  width: 100%;
  padding: 0.7rem;
  background-color: #0f172a;
  border: 1px solid #475569;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #f8fafc;
  box-sizing: border-box;
}

.form-textarea {
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 1.5rem;
}

.btn-secondary {
  background: #475569;
  color: #ffffff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: #f59e0b;
  color: #000000;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary:hover {
  background: #d97706;
}
</style>