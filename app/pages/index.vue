<script setup lang="ts">
import { ref } from 'vue'
import { useCalculator } from '../entities/calculator/model/useCalculator'
import type { CalculatorInput, CalculationResult } from '../entities/calculator/model/types'
import CalculatorForm from '../features/calculate/ui/CalculatorForm.vue'
import MediaPlanResults from '../widgets/MediaPlanResults.vue'

const { calculate } = useCalculator()
const result = ref<CalculationResult | null>(null)
const resultsEl = ref<HTMLElement | null>(null)

function onCalculate(input: CalculatorInput) {
  result.value = calculate(input)
  setTimeout(() => {
    resultsEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 80)
}
</script>

<template>
  <div class="page">
    <div class="hero no-print">
      <h1 class="hero-title">Медиаплан для Яндекс.Директ</h1>
      <p class="hero-sub">Профессиональный прогноз трафика, лидов и ROMI — бесплатно, без регистрации</p>
    </div>

    <div class="layout-cols">
      <aside class="col-form">
        <CalculatorForm @calculate="onCalculate" />
      </aside>

      <section ref="resultsEl" class="col-results">
        <MediaPlanResults v-if="result" :result="result" />
        <div v-else class="empty-state">
          <div class="empty-icon">📊</div>
          <div class="empty-title">Заполните параметры слева</div>
          <div class="empty-sub">Укажите нишу, регион и бюджет — получите полный медиаплан с прогнозами, объявлениями и рекомендациями</div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page { width: 100%; }

.hero { text-align: center; margin-bottom: 2.5rem; }
.hero-title { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 900; letter-spacing: -.04em; line-height: 1.15; background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,.7) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: .6rem; }
.hero-sub { font-size: .9rem; color: var(--ds-dim); max-width: 520px; margin: 0 auto; line-height: 1.6; }

.layout-cols { display: grid; grid-template-columns: 380px 1fr; gap: 1.5rem; align-items: start; }

.col-form { position: sticky; top: 80px; }
.col-results { min-height: 300px; }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 420px; text-align: center; background: var(--ds-glass); border: 1px dashed rgba(148,163,184,.2); border-radius: 20px; padding: 3rem 2rem; }
.empty-icon { font-size: 3.5rem; margin-bottom: 1rem; opacity: .4; }
.empty-title { font-size: 1.05rem; font-weight: 700; color: var(--ds-muted); margin-bottom: .6rem; }
.empty-sub { font-size: .82rem; color: var(--ds-dim); max-width: 340px; line-height: 1.6; }

@media (max-width: 860px) {
  .layout-cols { grid-template-columns: 1fr; }
  .col-form { position: static; }
}

@media print {
  .hero { display: none; }
  .layout-cols { grid-template-columns: 1fr; gap: 0; }
  .col-form { display: none; }
}
</style>
