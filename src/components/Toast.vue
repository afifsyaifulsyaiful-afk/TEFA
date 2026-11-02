<template>
  <transition name="toast-slide">
    <div v-if="show" :class="['custom-toast', type]">
      <span class="toast-message">{{ message }}</span>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'

const show = ref(false)
const message = ref('')
const type = ref('success') // 'success' atau 'error'

let timeoutId = null

const triggerToast = (msg, toastType = 'success') => {
  message.value = msg
  type.value = toastType
  show.value = true

  if (timeoutId) clearTimeout(timeoutId)

  timeoutId = setTimeout(() => {
    show.value = false
  }, 3000)
}

// Mengekspos fungsi agar bisa dipanggil dari parent component
defineExpose({ triggerToast })
</script>

<style scoped>
.custom-toast {
  position: fixed;
  top: 25px;
  right: 25px;
  padding: 0.9rem 1.4rem;
  border-radius: 10px;
  color: #fff;
  font-weight: 600;
  font-size: 0.92rem;
  z-index: 9999;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.custom-toast.success {
  background-color: #10b981; /* Hijau elegan */
  border: 1px solid #059669;
}

.custom-toast.error {
  background-color: #ef4444; /* Merah */
  border: 1px solid #dc2626;
}

/* Animasi Slide Masuk & Keluar */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>