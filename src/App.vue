<template>
    <ChatGpt/>
</template>

<script>

import ChatGpt from './components/ChatBox.vue'

export default {
  name: 'App',
  components: {
    ChatGpt,
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
