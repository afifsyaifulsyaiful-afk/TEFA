<template>
  <div class="admin-container">
    <!-- SIDEBAR KIRI -->
    <aside class="sidebar" :class="{ 'sidebar-hidden': !isSidebarOpen }">
      <div class="brand">
        <h3>BARBERLY</h3>
        <p>ADMIN PANEL</p>
      </div>

      <div class="user-profile">
        <div class="avatar">👤</div>
        <div class="user-info">
          <strong>Admin Barbershop</strong>
          <small>Administrator</small>
          <span class="status-online">● Online</span>
        </div>
      </div>

      <!-- MENU SIDEBAR (Sudah Digabung Menjadi Data Master) -->
      <nav class="sidebar-menu">
        <router-link to="/admin/dashboard" class="menu-item" active-class="active">📊 Dashboard</router-link>
        <router-link to="/admin/booking" class="menu-item" active-class="active">📋 Kelola Booking</router-link>
        <router-link to="/admin/master" class="menu-item" active-class="active">📁 Data Master</router-link>
        <router-link to="/admin/reports" class="menu-item" active-class="active">📈 Laporan Keuangan</router-link>
        <router-link to="/admin/settings" class="menu-item" active-class="active">⚙️ Pengaturan</router-link>
      </nav>

      <div class="sidebar-footer">
        <a href="#" @click.prevent="handleLogout" class="menu-item logout">🚪 Logout</a>
      </div>
    </aside>

    <!-- KONTEN UTAMA (KANAN) -->
    <main class="main-content">
      <!-- HEADER ATAS -->
      <header class="top-header">
        <button class="hamburger-btn" @click="toggleSidebar">☰</button>
        
        <div class="header-right">
          <span class="date-badge">📅 Jumat, 25 Sep 2026</span>
          
          <!-- DROPDOWN NOTIFIKASI -->
          <div class="dropdown-wrapper">
            <button class="icon-btn" @click="toggleNotification">🔔</button>
            <div v-if="showNotification" class="dropdown-card notification-dropdown">
              <div class="dropdown-title">Notifikasi</div>
              <div class="dropdown-item-text">Ada booking baru masuk dari Andi</div>
              <div class="dropdown-item-text">Pembayaran layanan selesai</div>
            </div>
          </div>

          <!-- DROPDOWN ADMIN / PROFIL -->
          <div class="dropdown-wrapper">
            <div class="admin-dropdown" @click="toggleProfileMenu">
              <span>👤 Admin</span>
              <span class="arrow">▾</span>
            </div>
            <div v-if="showProfileMenu" class="dropdown-card profile-dropdown">
              <router-link to="/admin/settings" class="dropdown-link" @click="showProfileMenu = false">⚙️ Pengaturan</router-link>
              <div class="dropdown-link text-danger" @click="handleLogout">🚪 Logout</div>
            </div>
          </div>
        </div>
      </header>

      <!-- TEMPAT HALAMAN BERGANTI -->
      <section class="dashboard-body">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// State untuk interaksi tombol atas
const isSidebarOpen = ref(true)
const showNotification = ref(false)
const showProfileMenu = ref(false)

// Fungsi Toggle Sidebar
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Fungsi Toggle Notifikasi
const toggleNotification = () => {
  showNotification.value = !showNotification.value
  showProfileMenu.value = false // Tutup menu lain
}

// Fungsi Toggle Profil Admin
const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
  showNotification.value = false // Tutup menu lain
}

// Fungsi Logout
const handleLogout = () => {
  router.push('/login')
}
</script>

<style scoped>
.admin-container {
  display: flex;
  width: 100vw;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1e293b;
  box-sizing: border-box;
}

.sidebar {
  width: 250px;
  min-width: 250px;
  height: 100vh;
  position: sticky;
  top: 0;
  background-color: #031b33;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 1.2rem 1rem;
  box-sizing: border-box;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* Kelas untuk menyembunyikan sidebar */
.sidebar-hidden {
  margin-left: -250px;
}

.brand {
  text-align: left;
  padding: 0.5rem 0.5rem 1rem 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 1rem;
}

.brand h3 { 
  margin: 0; 
  font-size: 1.25rem; 
  font-weight: 800; 
  letter-spacing: 1.5px; 
  color: #ffffff;
}

.brand p { 
  margin: 0.2rem 0 0; 
  font-size: 0.6rem; 
  letter-spacing: 2px; 
  color: #38bdf8; 
  font-weight: 600;
  text-transform: uppercase;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem;
  margin-bottom: 1rem;
}

.avatar {
  width: 36px;
  height: 36px;
  background: #334155;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info { display: flex; flex-direction: column; font-size: 0.8rem; }
.status-online { color: #22c55e; font-size: 0.7rem; }

.sidebar-menu { 
  display: flex; 
  flex-direction: column; 
  gap: 0.25rem; 
  flex: 1; 
}

.menu-item {
  color: #94a3b8;
  text-decoration: none;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  display: block;
}

.menu-item:hover, .menu-item.active { 
  background-color: rgba(255, 255, 255, 0.1); 
  color: #fff; 
}

.sidebar-footer { 
  border-top: 1px solid rgba(255, 255, 255, 0.08); 
  padding-top: 0.6rem; 
  margin-top: auto;
}

.logout { color: #f87171; }
.logout:hover { background-color: rgba(239, 68, 68, 0.15); color: #fca5a5; }

.main-content { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  min-width: 0; 
  min-height: 100vh;
}

.top-header {
  background: #fff;
  padding: 0.8rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}

.hamburger-btn { 
  background: none; 
  border: 1px solid #cbd5e1; 
  border-radius: 6px; 
  padding: 0.4rem 0.7rem; 
  cursor: pointer; 
  font-size: 1rem;
}
.hamburger-btn:hover {
  background: #f1f5f9;
}

.header-right { 
  display: flex; 
  align-items: center; 
  gap: 1rem; 
  font-size: 0.85rem; 
}

.date-badge { 
  background: #f1f5f9; 
  padding: 0.35rem 0.75rem; 
  border-radius: 6px; 
  color: #475569;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 6px;
}
.icon-btn:hover {
  background: #f1f5f9;
}

/* Styling Dropdown */
.dropdown-wrapper {
  position: relative;
}

.admin-dropdown {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #f1f5f9;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  color: #334155;
}
.admin-dropdown:hover {
  background: #e2e8f0;
}

.dropdown-card {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  width: 200px;
  z-index: 100;
  overflow: hidden;
}

.notification-dropdown {
  width: 240px;
  padding: 0.5rem 0;
}

.dropdown-title {
  padding: 0.4rem 0.8rem;
  font-weight: 700;
  font-size: 0.75rem;
  color: #94a3b8;
  border-bottom: 1px solid #f1f5f9;
  text-transform: uppercase;
}

.dropdown-item-text {
  padding: 0.6rem 0.8rem;
  font-size: 0.8rem;
  color: #475569;
  border-bottom: 1px solid #f8fafc;
}

.dropdown-link {
  display: block;
  padding: 0.6rem 0.8rem;
  color: #334155;
  text-decoration: none;
  font-size: 0.85rem;
}
.dropdown-link:hover {
  background: #f8fafc;
  color: #2563eb;
}

.text-danger {
  color: #dc2626 !important;
  cursor: pointer;
}
.text-danger:hover {
  background: #fef2f2 !important;
}

.dashboard-body { 
  padding: 1.5rem; 
  width: 100%; 
  box-sizing: border-box; 
  flex: 1; 
}
</style>