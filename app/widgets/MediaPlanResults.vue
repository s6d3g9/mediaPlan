<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import type { CalculationResult } from '../entities/calculator/model/types'
import { NICHE_TIPS } from '../entities/calculator/data/nicheTips'
import { generateCampaign } from '../entities/calculator/data/campaignGenerator'
import AppCard from '../shared/ui/AppCard.vue'
import ExportButtons from '../features/export/ui/ExportButtons.vue'

const props = defineProps<{ result: CalculationResult }>()

const MN = ['ЯНВ','ФЕВ','МАР','АПР','МАЙ','ИЮН','ИЮЛ','АВГ','СЕН','ОКТ','НОЯ','ДЕК']
const MNF = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']

function fmt(n: number): string {
  if (n < 0) return '−' + fmt(-n)
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.', ',') + ' млн'
  if (n >= 1e4) return Math.round(n / 1e3) + ' тыс.'
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace('.', ',') + ' тыс.'
  return Math.round(n).toLocaleString('ru')
}

function fmtM(n: number): string { return Math.round(n).toLocaleString('ru') + ' ₽' }

const currentMonth = new Date().getMonth()
let pieChart: unknown = null
let seasonChart: unknown = null

const campaign = ref(generateCampaign(props.result.n, props.result.catKey, props.result.budget, props.result.cAvg, props.result.rm))

watch(() => props.result, (r) => {
  campaign.value = generateCampaign(r.n, r.catKey, r.budget, r.cAvg, r.rm)
  nextTick(() => renderCharts())
}, { deep: true })

function renderCharts() {
  if (typeof window === 'undefined') return
  try {
    const Chart = (window as unknown as { Chart: unknown }).Chart
    if (!Chart) return

    const pieEl = document.getElementById('pieChart') as HTMLCanvasElement | null
    if (pieEl) {
      if (pieChart) (pieChart as { destroy(): void }).destroy()
      pieChart = new (Chart as new (...args: unknown[]) => unknown)(pieEl.getContext('2d'), {
        type: 'doughnut',
        data: { labels: ['Поиск', 'РСЯ'], datasets: [{ data: [props.result.sB, props.result.rB], backgroundColor: ['#6366f1', '#22d3ee'], borderWidth: 0, hoverOffset: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: { parsed: number }) => ' ' + c.parsed.toLocaleString('ru') + ' ₽' } } }, cutout: '70%' }
      })
    }

    const seasonEl = document.getElementById('seasonChart') as HTMLCanvasElement | null
    if (seasonEl) {
      if (seasonChart) (seasonChart as { destroy(): void }).destroy()
      const seasonData = props.result.n.season.map(v => Math.round(v * 100))
      seasonChart = new (Chart as new (...args: unknown[]) => unknown)(seasonEl.getContext('2d'), {
        type: 'line',
        data: { labels: MN, datasets: [{ label: 'Спрос %', data: seasonData, borderColor: '#818cf8', backgroundColor: 'rgba(129,140,248,.12)', fill: true, tension: .35, pointRadius: 4, pointBackgroundColor: props.result.n.season.map((v, i) => i === currentMonth ? '#22d3ee' : v >= 1 ? '#34d399' : v >= .85 ? '#fbbf24' : '#f87171'), pointBorderWidth: props.result.n.season.map((_, i) => i === currentMonth ? 3 : 1), pointBorderColor: props.result.n.season.map((_, i) => i === currentMonth ? '#22d3ee' : 'transparent') }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 50, max: 110, ticks: { callback: (v: unknown) => v + '%', font: { size: 10 }, color: '#64748b' }, grid: { color: 'rgba(255,255,255,.06)' } }, x: { ticks: { font: { size: 10 }, color: '#64748b' }, grid: { display: false } } } }
      })
    }
  } catch {}
}

onMounted(() => { nextTick(() => renderCharts()) })

const nicheTips = props.result.catKey in NICHE_TIPS ? NICHE_TIPS[props.result.catKey] : NICHE_TIPS['_default']
const seasonNow = props.result.n.season[currentMonth]

const seasonTipClass = seasonNow >= 1 ? 'high' : seasonNow >= .85 ? 'mid' : 'low'
const seasonTipText = seasonNow >= 1
  ? 'Сейчас <strong>высокий сезон</strong> для этой ниши — самое время масштабировать бюджет и занимать позиции.'
  : seasonNow >= .85
  ? 'Сезон <strong>средний</strong>. Хорошее время для тестов с умеренным бюджетом.'
  : `Сейчас <strong>спад спроса</strong> (коэф. ${Math.round(seasonNow * 100)}%). Снизьте бюджет или переключитесь на РСЯ-ретаргетинг.`
const seasonTipIcon = seasonNow >= 1 ? '🟢' : seasonNow >= .85 ? '🟡' : '🔴'

const peaks = props.result.n.season.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v).slice(0, 3).map(x => MN[x.i]).join(', ')
const lows = props.result.n.season.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v).slice(0, 2).map(x => MN[x.i]).join(', ')

const annualRows = props.result.n.season.map((coef, i) => {
  const mBudget = Math.round(props.result.budget * coef)
  const mClicks = Math.floor(mBudget / props.result.cAvg)
  const mLeads = Math.floor(mClicks * props.result.siteCR)
  return { month: MNF[i], coef, mBudget, mClicks, mLeads, isCurrent: i === currentMonth }
})
const totalAnnual = annualRows.reduce((acc, r) => ({ budget: acc.budget + r.mBudget, clicks: acc.clicks + r.mClicks, leads: acc.leads + r.mLeads }), { budget: 0, clicks: 0, leads: 0 })
</script>

<template>
  <div class="results-wrap">
    <!-- Metrics Grid -->
    <AppCard :title="result.n.name + ' · ' + result.budget.toLocaleString('ru') + ' ₽/мес'" icon="📊" class="fu">
      <div class="mg">
        <div class="m"><span class="mi">👁️</span><div class="mv">{{ fmt(result.impr) }}</div><div class="ml">Показов/мес</div><div class="ms">CTR ~{{ Math.round(result.n.ctr * 100) }}%</div></div>
        <div class="m ac"><span class="mi">👆</span><div class="mv">{{ result.clMin.toLocaleString('ru') }}–{{ result.clMax.toLocaleString('ru') }}</div><div class="ml">Кликов/мес</div><div class="ms">~{{ result.clAvg.toLocaleString('ru') }} ср.</div></div>
        <div class="m"><span class="mi">💸</span><div class="mv">{{ Math.round(result.cMin) }}–{{ Math.round(result.cMax) }} ₽</div><div class="ml">CPC (цена клика)</div><div class="ms">~{{ Math.round(result.cAvg) }} ₽ ср.</div></div>
        <div class="m ac"><span class="mi">📋</span><div class="mv">{{ result.ldMin }}–{{ result.ldMax }}</div><div class="ml">Лидов/мес</div><div class="ms">конв. {{ (result.siteCR * 100).toFixed(1) }}%</div></div>
        <div class="m"><span class="mi">🎯</span><div class="mv">{{ Math.round(result.cplMin) }}–{{ Math.round(result.cplMax) }} ₽</div><div class="ml">CPL (стоимость лида)</div><div class="ms">~{{ Math.round(result.cplAvg) }} ₽ ср.</div></div>
        <template v-if="result.rD">
          <div :class="['m', result.rD.romi >= 0 ? 'gn' : '']"><span class="mi">📈</span><div class="mv">{{ Math.round(result.rD.romi) }}%</div><div class="ml">ROMI</div></div>
          <div class="m"><span class="mi">🛒</span><div class="mv">{{ result.rD.s }}</div><div class="ml">Продаж/мес</div></div>
          <div :class="['m', result.rD.profit >= 0 ? 'gn' : '']"><span class="mi">💵</span><div class="mv">{{ fmt(result.rD.rev) }}</div><div class="ml">Выручка ₽</div><div class="ms" :style="result.rD.profit < 0 ? 'color:#f87171' : ''">{{ result.rD.profit >= 0 ? 'прибыль' : 'убыток' }} ~{{ fmt(Math.abs(result.rD.profit)) }} ₽</div></div>
        </template>
        <template v-else>
          <div class="m"><span class="mi">📅</span><div class="mv">{{ fmtM(Math.round(result.budget / 30)) }}</div><div class="ml">Бюджет в день</div></div>
        </template>
      </div>
    </AppCard>

    <!-- Budget Split + KPI -->
    <AppCard title="Распределение бюджета" icon="🍩" class="fu">
      <div class="bsplit">
        <div class="cw"><canvas id="pieChart"></canvas></div>
        <div>
          <div class="sitem"><div class="sitem-hdr"><div class="dot-blue"></div><span>Поисковые кампании</span></div><div class="sitem-val" style="color:var(--ds-primary)">{{ result.sB.toLocaleString('ru') }} ₽</div><div class="sitem-sub">{{ Math.round(result.n.ss * 100) }}% · горячий спрос</div></div>
          <div class="sitem"><div class="sitem-hdr"><div class="dot-cyan"></div><span>РСЯ</span></div><div class="sitem-val" style="color:var(--ds-accent)">{{ result.rB.toLocaleString('ru') }} ₽</div><div class="sitem-sub">{{ Math.round((1 - result.n.ss) * 100) }}% · охват и ретаргетинг</div></div>
        </div>
      </div>
      <hr class="divider">
      <div class="ct" style="margin-bottom:.9rem"><div class="ci">📌</div>Прогресс KPI</div>
      <div class="kpib">
        <div class="kpir"><div class="kpil">Лидов/мес</div><div class="kpit"><div class="kpif" :style="{ width: Math.min(100, (result.ldAvg / Math.max(result.ldAvg, 30)) * 100) + '%', background: 'var(--ds-primary)' }"></div></div><div class="kpin" style="color:var(--ds-primary)">{{ result.ldAvg }}</div></div>
        <div class="kpir"><div class="kpil">Кликов/мес</div><div class="kpit"><div class="kpif" :style="{ width: Math.min(100, (result.clAvg / Math.max(result.clAvg, 500)) * 100) + '%', background: 'var(--ds-accent)' }"></div></div><div class="kpin" style="color:var(--ds-accent)">{{ result.clAvg.toLocaleString('ru') }}</div></div>
        <div class="kpir"><div class="kpil">Конв. сайта, %</div><div class="kpit"><div class="kpif" :style="{ width: Math.min(100, (result.siteCR * 100) / 10 * 100) + '%', background: 'var(--ds-green)' }"></div></div><div class="kpin" style="color:var(--ds-green)">{{ (result.siteCR * 100).toFixed(1) }}%</div></div>
        <div v-if="result.rD" class="kpir"><div class="kpil">ROMI, %</div><div class="kpit"><div class="kpif" :style="{ width: Math.min(100, Math.max(0, result.rD.romi) / 400 * 100) + '%', background: 'var(--ds-yellow)' }"></div></div><div class="kpin" style="color:var(--ds-yellow)">{{ Math.round(result.rD.romi) }}%</div></div>
      </div>
    </AppCard>

    <!-- Seasonality -->
    <AppCard title="Сезонность спроса" icon="📅" class="fu">
      <div class="sg">
        <div
          v-for="(v, i) in result.n.season"
          :key="i"
          class="sc"
          :style="{ background: v >= 1 ? 'rgba(52,211,153,.1)' : v >= .85 ? 'rgba(251,191,36,.1)' : 'rgba(248,113,113,.08)', outline: i === currentMonth ? '2px solid ' + (v >= 1 ? '#34d399' : v >= .85 ? '#fbbf24' : '#f87171') : 'none', 'outline-offset': '2px' }"
          :title="MN[i] + ': ' + Math.round(v * 100) + '%'"
        >
          <span class="sm" :style="{ color: i === currentMonth ? (v >= 1 ? '#34d399' : v >= .85 ? '#fbbf24' : '#f87171') : 'rgba(255,255,255,.35)' }">{{ MN[i] }}</span>
          <div class="sd" :style="{ background: v >= 1 ? '#34d399' : v >= .85 ? '#fbbf24' : '#f87171', opacity: Math.max(.3, v) }"></div>
        </div>
      </div>
      <div class="season-legend">
        <div class="sl-item"><div class="sl-dot" style="background:#34d399"></div><span>Высокий</span></div>
        <div class="sl-item"><div class="sl-dot" style="background:#fbbf24"></div><span>Средний</span></div>
        <div class="sl-item"><div class="sl-dot" style="background:#f87171"></div><span>Низкий</span></div>
      </div>
      <div class="season-badges">
        <span class="badge bg">↑ Пик: {{ peaks }}</span>
        <span class="badge br">↓ Спад: {{ lows }}</span>
        <span class="badge bb">Сейчас: {{ MN[currentMonth] }}</span>
      </div>
    </AppCard>

    <!-- Season Chart -->
    <AppCard title="График сезонности (12 месяцев)" icon="📈" class="fu">
      <div style="height:180px"><canvas id="seasonChart"></canvas></div>
    </AppCard>

    <!-- Annual forecast -->
    <AppCard title="Годовой прогноз (с учётом сезонности)" icon="📆" class="fu">
      <div style="overflow-x:auto">
        <table class="annual-tbl">
          <thead><tr><th>Месяц</th><th>Сезон</th><th>Бюджет</th><th>Клики</th><th>Лиды</th></tr></thead>
          <tbody>
            <tr v-for="row in annualRows" :key="row.month" :style="row.isCurrent ? 'background:rgba(99,102,241,.08)' : ''">
              <td>{{ row.month }}{{ row.isCurrent ? ' 📍' : '' }}</td>
              <td>{{ Math.round(row.coef * 100) }}%</td>
              <td>{{ row.mBudget.toLocaleString('ru') }} ₽</td>
              <td>{{ row.mClicks.toLocaleString('ru') }}</td>
              <td>{{ row.mLeads }}</td>
            </tr>
            <tr class="total"><td>ИТОГО за год</td><td></td><td>{{ totalAnnual.budget.toLocaleString('ru') }} ₽</td><td>{{ totalAnnual.clicks.toLocaleString('ru') }}</td><td>{{ totalAnnual.leads.toLocaleString('ru') }}</td></tr>
          </tbody>
        </table>
      </div>
    </AppCard>

    <!-- Scenarios -->
    <AppCard title="Сценарии по бюджету" icon="🔢" class="fu">
      <div style="overflow-x:auto">
        <table class="stbl">
          <thead><tr><th>Бюджет/мес</th><th>Кликов</th><th>Лидов</th><th>CPL</th><th v-if="result.rD">ROMI</th></tr></thead>
          <tbody>
            <tr v-for="s in result.scen" :key="s.budget" :class="Math.abs(s.budget - result.budget) < 5001 ? 'cur' : ''">
              <td>{{ s.budget.toLocaleString('ru') }} ₽<span v-if="Math.abs(s.budget - result.budget) < 5001" class="badge bb" style="margin-left:.3rem">ваш</span></td>
              <td>{{ s.clicks.toLocaleString('ru') }}</td>
              <td>{{ s.leads }}</td>
              <td>{{ s.cpl > 0 ? Math.round(s.cpl).toLocaleString('ru') + ' ₽' : '—' }}</td>
              <td v-if="result.rD"><span v-if="s.romi != null" :class="['badge', s.romi >= 100 ? 'bg' : s.romi >= 0 ? 'by' : 'br']">{{ Math.round(s.romi) }}%</span><span v-else>—</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>

    <!-- Recommendations -->
    <AppCard title="Рекомендации" icon="💡" class="fu">
      <div class="rl2">
        <div class="rec" style="background:rgba(99,102,241,.06);border-color:rgba(129,140,248,.2)"><i>🎯</i><span><strong>Совет по нише:</strong> {{ result.n.tip }}</span></div>
        <div :class="['rec', 'season-tip-' + seasonTipClass]"><i>{{ seasonTipIcon }}</i><span v-html="seasonTipText"></span></div>
        <div v-for="t in nicheTips" :key="t.t" class="rec"><i>{{ t.i }}</i><span v-html="t.t"></span></div>
        <div class="rec"><i>🔬</i><span>Минимальный тестовый бюджет — от <strong>{{ result.testB.toLocaleString('ru') }} ₽/мес</strong>. Рекомендуем тест <strong>2–4 недели</strong>.</span></div>
        <div class="rec"><i>📊</i><span>Поиск ({{ Math.round(result.n.ss * 100) }}%) — горячий спрос. РСЯ ({{ Math.round((1 - result.n.ss) * 100) }}%) — охват и ретаргетинг.</span></div>
        <div v-if="result.rD && result.rD.romi < 0" class="rec" style="background:rgba(248,113,113,.06);border-color:rgba(248,113,113,.2)"><i>🚨</i><span><strong>ROMI отрицательный ({{ Math.round(result.rD.romi) }}%)</strong> — реклама пока не окупается.</span></div>
        <div v-if="result.rD && result.rD.romi >= 100" class="rec" style="background:rgba(52,211,153,.06);border-color:rgba(52,211,153,.2)"><i>🚀</i><span><strong>ROMI {{ Math.round(result.rD.romi) }}% — отличный показатель!</strong> Масштабируйте бюджет.</span></div>
      </div>
    </AppCard>

    <!-- Export buttons -->
    <ExportButtons :result="result" :campaign="campaign" />
  </div>
</template>

<style scoped>
.results-wrap { display: flex; flex-direction: column; gap: 1.2rem; }
.fu { animation: fuA .38s ease both; }
@keyframes fuA { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
.mg { display: grid; grid-template-columns: repeat(3,1fr); gap: .7rem; }
@media(max-width:520px) { .mg { grid-template-columns: repeat(2,1fr); } }
.m { border-radius: 13px; padding: .95rem .85rem; text-align: center; border: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.025); transition: transform .2s, border-color .2s; }
.m:hover { transform: translateY(-2px); border-color: rgba(129,140,248,.25); }
.m.ac { border-color: rgba(129,140,248,.25); background: linear-gradient(135deg,rgba(99,102,241,.1),rgba(192,132,252,.07)); }
.m.gn { border-color: rgba(52,211,153,.22); background: linear-gradient(135deg,rgba(52,211,153,.08),rgba(16,185,129,.05)); }
.mi { font-size: 1.25rem; display: block; margin-bottom: .35rem; }
.mv { font-size: 1.2rem; font-weight: 800; letter-spacing: -.03em; color: var(--ds-primary); line-height: 1.1; }
.m.gn .mv { color: var(--ds-green); }
.ml { font-size: .67rem; color: var(--ds-muted); margin-top: .18rem; font-weight: 500; line-height: 1.3; }
.ms { font-size: .61rem; color: var(--ds-dim); margin-top: .1rem; }
.bsplit { display: grid; grid-template-columns: 165px 1fr; gap: 1.3rem; align-items: center; }
@media(max-width:480px) { .bsplit { grid-template-columns: 1fr; } }
.cw { position: relative; height: 165px; }
.sitem { margin-bottom: .9rem; }
.sitem-hdr { display: flex; align-items: center; gap: .5rem; margin-bottom: .2rem; font-size: .82rem; font-weight: 600; }
.sitem-val { font-size: 1.35rem; font-weight: 800; }
.sitem-sub { font-size: .68rem; color: var(--ds-muted); }
.dot-blue { width: 9px; height: 9px; border-radius: 3px; background: #6366f1; }
.dot-cyan { width: 9px; height: 9px; border-radius: 3px; background: #22d3ee; }
.divider { border: none; border-top: 1px solid rgba(255,255,255,.07); margin: 1.1rem 0; }
.ct { font-size: .8rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: var(--ds-muted); display: flex; align-items: center; gap: .5rem; }
.ci { width: 26px; height: 26px; border-radius: 7px; display: grid; place-items: center; font-size: .88rem; background: rgba(129,140,248,.15); }
.kpib { display: flex; flex-direction: column; gap: .7rem; }
.kpir { display: flex; align-items: center; gap: .8rem; }
.kpil { font-size: .73rem; color: var(--ds-muted); width: 115px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.kpit { flex: 1; height: 6px; background: rgba(255,255,255,.08); border-radius: 3px; overflow: hidden; }
.kpif { height: 100%; border-radius: 3px; transition: width 1s ease; }
.kpin { font-size: .73rem; font-weight: 700; width: 68px; text-align: right; flex-shrink: 0; white-space: nowrap; }
.sg { display: grid; grid-template-columns: repeat(12,1fr); gap: 3px; margin-top: .7rem; }
@media(max-width:600px) { .sg { grid-template-columns: repeat(6,1fr); } }
.sc { border-radius: 5px; height: 38px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; cursor: default; transition: transform .15s; }
.sc:hover { transform: scale(1.12); z-index: 2; position: relative; }
.sm { font-size: .46rem; font-weight: 700; text-transform: uppercase; }
.sd { width: 7px; height: 7px; border-radius: 50%; }
.season-legend { display: flex; gap: .45rem; flex-wrap: wrap; margin-top: .75rem; font-size: .7rem; }
.sl-item { display: flex; align-items: center; gap: .3rem; color: var(--ds-muted); }
.sl-dot { width: 7px; height: 7px; border-radius: 2px; }
.season-badges { margin-top: .7rem; display: flex; gap: .4rem; flex-wrap: wrap; }
.badge { display: inline-block; padding: .1rem .5rem; border-radius: 20px; font-size: .63rem; font-weight: 700; }
.bg { background: rgba(52,211,153,.15); color: #34d399; border: 1px solid rgba(52,211,153,.25); }
.by { background: rgba(251,191,36,.12); color: #fbbf24; border: 1px solid rgba(251,191,36,.22); }
.br { background: rgba(248,113,113,.12); color: #f87171; border: 1px solid rgba(248,113,113,.22); }
.bb { background: rgba(129,140,248,.15); color: #818cf8; border: 1px solid rgba(129,140,248,.25); }
.stbl { width: 100%; border-collapse: collapse; font-size: .8rem; }
.stbl th { padding: .5rem .8rem; text-align: left; font-size: .66rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: var(--ds-dim); border-bottom: 1px solid rgba(255,255,255,.07); white-space: nowrap; }
.stbl td { padding: .55rem .8rem; border-bottom: 1px solid rgba(255,255,255,.04); white-space: nowrap; }
.stbl tr:last-child td { border-bottom: none; }
.stbl tr:hover td { background: rgba(255,255,255,.02); }
.stbl .cur td { background: rgba(99,102,241,.1); font-weight: 600; }
.annual-tbl { width: 100%; border-collapse: collapse; font-size: .76rem; }
.annual-tbl th { text-align: left; padding: .45rem .5rem; font-size: .64rem; font-weight: 700; color: var(--ds-dim); text-transform: uppercase; letter-spacing: .03em; border-bottom: 1px solid rgba(255,255,255,.08); }
.annual-tbl td { padding: .4rem .5rem; border-bottom: 1px solid rgba(255,255,255,.04); }
.annual-tbl .total { font-weight: 700; background: rgba(99,102,241,.06); color: var(--ds-primary); }
.rl2 { display: flex; flex-direction: column; gap: .52rem; }
.rec { display: flex; align-items: flex-start; gap: .65rem; padding: .65rem .85rem; background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.07); border-radius: 9px; font-size: .8rem; line-height: 1.55; transition: border-color .2s; }
.rec:hover { border-color: rgba(129,140,248,.3); }
.rec i { font-style: normal; font-size: .95rem; flex-shrink: 0; margin-top: .05rem; }
</style>
