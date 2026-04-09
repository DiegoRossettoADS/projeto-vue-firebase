<script setup>
/**
 * CadastraFilmeView.vue — Área Protegida com CRUD de filmes
 *
 * Propósito: tela acessível apenas por usuários autenticados,
 * onde é possível cadastrar e visualizar filmes pessoais
 * armazenadas no Firebase Firestore.
 *
 * Conceitos demonstrados neste componente:
 *  - ref(): estado local reativo
 *  - onMounted / onBeforeUnmount: ciclo de vida do componente
 *  - Firebase Firestore: escrita (addDoc) e leitura em tempo real (onSnapshot)
 *  - query + where: consulta filtrada por usuário
 *  - Isolamento de dados por userId
 */

// ---------------------------------------------------------------------------
// IMPORTAÇÕES DO VUE
// ---------------------------------------------------------------------------

// ref()           → cria variável reativa; quando .value muda, o DOM atualiza
// onMounted       → hook executado após o componente aparecer na tela
        //chatgpt:
              /*onMounted(() => {
                  carregarUsuarios()
              })  */
        // onBeforeUnmount → hook executado antes do componente ser removido da tela
        /*
        let intervalo

        onMounted(() => {
          intervalo = setInterval(() => {
            console.log("rodando...")
          }, 1000)
        })

        onBeforeUnmount(() => {
          clearInterval(intervalo)
        })
        */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'


// ---------------------------------------------------------------------------
// IMPORTAÇÕES DO FIRESTORE
// ---------------------------------------------------------------------------

// collection  → aponta para uma coleção do banco (ex: "financas")
// addDoc      → insere um novo documento na coleção (CREATE)
// onSnapshot  → escuta mudanças em tempo real (READ reativo)..observa a coleção ou consulta
// query       → monta uma consulta no banco
// where       → adiciona um filtro à consulta (ex: userId == ...)
import { collection, addDoc, onSnapshot, query, where } from 'firebase/firestore'


// ---------------------------------------------------------------------------
// CONFIGURAÇÃO DO FIREBASE
// ---------------------------------------------------------------------------

// auth → serviço de autenticação; auth.currentUser traz o usuário logado
// db   → instância do Firestore (banco de dados)
import { auth, db } from '../firebase/config'

//import do componente de detalhes dos itens salvos
import FilmeItem from '../components/DescricaoFilme.vue'


// ---------------------------------------------------------------------------
// ESTADO DO COMPONENTE (variáveis reativas)
// ---------------------------------------------------------------------------

const titulo = ref('')   // Texto digitado no campo "descrição"
const valor = ref('')   // Número digitado no campo "valor"
const filmes = ref([])   // Array com os registros vindos do Firestore
const aviso = ref('')   // Mensagem de validação exibida ao usuário
const status = ref('cartaz') //para adicionar em cartaz ou em breve
const imagem = ref('') 
const genero = ref('')
const dataEstreia = ref('')

// Guarda a função de cancelamento retornada pelo onSnapshot.

let unsubscribe = null

// ---------------------------------------------------------------------------
// FUNÇÃO: salvarFilme — operação CREATE do CRUD
// ---------------------------------------------------------------------------
//
// Valida os campos e grava um novo documento no Firestore.
// Cada documento inclui o userId para isolar dados por usuário.
//
const salvarFilme = async () => {

  aviso.value = '' // Limpa aviso anterior antes de qualquer coisa

  // Validação: ambos os campos precisam estar preenchidos.
  // "return" interrompe a função se a condição for verdadeira.
  if (!titulo.value || !valor.value || !status.value || !genero.value || !dataEstreia.value ) {
    aviso.value = 'Preencha as informações.'
    return
  }

  // addDoc grava um novo documento na coleção "financas".
  // await pausa a função até o Firebase confirmar a gravação.
  try {
  await addDoc(collection(db, 'financas'), {
    titulo: titulo.value,
    valor: Number(valor.value),  // Converte string → número antes de salvar
    status: status.value,
    imagem: imagem.value,
    genero: genero.value,
    dataEstreia: dataEstreia.value,
    // userId vincula o registro ao usuário logado.
    // Sem isso, todos os usuários veriam os cadastros uns dos outros.
    userId: auth.currentUser.uid
  })
  } catch (error) {
    console.error(error)
    aviso.value = 'Erro ao cadastrar filme.'
  }

  

  // Limpa os campos após salvar com sucesso
  titulo.value = ''
  valor.value = ''
  imagem.value = ''
  genero.value = ''
  dataEstreia.value = ''
  status.value = 'cartaz'
}


// ---------------------------------------------------------------------------
// FUNÇÃO: ouvirfilmes — operação READ em tempo real
// ---------------------------------------------------------------------------
//
// Cria uma escuta ativa no Firestore.
// Sempre que um documento da consulta for criado, editado ou removido,
// o array "filmes" é atualizado automaticamente — sem precisar recarregar.
//
const ouvirfilmes = () => {

  // Criamos uma consulta (query) no Firestore.
  // Ela busca documentos na coleção "financas".
  // O filtro where garante que só retornem documentos
  // cujo campo userId seja igual ao ID do usuário logado.
  // Assim cada usuário vê apenas suas próprias filmes.
  const q = query(
    collection(db, 'financas'),
    where('userId', '==', auth.currentUser.uid)
  )

  // onSnapshot cria um "listener" (ouvinte) em tempo real para essa consulta.
  // Sempre que algo mudar no banco (adicionar, editar ou excluir documento),
  // essa função será executada novamente.
  //
  // O callback também roda imediatamente na primeira vez,
  // trazendo os dados iniciais da coleção.
  //
  // onSnapshot retorna uma função que serve para cancelar essa escuta.
  // Guardamos essa função na variável "unsubscribe"
  // para poder parar o listener quando o componente sair da tela.
  unsubscribe = onSnapshot(q, (snapshot) => {

    // snapshot.docs contém todos os documentos retornados pela consulta.
    // Cada item desse array representa um documento da coleção.
    //
    // Usamos map() para percorrer cada documento e transformá-lo
    // em um objeto JavaScript simples que será usado na interface.
    filmes.value = snapshot.docs.map((doc) => ({

      // doc.id é o identificador único gerado pelo Firestore
      // (geralmente usado como :key em listas no Vue)
      id: doc.id,

      // doc.data() retorna todos os campos armazenados no documento
      // como titulo, valor e userId.
      // O operador ... espalha esses campos dentro do objeto.
      ...doc.data()

    }))
  })
}



// ---------------------------------------------------------------------------
// CICLO DE VIDA
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// CICLO DE VIDA DO COMPONENTE
// ---------------------------------------------------------------------------

// onMounted é executado automaticamente quando o componente
// é carregado e aparece na tela.
//
// Esse é o momento ideal para iniciar processos que dependem
// da interface já estar ativa, como buscar dados ou iniciar
// listeners no banco de dados.
onMounted(() => {

  onAuthStateChanged(auth, (user) => {
    if (user && !unsubscribe) {
      ouvirfilmes()
    }
  })
})


// onBeforeUnmount é executado imediatamente antes
// do componente ser removido da tela.
//
// Isso acontece por exemplo quando:
// - o usuário muda de página
// - troca de rota
// - fecha um modal
onBeforeUnmount(() => {

  // Se existir um listener ativo no Firestore,
  // chamamos a função unsubscribe para cancelá-lo.
  //
  // Isso é muito importante para evitar "memory leak",
  // pois sem cancelar a escuta o Firestore continuaria
  // enviando atualizações mesmo depois da tela desaparecer.
  if (unsubscribe) unsubscribe()

})


</script>


<template>
  <section>

    <div class="container">

      <!-- HEADER -->
      <div class="header">
        <h1>🎬 Cadastrar Filmes</h1>
        <p>Adicione filmes ao catálogo</p>
      </div>

      <!-- FORMULÁRIO -->
      <div class="form-card">
        <div class="form-row">

          <input v-model="titulo" placeholder="Título do filme" />

          <input v-model="valor" type="number" placeholder="Valor do ingresso" />

          <input v-model="imagem" placeholder="URL da imagem" />

          <input v-model="genero" placeholder="Gênero" />

          <input v-model="dataEstreia" type="date" />

          <select v-model="status">
            <option value="cartaz">Em cartaz</option>
            <option value="breve">Em breve</option>
          </select>

          <button @click="salvarFilme">
            ➕ Cadastrar
          </button>

        </div>

        <p v-if="aviso" class="error">
          {{ aviso }}
        </p>
      </div>

      <!-- LISTA -->
      <h3 class="lista-titulo">Filmes Cadastrados</h3>

      <div class="grid" v-if="filmes.length">
        <FilmeItem
          v-for="item in filmes"
          :key="item.id"
          :item="item"
          :mostrarExcluir="true"
        />
      </div>

      <p v-else class="empty">
        Nenhum filme cadastrado.
      </p>

    </div>

  </section>
</template>

<style scoped>
section {
  background: linear-gradient(to bottom, #0f0f0f, #1a1a1a);
  min-height: 100vh;
  padding: 30px 20px;
}

/* CONTAINER CENTRAL */
.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* HEADER */
.header {
  margin-bottom: 25px;
}

.header h1 {
  color: #fff;
  font-size: 26px;
  margin: 0;
}

.header p {
  color: #aaa;
  font-size: 14px;
  margin-top: 5px;
}

/* LINHA ESTILO STREAMING */
.header::after {
  content: '';
  display: block;
  width: 60px;
  height: 3px;
  margin-top: 10px;
  background: linear-gradient(90deg, #e50914, transparent);
}

/* CARD FORMULÁRIO (GLASS) */
.form-card {
  background: rgba(20, 20, 20, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255,255,255,0.05);
  margin-bottom: 30px;
}

/* GRID DO FORM */
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
}

/* INPUTS */
input,
select {
  padding: 10px;
  border-radius: 8px;
  border: none;
  outline: none;

  background: #2a2a2a;
  color: #fff;
  transition: 0.2s;
}

input:focus,
select:focus {
  background: #333;
  box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.5);
}

/* BOTÃO */
button {
  padding: 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  color: white;

  background: linear-gradient(135deg, #e50914, #ff2a2a);
  transition: 0.3s;
}

button:hover {
  transform: scale(1.05);
}

.form-row button {
  grid-column: 1 / -1; 
  justify-self: center; 
  max-width: 200px; 
}
/* ERRO */
.error {
  margin-top: 10px;
  color: #ff4d4d;
}

/* TÍTULO LISTA */
.lista-titulo {
  color: #fff;
  margin-bottom: 10px;
}

/* GRID DOS FILMES */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

/* ESTADO VAZIO */
.empty {
  margin-top: 30px;
  text-align: center;
  color: #888;
}

/* RESPONSIVO */
@media (max-width: 768px) {
  .header h1 {
    font-size: 22px;
  }
}
</style>
