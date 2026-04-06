<script setup>
// App raiz: aqui fica o menu e o router-view
import { computed } from 'vue'
import { useAuthStore } from './stores/authStore'

const authStore = useAuthStore()
const userEmail = computed(() => authStore.user?.email || 'Deslogado')
</script>

<template>
  <div class="layout">

    <!-- NAVBAR -->
    <header class="navbar">
      <div class="nav-container">

        <!-- LOGO -->
        <div class="logo">
          🎬 CineApp
        </div>

        <!-- LINKS -->
        <nav class="links">
          <router-link to="/">Em Cartaz</router-link>
          <router-link to="/EmBreveView">Em Breve</router-link>
          <router-link to="/CadastraFilme">Cadastrar</router-link>
          <router-link to="/profile">Perfil</router-link>
        </nav>

        <!-- USUÁRIO + AÇÃO -->
        <div class="user-area">
          <span class="user">
            👤 {{ userEmail }}
          </span>

          <button
            v-if="authStore.user"
            class="logout"
            @click="authStore.logout()"
          >
            Sair
          </button>

          <router-link v-else to="/login" class="login-btn">
            Login
          </router-link>
        </div>

      </div>
    </header>

    <!-- CONTEÚDO -->
    <main class="content">
      <router-view />
    </main>

  </div>
</template>
