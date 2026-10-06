<template>
  <div class="tentang-container">
    <!-- Navbar -->
    <header class="navbar">
      <div class="brand">Barberly</div>
      <nav class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/layanan">Layanan</router-link>
        <router-link to="/tentang" class="active">Tentang Kami</router-link>
      </nav>
      <router-link to="/login" class="admin-link">
        Masuk
      </router-link>
    </header>

    <!-- Main Content -->
    <main class="content-section">
      <div class="content-card">
        <h1>Tentang Barberly</h1>
        <p class="subtitle">LOOK SHARP, FEEL CONFIDENT</p>
        
        <div class="description">
          <p>
            Barberly adalah platform layanan dan pemesanan barbershop modern yang dirancang untuk memberikan pengalaman perawatan rambut terbaik bagi para pria. Kami menghadirkan kemudahan dalam memilih layanan profesional, memesan jadwal, dan mengelola gaya rambut impian Anda dengan cepat dan praktis.
          </p>
          <p>
            Dengan komitmen terhadap kualitas dan kenyamanan, Barberly hadir untuk memastikan setiap pelanggan tampil rapi dan percaya diri setiap hari.
          </p>
        </div>

        <router-link to="/" class="btn-back">
          &larr; Kembali ke Beranda
        </router-link>
      </div>
    </main>
  </div>
</template>

<script setup>
// Komponen Tentang Kami
</script>

<style scoped>
.tentang-container {
  min-height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), 
              url('../assets/images/bg-barber.png');
  background-size: 350px;
  background-repeat: repeat;
  background-color: #121212;
  display: flex;
  flex-direction: column;
  color: #ffffff;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 3rem;
  background-color: #000000;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand {
  font-size: 1.6rem;
  font-family: serif;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  color: #b0b0b0;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.2s ease;
}

.nav-links a:hover,
.nav-links .active {
  color: #ffffff;
  font-weight: 600;
}

.admin-link {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #ffffff;
  padding: 0.5rem 1.2rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.admin-link:hover {
  background: #ffffff;
  color: #000000;
  border-color: #ffffff;
}

.content-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 1.5rem;
}

.content-card {
  background: rgba(20, 20, 20, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3rem;
  border-radius: 8px;
  max-width: 700px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.content-card h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.subtitle {
  color: #ffc107;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 2rem;
}

.description {
  color: #cccccc;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
  text-align: left;
}

.description p {
  margin-bottom: 1rem;
}

.btn-back {
  display: inline-block;
  background-color: transparent;
  border: 1px solid #ffc107;
  color: #ffc107;
  padding: 0.7rem 1.8rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background-color: #ffc107;
  color: #000000;
}
</style>