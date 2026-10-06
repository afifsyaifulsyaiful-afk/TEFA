<template>
  <div class="register-container">
    <div class="register-card">
      <h2>Daftar Akun Baru</h2>
      <p class="subtitle">Buat akun untuk mulai booking layanan kami</p>

      <form @submit.prevent="handleRegister">
        <!-- NAMA LENGKAP -->
        <div class="form-group">
          <label>Nama Lengkap</label>
          <input 
            type="text" 
            v-model="name" 
            placeholder="Masukkan nama lengkap"
            :class="{ 'input-error': nameError }"
          />
          <span v-if="nameError" class="error-message">{{ nameError }}</span>
        </div>

        <!-- EMAIL -->
        <div class="form-group">
          <label>Email</label>
          <input 
            type="email" 
            v-model="email" 
            placeholder="contoh@email.com"
            :class="{ 'input-error': emailError }"
          />
          <span v-if="emailError" class="error-message">{{ emailError }}</span>
        </div>

        <!-- NO TELEPON -->
        <div class="form-group">
          <label>No. Telepon / WhatsApp</label>
          <input 
            type="text" 
            v-model="phone" 
            placeholder="08xx-xxxx-xxxx"
            :class="{ 'input-error': phoneError }"
          />
          <span v-if="phoneError" class="error-message">{{ phoneError }}</span>
        </div>

        <!-- PASSWORD -->
        <div class="form-group">
          <label>Password</label>
          <input 
            type="password" 
            v-model="password" 
            placeholder="Minimal 6 karakter"
            :class="{ 'input-error': passwordError }"
          />
          <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
        </div>

        <button type="submit" class="btn-submit" :disabled="isLoading">
          {{ isLoading ? 'Mendaftarkan...' : 'Daftar' }}
        </button>
      </form>

      <p class="login-link">
        Sudah punya akun? <router-link to="/login"><strong>Masuk</strong></router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')

const nameError = ref('')
const emailError = ref('')
const phoneError = ref('')
const passwordError = ref('')
const isLoading = ref(false)

const handleRegister = async () => {
  console.log("Tombol Daftar diklik!") // Cek apakah fungsi terpanggil

  // Reset pesan error
  nameError.value = ''
  emailError.value = ''
  phoneError.value = ''
  passwordError.value = ''

  let isValid = true

  if (!name.value) {
    nameError.value = 'Nama lengkap tidak boleh kosong'
    isValid = false
  }
  if (!email.value) {
    emailError.value = 'Email tidak boleh kosong'
    isValid = false
  }
  if (!phone.value) {
    phoneError.value = 'Nomor telepon tidak boleh kosong'
    isValid = false
  }
  if (!password.value || password.value.length < 6) {
    passwordError.value = 'Password minimal harus 6 karakter'
    isValid = false
  }

  console.log("Status validasi form:", isValid) // Cek apakah lolos validasi
  if (!isValid) return

  isLoading.value = true

  try {
    console.log("Mengirim request ke backend...")
    const response = await axios.post('http://localhost:8080/api/register', {
      name: name.value,
      email: email.value,
      phone: phone.value,
      password: password.value
    })
    console.log("Respons dari backend:", response.data)

    alert('Registrasi berhasil! Silakan masuk dengan akun Anda.')
    router.push('/login')
  } catch (error) {
    console.log("Error tertangkap:", error)
    const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.'
    emailError.value = errorMsg
  } finally {
    isLoading.value = false
  }
}

</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: url('@/assets/images/bg-login.png') no-repeat center center / cover;
  padding: 1rem;
}

.register-card {
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
  margin-bottom: 1.5rem;
}

.form-group {
  text-align: left;
  margin-bottom: 1rem;
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
  padding: 0.7rem 0.85rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  outline: none;
  box-sizing: border-box;
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
  margin-top: 0.5rem;
}

.btn-submit:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.login-link {
  font-size: 0.8rem;
  color: #4b5563;
  margin-top: 1.5rem;
}

.login-link a {
  color: #111827;
  text-decoration: none;
}
</style>