<script setup>
import { ref } from 'vue'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const props = defineProps({
  item: Object,
  mostrarExcluir: {
    type: Boolean,
    default: false
  }
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

const formatarData = (data) => {
  return new Date(data).toLocaleDateString('pt-BR')
}

const fechar = () => {
  aberto.value = false
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

       <!-- BOTÃO FECHAR -->
      <button class="fechar" @click="fechar">✖</button>

      <p>🎭 {{ item.genero }}</p>
      <p>📅 {{ formatarData(item.dataEstreia) }}</p>
      <p>💰 R$ {{ item.valor }}</p>

      <button v-if="mostrarExcluir" class="danger" @click="excluir">
        🗑 Excluir
      </button>

    </div>
  </transition>

</div>
</template>

<style scoped>
/* CARD BASE */
.card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.35s ease;
  background: #111;
}

/* HOVER MAIS SUAVE */
.card:hover {
  transform: scale(1.05);
}

/* IMAGEM */
.capa {
  width: 100%;
  height: 280px;
  object-fit: cover;
  transition: 0.4s;
}

/* ZOOM NA IMAGEM */
.card:hover .capa {
  transform: scale(1.1);
  filter: brightness(0.7);
}

/* OVERLAY GRADIENTE */
.titulo-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 14px;
  background: linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.2));
  backdrop-filter: blur(4px);
}

/* TÍTULO */
.titulo-overlay h3 {
  color: #fff;
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}

/* DETALHES - ESTILO CARD INTERNO */
.detalhes {
  position: absolute;
  inset: 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;

  /* NOVO VISUAL */
  background: rgba(20, 20, 20, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.05);
}

/* TEXTO */
.detalhes p {
  margin: 0;
  font-size: 14px;
  color: #ddd;
}

/* DESTAQUES */
.detalhes p:nth-child(2) {
  color: #f1c40f; /* gênero */
}

.detalhes p:nth-child(3) {
  color: #3498db; /* data */
}

.detalhes p:nth-child(4) {
  color: #e74c3c;
  font-weight: bold;
}

/* BOTÃO EXCLUIR */
button.danger {
  margin-top: 15px;
  background: linear-gradient(135deg, #e50914, #ff2a2a);
  border: none;
  padding: 10px;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

button.danger:hover {
  transform: scale(1.05);
}

/* BOTÃO FECHAR */
.fechar {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  font-size: 16px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  transition: 0.3s;
}

.fechar:hover {
  background: rgba(255,255,255,0.3);
  transform: rotate(90deg);
}

/* ANIMAÇÃO MAIS SUAVE */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>