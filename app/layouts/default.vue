<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '../entities/design-system/model/useThemeStore'

const theme = useThemeStore()
onMounted(() => theme.init())
</script>

<template>
  <div class="layout">
    <div class="bg-orbs" aria-hidden="true">
      <div class="orb orb1" />
      <div class="orb orb2" />
      <div class="orb orb3" />
    </div>

    <header class="app-header no-print">
      <div class="hdr-inner">
        <div class="logo">
          <span class="logo-icon">📊</span>
          <div>
            <div class="logo-title">Яндекс.Директ</div>
            <div class="logo-sub">Медиапланировщик</div>
          </div>
        </div>
        <button class="theme-btn" :title="theme.isDark ? 'Светлая тема' : 'Тёмная тема'" @click="theme.toggle">
          {{ theme.isDark ? '☀️' : '🌙' }}
        </button>
      </div>
    </header>

    <main class="app-main">
      <slot />
    </main>

    <footer class="app-footer no-print">
      <p>Медиаплан — прогноз на основе данных Яндекс.Директ. Фактические показатели зависят от качества сайта, объявлений и конкурентной ситуации.</p>
    </footer>
  </div>
</template>

<style>
@import '../assets/css/tokens.css';

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: var(--ds-bg);
  color: var(--ds-text);
  min-height: 100vh;
  transition: background .3s, color .3s;
  -webkit-font-smoothing: antialiased;
}

select, input, button { font-family: inherit; }
</style>

<style scoped>
.layout { min-height: 100vh; position: relative; overflow-x: hidden; }

.bg-orbs { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .18; }
.orb1 { width: 500px; height: 500px; background: radial-gradient(circle, #4f46e5, transparent); top: -100px; left: -100px; }
.orb2 { width: 400px; height: 400px; background: radial-gradient(circle, #7c3aed, transparent); bottom: 10%; right: -80px; }
.orb3 { width: 300px; height: 300px; background: radial-gradient(circle, #06b6d4, transparent); top: 40%; left: 35%; }

.app-header { position: sticky; top: 0; z-index: 100; background: var(--hdr-bg, rgba(10,10,31,.7)); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid rgba(148,163,184,.1); }
.hdr-inner { max-width: 1200px; margin: 0 auto; padding: .9rem 1.5rem; display: flex; align-items: center; justify-content: space-between; }
.logo { display: flex; align-items: center; gap: .7rem; }
.logo-icon { font-size: 1.5rem; }
.logo-title { font-size: .95rem; font-weight: 800; letter-spacing: -.02em; background: linear-gradient(135deg, var(--ds-primary), var(--ds-secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.logo-sub { font-size: .62rem; color: var(--ds-dim); letter-spacing: .06em; text-transform: uppercase; }
.theme-btn { background: rgba(148,163,184,.1); border: 1px solid rgba(148,163,184,.15); border-radius: 8px; width: 36px; height: 36px; cursor: pointer; font-size: 1rem; transition: background .2s; display: grid; place-items: center; }
.theme-btn:hover { background: rgba(148,163,184,.2); }

.app-main { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; }

.app-footer { position: relative; z-index: 1; text-align: center; padding: 1.5rem; font-size: .7rem; color: var(--ds-dim); border-top: 1px solid rgba(148,163,184,.07); margin-top: 2rem; }

@media print {
  .no-print { display: none !important; }
  .layout { background: #fff; }
  .bg-orbs { display: none; }
  .app-main { padding: 0; max-width: 100%; }
}
</style>
