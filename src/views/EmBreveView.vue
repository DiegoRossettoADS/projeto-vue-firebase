<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import FilmeItem from '../components/DescricaoFilme.vue'
import { onAuthStateChanged } from 'firebase/auth'

const filmes = ref([])
let unsubscribe = null

const ouvirFilmesBreve = () => {
  const q = query(
    collection(db, 'financas'),
    where('userId', '==', auth.currentUser.uid),
    where('status', '==', 'breve') // 🔥 filtro diferente
  )

  unsubscribe = onSnapshot(q, (snapshot) => {
    filmes.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  })
}

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      ouvirFilmesBreve()
    }
  })
})

onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<template>
  <section>

    <div class="container">

      <!-- HEADER -->
      <div class="header">
        <h1>🍿 Em Breve</h1>
        <p>Confira os próximos lançamentos</p>
      </div>

      <!-- GRID -->
      <div class="grid">
        <FilmeItem
          v-for="item in filmes"
          :key="item.id"
          :item="item"
        />
      </div>

      <!-- ESTADO VAZIO -->
      <p v-if="!filmes.length" class="empty">
        Nenhum lançamento futuro cadastrado.
      </p>

    </div>

  </section>
</template>

<style scoped>
/* FUNDO GERAL */
section {
  background: linear-gradient(to bottom, #0f0f0f, #1a1a1a);
  min-height: 100vh;
  padding-bottom: 40px;
}

/* CONTAINER CENTRAL */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* HEADER */
.header {
  margin-bottom: 30px;
}

/* TÍTULO */
.header h1 {
  font-size: 28px;
  color: #fff;
  margin: 0;
  font-weight: 600;
}

/* SUBTEXTO */
.header p {
  color: #aaa;
  font-size: 14px;
  margin-top: 6px;
}

/* LINHA DECORATIVA */
.header::after {
  content: '';
  display: block;
  width: 60px;
  height: 3px;
  margin-top: 10px;
  background: linear-gradient(90deg, #e50914, transparent);
  border-radius: 2px;
}

/* GRID DE FILMES */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
}

/* ESTADO VAZIO */
.empty {
  margin-top: 60px;
  text-align: center;
  color: #888;
  font-size: 15px;
  opacity: 0.8;
}

/* ÍCONE GRANDE NO EMPTY */
.empty::before {
  content: '🎬';
  display: block;
  font-size: 40px;
  margin-bottom: 10px;
  opacity: 0.6;
}

/* RESPONSIVO */
@media (max-width: 768px) {
  .header h1 {
    font-size: 22px;
  }

  .grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }
}
</style>