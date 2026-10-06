import { createRouter, createWebHistory } from 'vue-router'

// LAYOUTS
import AdminLayout from '@/layouts/AdminLayout.vue'

// VIEWS - PUBLIC / USER
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import ProfilSaya from '@/views/ProfilSaya.vue'
import PublicLayanan from '@/views/Layanan.vue' 
import Kategori from '@/views/Kategori.vue'
import TentangKami from '@/views/TentangKami.vue'

// VIEWS - ADMIN (Menggunakan MasterData terpusat untuk menggantikan file lama yang dihapus)
import Dashboard from '@/views/admin/Dashboard.vue'
import MasterData from '@/views/admin/MasterData.vue' 
import Booking from '@/views/admin/Booking.vue'
import Laporan from '@/views/admin/Laporan.vue'
import Settings from '@/views/admin/Settings.vue'

const routes = [
  // --- PUBLIC ROUTES ---
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword
  },
  {
    path: '/profil',
    name: 'ProfilSaya',
    component: ProfilSaya
  },
  {
    path: '/layanan',
    name: 'Layanan',
    component: PublicLayanan
  },
  {
    path: '/tentang',
    name: 'TentangKami',
    component: TentangKami
  },

  // --- ADMIN NESTED ROUTES ---
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: Dashboard
      },
      // Rute Utama Data Master yang baru digabungkan di sidebar
      {
        path: 'master',
        name: 'AdminMaster',
        component: MasterData
      },
      // Rute lama (opsional jika masih diakses, diarahkan ke MasterData juga)
      {
        path: 'barber',
        name: 'AdminBarber',
        component: MasterData 
      },
      {
        path: 'services',
        name: 'AdminLayanan',
        component: MasterData 
      },
      {
        path: 'categories',
        name: 'AdminKategori',
        component: Kategori
      },
      {
        path: 'schedule',
        name: 'AdminJadwalBarber',
        component: MasterData 
      },
      {
        path: 'customers',
        name: 'AdminPelanggan',
        component: MasterData 
      },
      {
        path: 'booking',
        name: 'AdminBooking',
        component: Booking
      },
      {
        path: 'reports',
        name: 'AdminLaporan',
        component: Laporan
      },
      // Rute reviews diarahkan langsung ke halaman Laporan gabungan
      {
        path: 'reviews',
        name: 'AdminReviews',
        component: Laporan
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: Settings
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router