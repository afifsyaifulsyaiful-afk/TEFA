<template>
  <div class="home-container">
    <!-- Hero Content -->
    <main class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          Gaya Rambut Rapi,<br />
          Tampil Percaya Diri Setiap Hari.
        </h1>
        <button @click="handleBookingClick" class="btn-booking">
           Buat Booking Sekarang
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// Logika Rute Tombol "Buat Booking Sekarang"
const handleBookingClick = () => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role') || localStorage.getItem('user_role')

  if (!token) {
    // 1. Jika belum login, bawa ke halaman Login
    router.push('/login')
  } else if (role === 'admin') {
    // 2. Jika login dengan akun ADMIN, bawa ke Dashboard Admin
    router.push('/admin/dashboard')
  } else {
    // 3. Jika login sebagai CUSTOMER, bawa ke halaman Layanan
    router.push('/layanan')
  }
}
</script>

<style scoped>
.home-container {
  min-height: calc(100vh - 80px); /* Menyesuaikan tinggi dengan navbar layout */
  /* Overlay gelap + background pattern */
  background: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), 
              url('../assets/images/bg-barber.png');
  
  /* Setting ukuran tile pattern agar tidak blur & tajam */
  background-size: 220px;
  background-repeat: repeat;
  background-position: top left;
  
  background-color: #121212;
  display: flex;
  flex-direction: column;
  color: #ffffff;
}

.hero-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
}

.hero-content {
  max-width: 700px;
}

.hero-title {
  color: #ffffff !important;
  font-size: 2.3rem;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.5px;
  margin-bottom: 2.5rem;
  font-family: sans-serif;
}

.btn-booking {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: #ffc107;
  color: #000000;
  padding: 0.9rem 2.2rem;
  border: none;
  border-radius: 50px;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.btn-booking:hover {
  background-color: #e0a800;
  transform: translateY(-2px);
}
</style>