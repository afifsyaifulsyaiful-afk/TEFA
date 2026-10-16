<template>
  <div class="settings-admin">
    <div class="card-box">
      <h2 class="title">Pengaturan Toko ⚙️</h2>
      <p class="subtitle">Kelola informasi lokasi, jam operasional, dan kontak resmi yang tampil di halaman utama.</p>

      <form @submit.prevent="saveSettings" class="settings-form">
        <!-- Nama Barber / Toko -->
        <div class="form-group">
          <label>Nama Barbershop</label>
          <input 
            type="text" 
            v-model="form.name" 
            placeholder="Contoh: Barberly Barbershop"
            required 
          />
        </div>

        <!-- Alamat / Lokasi Utama -->
        <div class="form-group">
          <label>Alamat / Lokasi Utama</label>
          <textarea 
            v-model="form.address" 
            rows="3" 
            placeholder="Masukkan alamat lengkap barbershop..."
            required
          ></textarea>
        </div>

        <!-- Jam Buka & Jam Tutup -->
        <div class="form-row">
          <div class="form-group">
            <label>Jam Buka</label>
            <input 
              type="text" 
              v-model="form.open_at" 
              placeholder="Contoh: 09:00" 
              required 
            />
          </div>

          <div class="form-group">
            <label>Jam Tutup</label>
            <input 
              type="text" 
              v-model="form.close_at" 
              placeholder="Contoh: 21:00" 
              required 
            />
          </div>
        </div>

        <!-- Email Admin Aktif (Read Only / Disabled) -->
        <div class="form-group">
          <label>Email Admin (Akun Aktif)</label>
          <input 
            type="email" 
            :value="adminEmail" 
            disabled 
            class="input-disabled" 
          />
        </div>

        <button type="submit" :disabled="isSaving" class="btn-save">
          {{ isSaving ? 'Menyimpan...' : 'Simpan Pengaturan' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const isSaving = ref(false)
const adminEmail = ref('admin@barberly.com')

const FULL_ADDRESS = 'Payolansek, Payakumbuh Barat, Kota Payakumbuh, Sumatra Barat 26219'

const form = ref({
  name: 'Barberly',
  address: FULL_ADDRESS,
  phone: '-',
  email: 'admin@barberly.com',
  open_at: '09:00',
  close_at: '21:00'
})

// Ambil Email Admin yang sedang Login dari LocalStorage
const getActiveAdminEmail = () => {
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser)
      if (user.email) {
        adminEmail.value = user.email
        form.value.email = user.email
      }
    } catch (e) {
      console.error('Gagal parse user:', e)
    }
  }
}

// Ambil Setting dari Backend
const fetchSettings = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/settings`)
    if (res.ok) {
      const result = await res.json()
      let data = result.data || result

      if (Array.isArray(data) && data.length > 0) {
        data = data[0]
      }

      if (data && typeof data === 'object') {
        if (data.name) form.value.name = data.name
        
        // Jika alamat di DB hanya 'payolansek' atau pendek, gunakan alamat lengkap
        if (data.address && data.address.trim().length > 15) {
          form.value.address = data.address
        } else {
          form.value.address = FULL_ADDRESS
        }

        if (data.phone) form.value.phone = data.phone
        if (data.open_at) form.value.open_at = data.open_at
        if (data.close_at) form.value.close_at = data.close_at
      }
    }
  } catch (err) {
    console.error('Gagal fetch settings:', err)
  }
}

// Simpan Pengaturan
const saveSettings = async () => {
  isSaving.value = true
  try {
    const token = localStorage.getItem('token')
    
    const payload = {
      name: form.value.name,
      address: form.value.address,
      phone: form.value.phone || '-',
      email: adminEmail.value,
      open_at: form.value.open_at,
      close_at: form.value.close_at
    }

    const res = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
    
    const result = await res.json().catch(() => ({}))

    if (res.ok) {
      alert('Pengaturan toko berhasil disimpan!')
      fetchSettings()
    } else {
      alert(result.message || result.error || 'Gagal menyimpan pengaturan.')
    }
  } catch (err) {
    console.error('Error:', err)
    alert('Terjadi kesalahan koneksi ke server.')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  getActiveAdminEmail()
  fetchSettings()
})
</script>

<style scoped>
.settings-admin {
  padding: 1rem 0;
  width: 100%;
}

.card-box {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #e2e8f0;
  width: 100%;
}

.title {
  font-size: 1.5rem;
  color: #0f172a;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.subtitle {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1.8rem;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.3rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
}

.form-group input, 
.form-group textarea {
  padding: 0.8rem 1rem;
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
  width: 100%;
}

.form-group input:focus, 
.form-group textarea:focus {
  border-color: #f59e0b;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
}

.input-disabled {
  background-color: #e2e8f0 !important;
  color: #64748b !important;
  cursor: not-allowed;
  border-color: #cbd5e1 !important;
}

.btn-save {
  background-color: #f59e0b;
  color: #000000;
  padding: 0.85rem;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background-color 0.2s ease;
  width: 100%;
}

.btn-save:hover {
  background-color: #d97706;
}

.btn-save:disabled {
  background-color: #cbd5e1;
  color: #64748b;
  cursor: not-allowed;
}
</style>