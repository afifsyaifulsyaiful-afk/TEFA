<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Selamat datang</h2>
      <p class="subtitle">
        {{ step === 1 ? 'Silahkan masuk untuk melanjutkan' : (isPhoneLogin ? 'Masukkan kode OTP yang dikirim ke WhatsApp' : 'Masukkan password akun Anda') }}
      </p>

      <form @submit.prevent="handleNextOrLogin">
        
        <!-- TAHAP 1: INPUT IDENTITAS (EMAIL / NO. TELEPON) -->
        <div v-if="step === 1" class="form-group">
          <label>Email atau No. Telepon</label>
          <input 
            type="text" 
            v-model="loginIdentifier" 
            placeholder="Cth: admin@barbershop.com atau 08123456789"
            :class="{ 'input-error': loginError }"
          />
          <span class="info-hint">Tips: Ketik angka (no. telp) untuk simulasi OTP, atau huruf (email) untuk password</span>
          <span v-if="loginError" class="error-message">{{ loginError }}</span>
        </div>

        <!-- TAHAP 2A: JIKA MASUK DENGAN NOMOR TELEPON (INPUT OTP + TOMBOL WA) -->
        <div v-if="step === 2 && isPhoneLogin" class="form-group">
          <label>Kode OTP</label>
          <input 
            type="text" 
            v-model="otpCode" 
            placeholder="Masukkan 4 digit OTP"
            maxlength="6"
            :class="{ 'input-error': passwordError }"
          />
          <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
          
          <!-- Tombol Kirim Ulang / Minta OTP via WhatsApp -->
          <div class="wa-action-container">
            <button type="button" class="btn-whatsapp" @click="handleResendOTP">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              Kirim Ulang OTP via WhatsApp
            </button>
          </div>
        </div>

        <!-- TAHAP 2B: JIKA MASUK DENGAN EMAIL (INPUT PASSWORD) -->
        <div v-if="step === 2 && !isPhoneLogin" class="form-group">
          <label>Password</label>
          <div class="password-wrapper">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="password" 
              placeholder="Masukkan password anda"
              :class="{ 'input-error': passwordError }"
            />
            <button type="button" class="eye-btn" @click="showPassword = !showPassword">
              <!-- Mata Terbuka -->
              <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <!-- Mata Tertutup -->
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
          </div>
          <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
        </div>

        <!-- Tombol Kembali / Ubah Identitas di Tahap 2 -->
        <div v-if="step === 2" class="action-row">
          <button type="button" class="text-btn" @click="step = 1">← Ubah email / no. telp</button>
          <router-link v-if="!isPhoneLogin" to="/forgot-password" class="forgot-link">Lupa Password?</router-link>
        </div>

        <button type="submit" class="btn-submit" :disabled="isLoading">
          {{ isLoading ? 'Memproses...' : (step === 1 ? 'Lanjutkan' : 'Masuk') }}
        </button>
      </form>

      <p class="footer-note">Masuk dengan akun Barbershop anda</p>
      <p class="register-link">
        Belum punya akun? <router-link to="/register"><strong>Buat Akun</strong></router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const step = ref(1) // 1: Input Identitas, 2: Input OTP atau Password
const loginIdentifier = ref('')
const password = ref('')
const otpCode = ref('')
const isPhoneLogin = ref(false)
const showPassword = ref(false)

const loginError = ref('')
const passwordError = ref('')
const isLoading = ref(false)

// URL Backend Go (Sesuaikan jika port partner Anda berbeda)
const API_BASE_URL = 'http://192.168.69.139:8080/api'

const handleNextOrLogin = async () => {
  loginError.value = '' 
  passwordError.value = ''

  if (step.value === 1) {
    if (!loginIdentifier.value) {
      loginError.value = 'Email atau nomor telepon tidak boleh kosong'
      return
    }

    const cleanInput = loginIdentifier.value.trim()
    const isNumber = /^[0-9+]+$/.test(cleanInput)
    isPhoneLogin.value = isNumber

    // Jika login via telepon, otomatis panggil API kirim OTP ke backend partner
    if (isNumber) {
      isLoading.value = true
      try {
        const response = await fetch(`${API_BASE_URL}/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanInput })
        })
        const result = await response.json()
        
        if (!response.ok) {
          loginError.value = result.error || 'Gagal mengirim OTP'
          return
        }
        // Jika sukses kirim OTP, lanjut ke step 2
        step.value = 2
      } catch (err) {
        loginError.value = 'Tidak dapat terhubung ke server backend'
      } finally {
        isLoading.value = false
      }
    } else {
      // Jika email, langsung lanjut ke step 2 (input password)
      step.value = 2
    }

  } else {
    // TAHAP 2: EKSEKUSI LOGIN (OTP atau Password)
    if (isPhoneLogin.value && !otpCode.value) {
      passwordError.value = 'Kode OTP tidak boleh kosong'
      return
    }
    if (!isPhoneLogin.value && !password.value) {
      passwordError.value = 'Password tidak boleh kosong'
      return
    }

    isLoading.value = true

    try {
      let endpoint = ''
      let payload = {}

      if (isPhoneLogin.value) {
        // Endpoint Verifikasi OTP dari Go backend
        endpoint = `${API_BASE_URL}/verify-otp`
        payload = {
          phone: loginIdentifier.value.trim(),
          otp: otpCode.value.trim()
        }
      } else {
        // Endpoint Login Email dari Go backend
        endpoint = `${API_BASE_URL}/login`
        payload = {
          email: loginIdentifier.value.trim(),
          password: password.value
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (response.ok) {
        // Simpan token JWT dan data user ke localStorage sesuai respons Go backend
        localStorage.setItem('token', result.token)
        localStorage.setItem('adminName', result.data.Name)
        localStorage.setItem('adminRole', result.data.Role)

        // Redirect ke dashboard admin Barberly
        router.push('/admin/dashboard')
      } else {
        passwordError.value = result.error || 'Autentikasi gagal'
      }
    } catch (err) {
      passwordError.value = 'Terjadi kesalahan koneksi ke server'
    } finally {
      isLoading.value = false
    }
  }
}

// Fungsi tombol Kirim Ulang OTP via WhatsApp
const handleResendOTP = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: loginIdentifier.value.trim() })
    })
    const result = await response.json()
    if (response.ok) {
      alert('Kode OTP baru berhasil dikirim ulang!')
    } else {
      alert(result.error || 'Gagal mengirim ulang OTP')
    }
  } catch (err) {
    alert('Gagal terhubung ke server')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: url('@/assets/images/bg-login.png') no-repeat center center / cover;
  padding: 1rem;
}

.login-card {
  background: #ffffff;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  text-align: center;
}

h2 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: #111827;
}

.subtitle {
  color: #4b5563;
  font-size: 0.95rem;
  margin-top: 0.35rem;
  margin-bottom: 1.75rem;
}

.form-group {
  text-align: left;
  margin-bottom: 1.1rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.35rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 0.85rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  outline: none;
  box-sizing: border-box;
}

.info-hint {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.3rem;
}

.wa-action-container {
  margin-top: 0.5rem;
  text-align: right;
}

.btn-whatsapp {
  background: none;
  border: none;
  color: #16a34a;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0;
}

.btn-whatsapp:hover {
  text-decoration: underline;
}

input::-ms-reveal,
input::-ms-clear,
input::-webkit-contacts-auto-fill-button,
input::-webkit-credentials-auto-fill-button {
  display: none !important;
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
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.form-group input.input-error {
  border-color: #ef4444;
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.3rem;
  font-weight: 500;
}

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  font-size: 0.78rem;
}

.text-btn {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  padding: 0;
}

.text-btn:hover {
  text-decoration: underline;
}

.forgot-link {
  color: #4b5563;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
  color: #2563eb;
}

.btn-submit {
  width: 100%;
  padding: 0.8rem;
  background-color: #0000ff;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
}

.btn-submit:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.footer-note {
  color: #6b7280;
  font-size: 0.8rem;
  margin-top: 1.5rem;
  margin-bottom: 0.4rem;
}

.register-link {
  font-size: 0.8rem;
  color: #4b5563;
}

.register-link a {
  color: #111827;
  text-decoration: none;
}
</style>