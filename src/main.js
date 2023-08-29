import 'bootstrap/dist/css/bootstrap.css';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router'; // Import Vue Router
import App from './App.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import '@fortawesome/fontawesome-free/css/all.css';


// Create and configure the router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Define your routes here
  ],
});

library.add(faPhone);
createApp(App)
  .use(router) // Use the router
  .component('font-awesome-icon', FontAwesomeIcon)
  .mount('#app');

import 'bootstrap/dist/js/bootstrap.js';