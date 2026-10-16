<template>
  <div class="reset-container">
    <div class="reset-card">
      <div class="brand-title">BARBERLY</div>
      <h2>Buat Password Baru</h2>
      <p class="subtitle">
        Masukkan password baru untuk akun <br />
        <strong>{{ email }}</strong>
      </p>

      <form @submit.prevent="handleResetPassword">
        <!-- Input Password Baru (Dengan Ikon Mata) -->
        <div class="input-group">
          <label>Password Baru</label>
          <div class="password-wrapper">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="newPassword" 
              placeholder="Minimal 6 karakter" 
              required 
              :disabled="isLoading"
            />
            <button 
              type="button" 
              class="eye-btn" 
              @click="showPassword = !showPassword"
              tabindex="-1"
            >
              <!-- Ikon Mata Terbuka -->
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <!-- Ikon Mata Tertutup -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Input Konfirmasi Password (Tanpa Ikon Mata) -->
        <div class="input-group">
          <label>Konfirmasi Password</label>
          <input 
            type="password" 
            v-model="confirmPassword" 
            placeholder="Ulangi password baru" 
            required 
            :disabled="isLoading"
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Memproses...' : 'Simpan Password Baru' }}
        </button>
      </form>

      <div class="back-to-login">
        <router-link to="/login">← Batal & Kembali ke Halaman Masuk</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const email = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const isLoading = ref(false)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

onMounted(() => {
  email.value = route.query.email || ''
  if (!email.value) {
    alert('Email tidak ditemukan, silakan ulangi proses lupa password.')
    router.push('/forgot-password')
  }
})

const handleResetPassword = async () => {
  if (newPassword.value.length < 6) {
    alert('Password minimal terdiri dari 6 karakter.')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    alert('Konfirmasi password tidak cocok dengan password baru.')
    return
  }

  isLoading.value = true

  try {
    const res = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        new_password: newPassword.value
      })
    })

    const data = await res.json()

    if (res.ok) {
      alert('Password berhasil diperbarui! Silakan login dengan password baru Anda.')
      router.push('/login')
    } else {
      alert(data.error || 'Gagal memperbarui password.')
    }
  } catch (err) {
    console.error(err)
    alert('Gagal terhubung ke server. Pastikan backend Go sedang berjalan.')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.reset-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('@/assets/images/bg-login.png') no-repeat center center;
  background-size: cover;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1e293b;
  box-sizing: border-box;
  overflow-y: auto;
  padding: 1rem;
}

.reset-card {
  background: #ffffff;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 420px;
  box-sizing: border-box;
  text-align: center;
  z-index: 10;
}

.brand-title {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 2px;
  color: #031b33;
  margin-bottom: 1rem;
}

.reset-card h2 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.subtitle {
  color: #64748b;
  font-size: 0.85rem;
  margin-bottom: 1.75rem;
  line-height: 1.4;
}

.subtitle strong {
  color: #1e293b;
}

.input-group {
  text-align: left;
  margin-bottom: 1.25rem;
}

.input-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #334155;
}

.input-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

.input-group input:focus {
  border-color: #2563eb;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  width: 100%;
  padding: 0.75rem 2.75rem 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

.password-wrapper input:focus {
  border-color: #2563eb;
}

.eye-btn {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.eye-btn:hover {
  color: #1e293b;
}

.submit-btn {
  width: 100%;
  background-color: #0000ff;
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 0.5rem;
}

.submit-btn:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0000cc;
}

.back-to-login {
  margin-top: 1.5rem;
  font-size: 0.85rem;
}

.back-to-login a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.back-to-login a:hover {
  text-decoration: underline;
}
</style>