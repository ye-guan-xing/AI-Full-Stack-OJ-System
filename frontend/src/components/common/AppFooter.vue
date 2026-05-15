<template>
  <footer class="Appfooter">
    <!-- <div class="container"> -->
    <p>&copy; {{ year }} by acye and shuimo(^(*￣(oo)￣)^)</p>
    <!-- </div> -->
  </footer>
</template>

<script setup>
import { ref } from "vue";
const year = ref(new Date().getFullYear());
</script>

<style scoped>
.Appfooter {
  background-color: #6c757d;
  color: white;
  text-align: left;
  padding: 1rem 0;
  margin-top: auto;
}
</style>
