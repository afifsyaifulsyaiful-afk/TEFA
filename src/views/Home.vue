<script setup>
console.log("URL Backend saya:", import.meta.env.VITE_API_URL);
</script>

<template>
  <div class="home-container">
    <!-- Navbar -->
    <header class="navbar">
      <div class="brand">Barberly</div>
      <nav class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/layanan">Layanan</router-link>
        <router-link to="/tentang">Tentang Kami</router-link>
      </nav>
      <router-link to="/login" class="admin-link">
        Masuk
      </router-link>
    </header>

    <!-- Hero Content (Tanpa Card Putih, Langsung di atas Background Redup) -->
    <main class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          Gaya Rambut Rapi,<br />
          Tampil Percaya Diri Setiap Hari.
        </h1>
        <router-link to="/login" class="btn-booking">
          ✂️ Buat Booking Sekarang
        </router-link>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  /* Menggabungkan pola latar belakang barber dengan overlay gelap agar elegan dan redup */
  background: linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), 
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
.nav-links router-link-active {
  color: #ffffff;
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
  border-radius: 50px;
  font-weight: 800;
  font-size: 0.95rem;
  text-decoration: none;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.btn-booking:hover {
  background-color: #e0a800;
  transform: translateY(-2px);
}
</style>