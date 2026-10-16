import { createRouter, createWebHistory } from 'vue-router'

// LAYOUTS
import AdminLayout from '@/layouts/AdminLayout.vue'

// VIEWS - PUBLIC / USER
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import ResetPassword from '@/views/ResetPassword.vue'
import ProfilSaya from '@/views/ProfilSaya.vue'
import PublicLayanan from '@/views/Layanan.vue' 
import Kategori from '@/views/Kategori.vue'
import TentangKami from '@/views/TentangKami.vue'
import MyBookings from '@/views/MyBookings.vue'

// VIEWS - ADMIN
import Dashboard from '@/views/admin/Dashboard.vue'
import MasterData from '@/views/admin/MasterData.vue' 
import Booking from '@/views/admin/Booking.vue'
import Laporan from '@/views/admin/Laporan.vue'
import Settings from '@/views/admin/Settings.vue'

const routes = [
  // --- PUBLIC / PELANGGAN ROUTES ---
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
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword
  },
  {
    path: '/profil',
    name: 'ProfilSaya',
    component: ProfilSaya
  },
  {
    path: '/layanan',
    name: 'Layanan',
    component: PublicLayanan // UI Pilihan Layanan & Booking untuk Pelanggan
  },
  {
    path: '/my-bookings',
    name: 'MyBookings',
    component: MyBookings
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
      {
        path: 'master',
        name: 'AdminMaster',
        component: MasterData
      },
      {
        path: 'master-barber',
        name: 'AdminBarber',
        component: MasterData 
      },
      {
        path: 'master-services',
        name: 'AdminLayanan',
        component: MasterData 
      },
      {
        path: 'categories',
        name: 'AdminKategori',
        component: Kategori
      },
      {
        path: 'master-schedule',
        name: 'AdminJadwalBarber',
        component: MasterData 
      },
      {
        path: 'master-customers',
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