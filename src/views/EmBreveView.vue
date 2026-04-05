<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import FilmeItem from '../components/DescricaoFilme.vue'

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
  if (auth.currentUser) {
    ouvirFilmesBreve()
  }
})

onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<template>
  <section class="card">
    <h1>🍿 Em Breve</h1>

    <div class="grid">
      <FilmeItem
        v-for="item in filmes"
        :key="item.id"
        :item="item"
      />
    </div>

    <p v-if="!filmes.length" class="muted">
      Nenhum lançamento futuro cadastrado.
    </p>
  </section>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  padding: 20px;
}

/* container geral */
.card-section {
  max-width: 1200px;
  margin: 0 auto;
}

/* título da página */
h1 {
  margin-left: 20px;
  color: #fff;
}

/* fundo estilo cinema */
section {
  background: #111;
  min-height: 100vh;
}
</style>