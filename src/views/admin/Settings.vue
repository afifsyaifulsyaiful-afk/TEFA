<template>
  <div class="settings-page">
    <div class="page-header">
      <h2>Pengaturan Barbershop</h2>
      <p class="text-muted">Kelola informasi profil dan operasional barbershop Anda.</p>
    </div>

    <div class="settings-form card">
      <form @submit.prevent="saveSettings">
        <div class="form-group">
          <label>Nama Barbershop</label>
          <input type="text" v-model="form.name" placeholder="Nama Barbershop" />
        </div>

        <div class="form-group">
          <label>Alamat Barbershop</label>
          <textarea v-model="form.address" rows="3" placeholder="Alamat lengkap"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Nomor Telepon / WhatsApp</label>
            <input type="text" v-model="form.phone" placeholder="08xxxxxxxxxx" />
          </div>

          <div class="form-group">
            <label>Email Barbershop</label>
            <input type="email" v-model="form.email" placeholder="email@barbershop.com" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Jam Buka</label>
            <input type="time" v-model="form.openTime" />
          </div>

          <div class="form-group">
            <label>Jam Tutup</label>
            <input type="time" v-model="form.closeTime" />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary">💾 Simpan Perubahan</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'

const form = reactive({
  name: 'Barberly',
  address: 'Jl. Merdeka No. 45, Jakarta Selatan',
  phone: '081234567890',
  email: 'admin@barberly.com',
  openTime: '09:00',
  closeTime: '21:00'
})

// Muat data dari localStorage saat komponen dimuat
onMounted(() => {
  const savedSettings = localStorage.getItem('barber_settings')
  if (savedSettings) {
    const parsed = JSON.parse(savedSettings)
    Object.assign(form, parsed)
  }
})

// Simpan data ke localStorage
const saveSettings = () => {
  localStorage.setItem('barber_settings', JSON.stringify(form))
  alert('Pengaturan berhasil disimpan!')
}
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.page-header h2 {
  margin: 0;
  font-size: 1.35rem;
}

.text-muted {
  color: #64748b;
  font-size: 0.85rem;
  margin-top: 0.2rem;
}

.card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  max-width: 700px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.form-group input,
.form-group textarea {
  padding: 0.6rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.85rem;
  outline: none;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #3b82f6;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  margin-top: 1rem;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.65rem 1.2rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #2563eb;
}
</style>