<script setup lang="ts">
defineProps<{ title?: string; icon?: string }>()
</script>

<template>
  <div class="app-card">
    <div v-if="title" class="app-card__title">
      <div v-if="icon" class="app-card__icon">{{ icon }}</div>
      {{ title }}
    </div>
    <slot />
  </div>
</template>

<style scoped>
.app-card {
  background: var(--ds-glass);
  border: 1px solid var(--ds-glass-b);
  border-radius: 20px;
  padding: 1.5rem;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: var(--ds-shadow);
}
.app-card__title {
  font-size: .8rem;
  font-weight: 700;
  letter-spacing: .05em;
  text-transform: uppercase;
  color: var(--ds-muted);
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: .5rem;
}
.app-card__icon {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  display: grid;
  place-items: center;
  font-size: .88rem;
  background: rgba(129,140,248,.15);
  flex-shrink: 0;
}
</style>
