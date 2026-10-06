<template>
  <div class="layanan">
    <h1>Daftar Layanan 💈</h1>
    <p class="subjudul">Pilih layanan yang kamu inginkan</p>

    <div class="layanan-list">
      <div class="layanan-card">
        <h3>✂️ Potong Rambut</h3>
        <p>Potongan rambut model terbaru & rapi</p>
        <span class="harga">Rp 35.000</span>
        <button class="btn-pilih">Pilih Layanan</button>
      </div>

      <div class="layanan-card">
        <h3>🧼 Cuci + Potong</h3>
        <p>Cuci rambut + potong + keringkan</p>
        <span class="harga">Rp 45.000</span>
        <button class="btn-pilih">Pilih Layanan</button>
      </div>

      <div class="layanan-card">
        <h3>🎨 Cat Rambut</h3>
        <p>Warna sesuai keinginan + perawatan</p>
        <span class="harga">Rp 80.000</span>
        <button class="btn-pilih">Pilih Layanan</button>
      </div>

      <div class="layanan-card">
        <h3>💆‍♂️ Paket Lengkap</h3>
        <p>Potong + cuci + pijat kepala</p>
        <span class="harga">Rp 100.000</span>
        <button class="btn-pilih">Pilih Layanan</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layanan {
  max-width: 1000px;
  margin: 3rem auto;
  padding: 0 1rem;
  text-align: center;
}

h1 {
  font-size: 2rem;
  color: #222;
  margin-bottom: 0.5rem;
}

.subjudul {
  color: #666;
  margin-bottom: 2.5rem;
}

.layanan-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.layanan-card {
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.layanan-card:hover {
  transform: translateY(-5px);
  border-color: #222;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.layanan-card h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #111;
}

.layanan-card p {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
}

.harga {
  display: block;
  font-size: 1.3rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 1rem;
}

.btn-pilih {
  width: 100%;
  padding: 0.8rem;
  background: #222;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-pilih:hover {
  background: #444;
}
</style>