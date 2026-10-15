<template>
  <div class="settings-container">
    <div class="header-section">
      <h1 class="page-title">Pengaturan Barbershop</h1>
      <p class="page-subtitle">Kelola informasi profil dan operasional barbershop Anda.</p>
    </div>

    <div class="card">
      <form @submit.prevent="saveSettings" class="settings-form">
        <!-- Nama Barbershop -->
        <div class="form-group">
          <label>Nama Barbershop</label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="Masukkan nama barbershop"
          />
        </div>

        <!-- Alamat Barbershop -->
        <div class="form-group">
          <label>Alamat Barbershop</label>
          <textarea
            v-model="form.address"
            rows="3"
            required
            placeholder="Masukkan alamat lengkap"
          ></textarea>
        </div>

        <!-- No Telepon & Email -->
        <div class="form-row">
          <div class="form-group">
            <label>Nomor Telepon / WhatsApp</label>
            <input
              v-model="form.phone"
              type="text"
              required
              placeholder="Contoh: 081234567890"
            />
          </div>
          <div class="form-group">
            <label>Email Barbershop</label>
            <input
              v-model="form.email"
              type="email"
              required
              placeholder="admin@barberly.com"
            />
          </div>
        </div>

        <!-- Jam Buka & Jam Tutup -->
        <div class="form-row">
          <div class="form-group">
            <label>Jam Buka</label>
            <input
              v-model="form.open_at"
              type="time"
              required
            />
          </div>
          <div class="form-group">
            <label>Jam Tutup</label>
            <input
              v-model="form.close_at"
              type="time"
              required
            />
          </div>
        </div>

        <!-- Notifikasi Status -->
        <div v-if="message.text" :class="['alert', message.isError ? 'alert-error' : 'alert-success']">
          {{ message.text }}
        </div>

        <!-- Tombol Simpan -->
        <div class="form-actions">
          <button type="submit" :disabled="loading" class="btn-submit">
            <span>💾</span>
            {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const form = ref({
  name: '',
  address: '',
  phone: '',
  email: '',
  open_at: '09:00',
  close_at: '21:00'
})

const loading = ref(false)
const message = ref({ text: '', isError: false })

const fetchSettings = async () => {
  try {
    const response = await api.get('/admin/settings')
    const data = response.data.data || response.data
    if (data) {
      form.value = {
        name: data.name || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        open_at: data.open_at || '09:00',
        close_at: data.close_at || '21:00'
      }
    }
  } catch (error) {
    console.error('Gagal mengambil data pengaturan:', error)
  }
}

const saveSettings = async () => {
  loading.value = true
  message.value = { text: '', isError: false }

  try {
    await api.put('/admin/settings', form.value)
    message.value = { text: 'Pengaturan berhasil diperbarui!', isError: false }
  } catch (error) {
    console.error('Gagal menyimpan pengaturan:', error)
    message.value = { text: 'Gagal menyimpan perubahan. Pastikan backend aktif.', isError: true }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.settings-container {
  padding: 24px;
  max-width: 900px;
}

.header-section {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.form-row {
  display: flex;
  gap: 16px;
}

@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
  }
}

.alert {
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
}

.alert-success {
  background-color: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.alert-error {
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.form-actions {
  margin-top: 8px;
}

.btn-submit {
  background-color: #0f172a;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.btn-submit:hover {
  background-color: #1e293b;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>