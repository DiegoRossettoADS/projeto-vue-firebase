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

  // Limpa os campos após salvar com sucesso
  titulo.value = ''
  valor.value = ''
  imagem.value = ''
  genero.value = ''
  dataEstreia.value = ''
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

  // Verifica se existe um usuário autenticado no sistema.
  // auth.currentUser vem do Firebase Authentication.
  if (auth.currentUser) {

    // Inicia a escuta em tempo real das filmes do usuário.
    // A função ouvirfilmes usa onSnapshot do Firestore
    // para receber atualizações automáticas do banco.
    ouvirfilmes()
  }
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
  <section class="card">

    <h1><i class="fa-solid fa-chart-line"></i> Cadastrar Filmes</h1>
    <p class="muted">Somente usuarios logados podem acessar esta tela.</p>

    <!-- -----------------------------------------------------------------
      FORMULÁRIO CADASTRO
    ------------------------------------------------------------------ -->
    <div class="form-row">

      <!-- v-model="titulo" mantém o campo sincronizado com a ref -->
      <input v-model="titulo" placeholder="Título do filme" />

      <!-- type="number" + step="0.01" permite valores decimais -->
      <input v-model="valor" type="number" step="0.01" placeholder="Valor do ingresso" />

      <input v-model="imagem" placeholder="URL da imagem (capa)" />

      <input v-model="genero" placeholder="Gênero (ex: Ação, Comédia)" />

      <input v-model="dataEstreia" type="date" />

      <select v-model="status">
        <option value="cartaz">Em cartaz</option>
        <option value="breve">Em breve</option>
      </select>

      <!-- @click chama salvarFilme() a cada clique -->
      <button @click="salvarFilme">
        <i class="fa-solid fa-plus"></i> Cadastrar
      </button>

    </div>

    <!-- Exibido apenas quando "aviso" tiver conteúdo (v-if) -->
    <p v-if="aviso" class="error">
      <i class="fa-solid fa-triangle-exclamation"></i> {{ aviso }}
    </p>

    <h3>Filmes Cadastrados</h3>

    <!-- -----------------------------------------------------------------
      LISTA DE FILMES
      v-if / v-else alternam entre lista preenchida e mensagem vazia.
    ------------------------------------------------------------------ -->

    <!-- v-if: renderiza a lista somente se houver ao menos 1 item -->
    <ul v-if="filmes.length">

      <!--
        v-for percorre o array "filmes".
        :key="item.id" usa o ID do Firestore para identificar cada elemento
        de forma única — o Vue precisa disso para atualizar o DOM com eficiência.
      --> <!--
      <li v-for="item in filmes" :key="item.id">
        <strong>{{ item.titulo }}</strong> — R$ {{ item.valor }}
      </li> -->

      <!-- nova lista para receber o componente detalhe-->
      <FilmeItem
        v-for="item in filmes"
        :key="item.id"
        :item="item"
      />

    </ul>

    <!-- v-else: exibido quando filmes.length === 0 -->
    <p v-else class="muted">Ainda nao ha filmes cadastrados.</p>

  </section>
</template>