<script setup>
import { ref } from 'vue'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const props = defineProps({
  item: Object
})

const aberto = ref(false)

const toggle = () => {
  aberto.value = !aberto.value
}

const excluir = async () => {
  try {
    await deleteDoc(doc(db, 'financas', props.item.id))
  } catch (e) {
    console.error('Erro ao excluir:', e)
  }
}
</script>

<template>
  <div class="card" @click="toggle">

  <!-- IMAGEM -->
  <img v-if="item.imagem" :src="item.imagem" class="capa" />

  <!-- TÍTULO (overlay) -->
  <div class="titulo-overlay">
    <h3>{{ item.titulo }}</h3>
  </div>

  <!-- DETALHES -->
  <transition name="fade">
    <div v-if="aberto" class="detalhes" @click.stop>

      <p>🎭 {{ item.genero }}</p>
      <p>📅 {{ item.dataEstreia }}</p>
      <p>💰 R$ {{ item.valor }}</p>

      <button class="danger" @click="excluir">
        🗑 Excluir
      </button>

    </div>
  </transition>

</div>
</template>

<style scoped>
.card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: 0.3s;
  background: #000;
}

.card:hover {
  transform: scale(1.04);
}

/* IMAGEM */
.capa {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

/* OVERLAY DO TÍTULO */
.titulo-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 10px;
  background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
}

.titulo-overlay h3 {
  color: white;
  margin: 0;
  font-size: 16px;
}

/* DETALHES (abre por cima do card) */
.detalhes {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.95);
  color: white;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

/* BOTÃO */
button.danger {
  margin-top: 10px;
  background: #e50914;
  border: none;
  padding: 10px;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}

/* ANIMAÇÃO */
.fade-enter-active,
.fade-leave-active {
  transition: 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>