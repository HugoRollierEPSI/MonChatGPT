<template>
    <div class="container">
      <h1>Mon ChatGPT</h1>
      <div class="input-container">
        <input v-model="question" placeholder="Posez une question..." @keyup.enter="askQuestion" />
        <button @click="askQuestion">Envoyer</button>
      </div>
  
      <h2>Questions récentes :</h2>
      <ul class="question-list">
        <li v-for="q in questions" :key="q.id">{{ q.question }}</li>
      </ul>
  
      <div v-if="response" class="response-container">
        <h3>Réponse du modèle :</h3>
        <p>{{ response }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        question: '',
        questions: [],
        response: '',
      };
    },
    mounted() {
      this.fetchQuestions();
    },
    methods: {
      async askQuestion() {
        if (this.question.trim() === '') return;
  
        try {
          // Envoi de la question au serveur pour l'ajouter à la base de données
          await axios.post('http://localhost:3000/api/questions', {
            question: this.question,
          });
  
          // Interroger le modèle Hugging Face
          const modelResponse = await axios.post('http://localhost:3000/api/query-model', {
            question: this.question,
          });
  
          this.response = modelResponse.data[0]?.generated_text || 'Pas de réponse trouvée';
  
          // Réinitialiser la question
          this.question = '';
          this.fetchQuestions();
        } catch (error) {
          console.error('Erreur:', error);
        }
      },
      async fetchQuestions() {
        try {
          const response = await axios.get('http://localhost:3000/api/questions');
          this.questions = response.data;
        } catch (error) {
          console.error('Erreur:', error);
        }
      },
    },
  };
  </script>
  
  <style scoped src="./style.css"></style>
  