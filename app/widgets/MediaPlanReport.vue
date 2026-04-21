<script setup lang="ts">
import type { CalculationResult } from '../entities/calculator/model/types'

const props = defineProps<{ result: CalculationResult }>()

const MNF = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']

function fmt(n: number): string {
  if (n < 0) return '−' + fmt(-n)
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.', ',') + ' млн'
  if (n >= 1e4) return Math.round(n / 1e3) + ' тыс.'
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace('.', ',') + ' тыс.'
  return Math.round(n).toLocaleString('ru')
}

function copyReport() {
  const d = props.result
  const lines = [
    `МЕДИАПЛАН: ${d.n.name}`,
    `Категория: ${d.catName}`,
    `Дата: ${new Date().toLocaleDateString('ru')}`,
    '',
    `Бюджет/мес: ${fmt(d.budget)} ₽`,
    `Средний CPC: ${fmt(d.cAvg)} ₽`,
    `Кликов/мес: ${fmt(d.clAvg)}`,
    `Лидов/мес: ${fmt(d.ldAvg)}`,
    `CPL: ${fmt(d.cplAvg)} ₽`,
    `Конверсия сайта: ${(d.siteCR * 100).toFixed(1)}%`,
    '',
    `Бюджет Поиск: ${fmt(d.sB)} ₽`,
    `Бюджет РСЯ: ${fmt(d.rB)} ₽`,
  ]
  if (d.rD) {
    lines.push('', `Продаж/мес: ${fmt(d.rD.s)}`, `Выручка: ${fmt(d.rD.rev)} ₽`, `Прибыль: ${fmt(d.rD.profit)} ₽`, `ROMI: ${Math.round(d.rD.romi)}%`)
  }
  navigator.clipboard?.writeText(lines.join('\n')).catch(() => {})
}
</script>

<template>
  <div class="report-card">
    <div class="report-hdr">
      <div class="report-title">📋 Готовый отчёт для клиента</div>
      <button class="copy-btn" @click="copyReport">📋 Копировать</button>
    </div>

    <div class="report-body">
      <div class="rep-section">
        <div class="rep-label">Ниша</div>
        <div class="rep-val highlight">{{ result.n.name }}</div>
      </div>
      <div class="rep-section">
        <div class="rep-label">Категория</div>
        <div class="rep-val">{{ result.catName }}</div>
      </div>
      <div class="rep-section">
        <div class="rep-label">Дата составления</div>
        <div class="rep-val">{{ new Date().toLocaleDateString('ru') }}</div>
      </div>

      <div class="rep-divider" />

      <div class="rep-grid">
        <div class="rep-metric">
          <span class="rm-label">Бюджет/мес</span>
          <span class="rm-val">{{ fmt(result.budget) }} ₽</span>
        </div>
        <div class="rep-metric">
          <span class="rm-label">Ср. CPC</span>
          <span class="rm-val">{{ fmt(result.cAvg) }} ₽</span>
        </div>
        <div class="rep-metric">
          <span class="rm-label">Кликов/мес</span>
          <span class="rm-val">{{ fmt(result.clAvg) }}</span>
        </div>
        <div class="rep-metric">
          <span class="rm-label">Лидов/мес</span>
          <span class="rm-val accent">{{ fmt(result.ldAvg) }}</span>
        </div>
        <div class="rep-metric">
          <span class="rm-label">CPL</span>
          <span class="rm-val">{{ fmt(result.cplAvg) }} ₽</span>
        </div>
        <div class="rep-metric">
          <span class="rm-label">Конверсия</span>
          <span class="rm-val">{{ (result.siteCR * 100).toFixed(1) }}%</span>
        </div>
      </div>

      <div class="rep-divider" />

      <div class="rep-grid">
        <div class="rep-metric">
          <span class="rm-label">Поиск</span>
          <span class="rm-val">{{ fmt(result.sB) }} ₽</span>
        </div>
        <div class="rep-metric">
          <span class="rm-label">РСЯ</span>
          <span class="rm-val">{{ fmt(result.rB) }} ₽</span>
        </div>
      </div>

      <template v-if="result.rD">
        <div class="rep-divider" />
        <div class="rep-grid">
          <div class="rep-metric">
            <span class="rm-label">Продаж/мес</span>
            <span class="rm-val">{{ fmt(result.rD.s) }}</span>
          </div>
          <div class="rep-metric">
            <span class="rm-label">Выручка</span>
            <span class="rm-val">{{ fmt(result.rD.rev) }} ₽</span>
          </div>
          <div class="rep-metric">
            <span class="rm-label">Маржа</span>
            <span class="rm-val">{{ fmt(result.rD.margin) }} ₽</span>
          </div>
          <div class="rep-metric">
            <span class="rm-label">Прибыль</span>
            <span class="rm-val accent">{{ fmt(result.rD.profit) }} ₽</span>
          </div>
          <div class="rep-metric">
            <span class="rm-label">ROMI</span>
            <span class="rm-val" :class="result.rD.romi >= 0 ? 'pos' : 'neg'">{{ Math.round(result.rD.romi) }}%</span>
          </div>
        </div>
      </template>

      <div class="rep-divider" />

      <div class="rep-season">
        <div class="rep-label" style="margin-bottom:.5rem">Сезонность спроса</div>
        <div class="sea-row">
          <div
            v-for="(s, i) in result.n.season"
            :key="i"
            class="sea-cell"
            :style="{ opacity: 0.35 + s * 0.65 }"
          >
            <span class="sea-mon">{{ MNF[i].slice(0, 3) }}</span>
            <span class="sea-val">{{ Math.round(s * 100) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.report-card { background: var(--ds-glass); border: 1px solid var(--ds-glass-b); border-radius: 20px; padding: 1.5rem; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.report-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; }
.report-title { font-size: .8rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: var(--ds-muted); }
.copy-btn { background: rgba(129,140,248,.1); border: 1px solid rgba(129,140,248,.2); border-radius: 8px; padding: .3rem .75rem; font-size: .72rem; font-weight: 600; color: var(--ds-primary); cursor: pointer; font-family: inherit; transition: background .15s; }
.copy-btn:hover { background: rgba(129,140,248,.2); }
.rep-section { margin-bottom: .7rem; }
.rep-label { font-size: .67rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--ds-dim); margin-bottom: .2rem; }
.rep-val { font-size: .9rem; color: var(--ds-text); font-weight: 500; }
.rep-val.highlight { font-weight: 700; font-size: 1rem; background: linear-gradient(135deg, var(--ds-primary), var(--ds-secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.rep-divider { height: 1px; background: rgba(148,163,184,.1); margin: .85rem 0; }
.rep-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .6rem; }
.rep-metric { background: rgba(148,163,184,.06); border: 1px solid rgba(148,163,184,.1); border-radius: 10px; padding: .55rem .75rem; }
.rm-label { display: block; font-size: .62rem; color: var(--ds-dim); margin-bottom: .15rem; text-transform: uppercase; letter-spacing: .04em; }
.rm-val { font-size: .9rem; font-weight: 700; color: var(--ds-text); }
.rm-val.accent { color: var(--ds-primary); }
.rm-val.pos { color: #34d399; }
.rm-val.neg { color: #f87171; }
.sea-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: .35rem; }
.sea-cell { text-align: center; background: rgba(129,140,248,.1); border-radius: 6px; padding: .35rem .2rem; }
.sea-mon { display: block; font-size: .6rem; color: var(--ds-muted); }
.sea-val { display: block; font-size: .68rem; font-weight: 700; color: var(--ds-primary); }
</style>
