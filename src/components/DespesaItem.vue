<script setup>
import { ref } from 'vue'

import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

// Recebe o item como prop
const props = defineProps({
  item: Object
})

// Controla se está aberto ou fechado
const aberto = ref(false)

// Alterna o estado
const toggle = () => {
  aberto.value = !aberto.value
}

// Função para excluir
const excluir = async () => {
  try {
    await deleteDoc(doc(db, 'financas', props.item.id))
  } catch (e) {
    console.error('Erro ao excluir:', e)
  }
}

</script>

<template>
  <li class="item">

    <!-- Clique no item -->
    <div class="resumo" @click="toggle">
      <strong>{{ item.descricao }}</strong>
      <span>R$ {{ item.valor }}</span>
    </div>

    <!-- Detalhes (abre/fecha) -->
    <div v-if="aberto" class="detalhes">
      <p><strong>Descrição:</strong> {{ item.descricao }}</p>
      <p><strong>Valor:</strong> R$ {{ item.valor }}</p>
    

    <!-- BOTÃO EXCLUIR -->
      <button class="danger" @click.stop="excluir">
        <i class="fa-solid fa-trash"></i> Excluir
      </button>
    </div>

  </li>
</template>

<style scoped>
.item {
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
  cursor: pointer;
}

.resumo {
  display: flex;
  justify-content: space-between;
}

.detalhes {
  margin-top: 8px;
  padding: 8px;
  background: #e2e2e2;
  border-radius: 6px;
}

button.danger {
  margin-top: 10px;
  background: #e74c3c;
  color: white;
}
</style>