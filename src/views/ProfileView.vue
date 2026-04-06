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

<style scoped>
/* FUNDO */
section {
  min-height: 100%;
  display: flex;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0f0f, #1c1c1c);
}

/* CARD PERFIL */
.card {
  width: 100%;
  max-width: 420px;
  padding: 30px;
  border-radius: 16px;

  /* glass effect */
  background: rgba(20, 20, 20, 0.75);
  backdrop-filter: blur(12px);

  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);

  display: flex;
  flex-direction: column;
  gap: 15px;
  text-align: center;
}

/* TÍTULO */
.card h1 {
  color: #fff;
  margin: 0;
  font-size: 24px;
}

/* TEXTO SECUNDÁRIO */
.muted {
  color: #aaa;
  font-size: 14px;
}

/* EMAIL */
.email {
  background: #2a2a2a;
  padding: 12px;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  word-break: break-all;
}

/* AÇÕES */
.actions {
  margin-top: 10px;
}

/* BOTÃO SECUNDÁRIO */
button.secondary {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;

  background: linear-gradient(135deg, #e50914, #ff2a2a);
  color: white;
  font-weight: bold;

  cursor: pointer;
  transition: 0.3s;
}

button.secondary:hover {
  transform: scale(1.05);
}

/* RESPONSIVO */
@media (max-width: 768px) {
  .card {
    margin: 0 15px;
  }
}
</style>