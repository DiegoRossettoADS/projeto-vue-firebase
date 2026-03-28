<script setup>
// App raiz: aqui fica o menu e o router-view
import { computed } from 'vue'
import { useAuthStore } from './stores/authStore'

const authStore = useAuthStore()
const userEmail = computed(() => authStore.user?.email || 'Deslogado')
</script>

<template>
  <div class="layout">
    <header class="topbar">
      <h2><i class="fa-solid fa-fire"></i> Vue + Firebase</h2>
      <span class="muted">Usuario: {{ userEmail }}</span>
    </header>

    <nav class="menu">
      <router-link to="/"><i class="fa-solid fa-house"></i> Inicio</router-link>
      <router-link to="/login"><i class="fa-solid fa-right-to-bracket"></i> Login</router-link>
      <router-link to="/dashboard"><i class="fa-solid fa-chart-line"></i> Dashboard</router-link>
      <router-link to="/profile"><i class="fa-solid fa-id-card"></i> Perfil</router-link>
      <button v-if="authStore.user" class="linklike" @click="authStore.logout()">
        <i class="fa-solid fa-right-from-bracket"></i> Sair
      </button>
    </nav>

    <router-view></router-view>
  </div>
</template>