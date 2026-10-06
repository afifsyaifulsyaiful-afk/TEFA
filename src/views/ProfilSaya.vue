<template>
  <div>
    <nav class="navbar">
      <router-link to="/">Home</router-link>
      <router-link to="/layanan">Layanan</router-link>
      <router-link to="/booking">Booking</router-link>
      <router-link to="/profil" class="aktif">Profil Saya</router-link>
      <router-link to="/kategori">Kategori</router-link>
    </nav>

    <h1>Halaman Profil Saya</h1>

    <div class="profil">
      <div class="profil-card">
        <div class="foto-profil"></div>
        <div class="ikon-user">👤</div>
      </div>

      <h2>Profil Saya</h2>
      <p class="sub-judul">Data diri & riwayat booking</p>

      <div class="info-profil">
        <div class="baris">
          <span class="label">Nama Lengkap</span>
          <span class="isi">{{ user.nama }}</span>
        </div>
        <div class="baris">
          <span class="label">Email</span>
          <span class="isi">{{ user.email }}</span>
        </div>
        <div class="baris">
          <span class="label">No. HP</span>
          <span class="isi">{{ user.no_hp }}</span>
        </div>
      </div>

      <div class="riwayat-booking">
        <h3>Riwayat Booking</h3>
        <div v-for="b in daftarBooking" :key="b.id_booking" class="item-booking">
          <p><strong>{{ b.nama_layanan }}</strong></p>
          <p>{{ b.jadwal_booking }}</p>
          <span class="status">{{ b.status_booking }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const user = ref({})
const daftarBooking = ref([])

const ambilDataProfil = async () => {
  try {
    const resUser = await axios.get('/api/user/profil')
    user.value = resUser.data
    const resBooking = await axios.get('/api/booking-saya')
    daftarBooking.value = resBooking.data
  } catch (err) {
    console.error('Gagal ambil data:', err)
    user.value = { nama: 'Andi Pratama', email: 'andi@gmail.com', no_hp: '08123456789' }
    daftarBooking.value = [
      { id_booking: 1, nama_layanan: 'Haircut', jadwal_booking: '2026-09-05 10:00', status_booking: 'Dikonfirmasi' },
      { id_booking: 2, nama_layanan: 'Shaving', jadwal_booking: '2026-09-03 14:30', status_booking: 'Selesai' }
    ]
  }
}

onMounted(() => {
  ambilDataProfil()
})
</script>

<style scoped>
.navbar {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #ddd;
  padding-bottom: 1rem;
}
.navbar a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
}
.navbar a.aktif {
  color: #b8860b;
  font-weight: bold;
}
.profil-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.foto-profil {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #ddd;
}
.baris {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}
.riwayat-booking {
  margin-top: 2rem;
}
.item-booking {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}
.status {
  background: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
}
</style>