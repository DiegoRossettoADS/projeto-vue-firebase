<script setup>
/**
 * PerfilView.vue — Tela de Perfil do Usuário
 *
 * Propósito:
 *  - Exibir o email do usuário autenticado
 *  - Permitir logout
 *
 * Conceitos:
 *  - onMounted(): executar código ao carregar o componente
 *  - ref(): estado reativo
 *  - Firebase Auth: currentUser e signOut
 *  - Navegação com useRouter
 */

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'

// Router para redirecionamento
const router = useRouter()

// Estado do usuário
const email = ref('')

// Ao carregar o componente, pegamos o usuário atual
onMounted(() => {
  const user = auth.currentUser

  if (user) {
    email.value = user.email
  } else {
    // Se não estiver logado, manda para login
    router.push('/login')
  }
})

// Função de logout
const sair = async () => {
  try {
    await signOut(auth)
    router.push('/login')
  } catch (e) {
    console.error('Erro ao sair:', e)
  }
}
</script>

<template>
  <section class="card">
    <h1><i class="fa-solid fa-user"></i> Perfil</h1>

    <p class="muted">Usuário autenticado:</p>

    <p class="email">
      <i class="fa-solid fa-envelope"></i>
      {{ email }}
    </p>

    <div class="actions">
      <button class="secondary" @click="sair">
        <i class="fa-solid fa-right-from-bracket"></i> Sair 
      </button>
    </div>
  </section>
</template>