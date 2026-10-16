<template>
  <div class="register-container">
    <div class="register-card">
      <h2>Daftar Akun Baru</h2>
      <p class="subtitle">Buat akun untuk mulai booking layanan kami</p>

      <form @submit.prevent="handleRegister">
        <!-- Nama Lengkap -->
        <div class="form-group">
          <label>Nama Lengkap</label>
          <input 
            type="text" 
            v-model="form.name" 
            placeholder="Masukkan nama lengkap" 
            required 
          />
        </div>

        <!-- Input Email Prefiks dengan Suffix @barberly.com Terkunci -->
        <div class="form-group">
          <label>Email</label>
          <div class="email-input-wrapper">
            <input 
              type="text" 
              v-model="emailPrefix" 
              placeholder="nama.user" 
              required 
            />
            <span class="email-domain">@barberly.com</span>
          </div>
          <span v-if="emailError" class="error-text">{{ emailError }}</span>
        </div>

        <!-- No Telepon -->
        <div class="form-group">
          <label>No. Telepon / WhatsApp</label>
          <input 
            type="tel" 
            v-model="form.phone" 
            placeholder="08xx xxxx xxxx" 
            required 
          />
        </div>

        <!-- Password dengan Ikon Mata SVG (Show/Hide) -->
        <div class="form-group">
          <label>Password</label>
          <div class="password-wrapper">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="form.password" 
              placeholder="Minimal 6 karakter" 
              minlength="6"
              required 
            />
            <button 
              type="button" 
              class="eye-btn" 
              @click="showPassword = !showPassword"
              tabindex="-1"
            >
              <!-- Ikon Mata Terbuka -->
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>

              <!-- Ikon Mata Dicoret / Tertutup -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Pesan Error Umum -->
        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Memproses...' : 'Daftar' }}
        </button>
      </form>

      <p class="login-link">
        Sudah punya akun? <router-link to="/login">Masuk</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const form = ref({
  name: '',
  phone: '',
  password: ''
})

// Menyimpan nama email depan yang diisi user
const emailPrefix = ref('')

const showPassword = ref(false)
const loading = ref(false)
const emailError = ref('')
const errorMessage = ref('')

const handleRegister = async () => {
  emailError.value = ''
  errorMessage.value = ''

  // Bersihkan input depan dari karakter spasi / simbol tidak valid jika ada
  const cleanPrefix = emailPrefix.value.trim().toLowerCase()

  if (!cleanPrefix) {
    emailError.value = 'Silakan isi nama akun email kamu'
    return
  }

  // Gabungkan prefix dengan domain tetap
  const fullEmail = `${cleanPrefix}@barberly.com`

  loading.value = true

  try {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: form.value.name,
        email: fullEmail,
        phone: form.value.phone,
        password: form.value.password
      })
    })

    const data = await res.json()

    if (res.ok) {
      alert('Registrasi akun Barberly berhasil! Silakan login.')
      router.push('/login')
    } else {
      errorMessage.value = data.error || 'Registrasi gagal, silakan coba lagi.'
    }
  } catch (err) {
    console.error(err)
    errorMessage.value = 'Gagal terhubung ke server backend.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  background: url('@/assets/images/bg-login.png') center/cover no-repeat;
}

.register-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 2.5rem;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

h2 {
  margin: 0;
  text-align: center;
  color: #0f172a;
  font-size: 1.5rem;
  font-weight: 700;
}

.subtitle {
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 0.4rem;
  margin-bottom: 1.8rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.4rem;
}

.form-group input {
  width: 100%;
  padding: 0.65rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  box-sizing: border-box;
  outline: none;
  background: #ffffff;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #2563eb;
}

/* Custom Email Input dengan Suffix Terkunci */
.email-input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
  transition: border-color 0.2s;
}

.email-input-wrapper:focus-within {
  border-color: #2563eb;
}

.email-input-wrapper input {
  border: none;
  border-radius: 0;
  flex: 1;
}

.email-domain {
  background: #f1f5f9;
  color: #475569;
  padding: 0.65rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-left: 1px solid #cbd5e1;
  user-select: none;
  white-space: nowrap;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  padding-right: 2.5rem;
}

.eye-btn {
  position: absolute;
  right: 0.6rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-submit {
  width: 100%;
  padding: 0.75rem;
  background-color: #0000ff;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background-color 0.2s;
}

.btn-submit:hover {
  background-color: #0000cc;
}

.btn-submit:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 1.5rem;
}

.login-link a {
  color: #0f172a;
  font-weight: 600;
  text-decoration: none;
}

.error-text {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}

.error-banner {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  margin-bottom: 1rem;
  text-align: center;
}
</style>