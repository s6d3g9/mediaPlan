<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'outline' | 'ghost'
  disabled?: boolean
  type?: 'button' | 'submit'
}>()
defineEmits<{ click: [] }>()
</script>

<template>
  <button
    :type="type || 'button'"
    :disabled="disabled"
    :class="['app-btn', `app-btn--${variant || 'primary'}`]"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<style scoped>
.app-btn {
  font-family: inherit;
  cursor: pointer;
  border-radius: 13px;
  font-weight: 800;
  font-size: .92rem;
  transition: opacity .2s, transform .15s, box-shadow .2s;
  position: relative;
  overflow: hidden;
  border: none;
}
.app-btn:disabled { opacity: .5; cursor: not-allowed; }

.app-btn--primary {
  width: 100%;
  padding: .95rem;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  box-shadow: 0 4px 24px rgba(99,102,241,.4);
}
.app-btn--primary:not(:disabled):hover { opacity: .92; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(99,102,241,.55); }
.app-btn--primary:active { transform: translateY(0); }

.app-btn--outline {
  width: 100%;
  padding: .75rem;
  background: transparent;
  color: var(--ds-primary);
  border: 1.5px solid rgba(129,140,248,.35);
}
.app-btn--outline:not(:disabled):hover { background: rgba(99,102,241,.08); border-color: var(--ds-primary); }

.app-btn--ghost {
  padding: .45rem .85rem;
  background: rgba(148,163,184,.1);
  border: 1px solid rgba(148,163,184,.18);
  border-radius: 8px;
  font-size: .74rem;
  font-weight: 600;
  color: var(--ds-text);
}
.app-btn--ghost:not(:disabled):hover { background: rgba(148,163,184,.18); }
</style>
