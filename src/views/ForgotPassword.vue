<template>
  <div class="forgot-container">
    <div class="forgot-card">
      <div class="brand-title">BARBERLY</div>
      <h2>Lupa Password?</h2>
      <p class="subtitle">Masukkan email Anda untuk instruksi pemulihan password</p>

      <form @submit.prevent="handleResetPassword">
        <div class="input-group">
          <label>Email</label>
          <input 
            type="email" 
            v-model="email" 
            placeholder="Masukkan email terdaftar" 
            required 
          />
        </div>

        <button type="submit" class="submit-btn">Kirim Instruksi</button>
      </form>

      <div class="back-to-login">
        <router-link to="/login">← Kembali ke Halaman Masuk</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const router = useRouter()

const handleResetPassword = () => {
  alert(`Instruksi pemulihan telah dikirim ke email: ${email.value}`)
  router.push('/login')
}
</script>

<style scoped>
/* Pastikan body/html reset tidak ada margin bawaan di App.vue, 
   namun kita set juga width dan height absolut di sini */
.forgot-container {
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

.forgot-card {
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

.forgot-card h2 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.subtitle {
  color: #64748b;
  font-size: 0.85rem;
  margin-bottom: 2rem;
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

.submit-btn:hover {
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