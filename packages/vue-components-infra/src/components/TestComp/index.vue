<script lang="ts">
export default {
  name: "TestComp",
};
</script>

<script setup lang="ts">
import { ref } from "vue";

const a = ref(1);
</script>

<template>
  <div class="alpha">
    <div class="a">
      {{ a }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.alpha {
  .a {
    color: black;
  }
}
</style>
