<template>
  <div>
    <nav class="navbar">
      <router-link to="/">Home</router-link>
      <router-link to="/layanan">Layanan</router-link>
      <router-link to="/booking">Booking</router-link>
      <router-link to="/profil">Profil Saya</router-link>
      <router-link to="/kategori" class="aktif">Kategori</router-link>
    </nav>

    <h1>Daftar Kategori Layanan</h1>

    <div class="kategori-container">
      <div
        v-for="k in daftarKategori"
        :key="k.id_kategori"
        class="kategori-card"
      >
        <h3>{{ k.nama_kategori }}</h3>

        <p>{{ k.deskripsi }}</p>

        <router-link
          :to="{
            path: '/layanan',
            query: { kategori: k.id_kategori }
          }"
          class="btn-lihat"
        >
          Lihat Layanan →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const daftarKategori = ref([])

const ambilKategori = async () => {
  try {
    const res = await axios.get('/api/kategori')
    daftarKategori.value = res.data
  } catch (err) {
    console.error('Gagal ambil kategori:', err)

    daftarKategori.value = [
      {
        id_kategori: 1,
        nama_kategori: 'Potong Rambut',
        deskripsi: 'Berbagai model potongan rambut pria & anak'
      },
      {
        id_kategori: 2,
        nama_kategori: 'Perawatan Wajah',
        deskripsi: 'Cukur, cuci muka, & perawatan kulit'
      },
      {
        id_kategori: 3,
        nama_kategori: 'Paket Lengkap',
        deskripsi: 'Potong + cukur + cuci rambut — hemat & lengkap'
      }
    ]
  }
}

onMounted(() => {
  ambilKategori()
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

.kategori-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.kategori-card {
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: 0.3s;
}

.kategori-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.kategori-card h3 {
  margin: 0 0 0.5rem 0;
  color: #222;
}

.kategori-card p {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.btn-lihat {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #b8860b;
  color: #ffffff;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
}

.btn-lihat:hover {
  background-color: #9a7209;
}
</style>