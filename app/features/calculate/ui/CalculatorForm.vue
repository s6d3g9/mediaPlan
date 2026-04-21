<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { DB } from '../../../entities/calculator/data/db'
import type { CalculatorInput } from '../../../entities/calculator/model/types'
import AppCard from '../../../shared/ui/AppCard.vue'
import AppButton from '../../../shared/ui/AppButton.vue'

const emit = defineEmits<{ calculate: [input: CalculatorInput] }>()

const category = ref('')
const subniche = ref('')
const region = ref(1.0)
const budget = ref(30000)
const siteCR = ref(3)
const avgCheck = ref(0)
const leadToSale = ref(20)
const margin = ref(40)
const ltvRepeat = ref(1)
const showError = ref(false)
const searchQuery = ref('')
const searchResults = ref<Array<{ catKey: string; subKey: string; label: string }>>([])
const showSearch = ref(false)

const categories = computed(() => Object.entries(DB).map(([k, v]) => ({ key: k, label: v.label })))

const subniches = computed(() => {
  if (!category.value) return []
  return Object.entries(DB[category.value]?.subs || {}).map(([k, v]) => ({ key: k, label: v.name }))
})

const selectedSubData = computed(() => {
  if (!category.value || !subniche.value) return null
  return DB[category.value]?.subs[subniche.value] || null
})

const sliderPct = computed(() => ((budget.value - 5000) / (500000 - 5000) * 100).toFixed(1) + '%')
const dailyBudget = computed(() => Math.round(budget.value / 30).toLocaleString('ru'))

function onCategoryChange() {
  subniche.value = ''
}

function onSlider(e: Event) {
  budget.value = Number((e.target as HTMLInputElement).value)
}

function onBudgetInput(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  if (!isNaN(v)) budget.value = Math.max(1000, v)
}

function filterSearch() {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) { searchResults.value = []; showSearch.value = false; return }
  const res: typeof searchResults.value = []
  for (const [ck, cv] of Object.entries(DB)) {
    for (const [sk, sv] of Object.entries(cv.subs)) {
      if (sv.name.toLowerCase().includes(q) || cv.label.toLowerCase().includes(q) || sv.keys.some(kw => kw.toLowerCase().includes(q))) {
        res.push({ catKey: ck, subKey: sk, label: cv.label.replace(/^\S+\s/, '') + ' → ' + sv.name })
      }
    }
  }
  searchResults.value = res.slice(0, 20)
  showSearch.value = true
}

function selectFromSearch(item: typeof searchResults.value[0]) {
  category.value = item.catKey
  subniche.value = item.subKey
  searchQuery.value = ''
  showSearch.value = false
}

function hideSearch() {
  setTimeout(() => { showSearch.value = false }, 150)
}

function calculate() {
  if (!category.value || !subniche.value) {
    showError.value = true
    setTimeout(() => { showError.value = false }, 3000)
    return
  }
  emit('calculate', {
    category: category.value,
    subniche: subniche.value,
    region: region.value,
    budget: budget.value,
    siteCR: siteCR.value,
    avgCheck: avgCheck.value,
    leadToSale: leadToSale.value,
    margin: margin.value,
    ltvRepeat: ltvRepeat.value,
  })
}
</script>

<template>
  <div class="calc-form no-print">
    <AppCard title="Параметры кампании" icon="🎯">
      <div class="fg">
        <label class="fl">🔍 Поиск по всем нишам</label>
        <div style="position:relative">
          <input
            v-model="searchQuery"
            type="text"
            class="search-inp"
            placeholder="Введите название ниши, услуги или ключевое слово..."
            @input="filterSearch"
            @blur="hideSearch"
          >
          <div v-if="showSearch && searchResults.length" class="search-drop">
            <div
              v-for="item in searchResults"
              :key="item.catKey + item.subKey"
              class="search-item"
              @mousedown.prevent="selectFromSearch(item)"
            >{{ item.label }}</div>
          </div>
          <div v-if="showSearch && !searchResults.length" class="search-drop">
            <div class="search-empty">Ничего не найдено</div>
          </div>
        </div>
      </div>

      <div class="fg">
        <label class="fl">Категория ниши</label>
        <select v-model="category" @change="onCategoryChange">
          <option value="">— Выберите категорию —</option>
          <option v-for="cat in categories" :key="cat.key" :value="cat.key">{{ cat.label }}</option>
        </select>
      </div>

      <div class="fg">
        <label class="fl">Подниша</label>
        <select v-model="subniche" :disabled="!category">
          <option value="">— Выберите подниш —</option>
          <option v-for="sub in subniches" :key="sub.key" :value="sub.key">{{ sub.label }}</option>
        </select>
        <div v-if="selectedSubData" class="chips">
          <span class="chip">CPC: {{ selectedSubData.cpcMin }}–{{ selectedSubData.cpcMax }} ₽</span>
          <span class="chip">CTR: ~{{ Math.round(selectedSubData.ctr * 100) }}%</span>
          <span class="chip">Конверсия: {{ (selectedSubData.cr * 100).toFixed(1) }}%</span>
          <span class="chip">Конкуренция: {{ selectedSubData.comp }}</span>
        </div>
      </div>

      <div class="fg">
        <label class="fl">Регион показов</label>
        <select v-model.number="region">
          <option :value="1.45">Москва и МО</option>
          <option :value="1.2">Санкт-Петербург</option>
          <option :value="1.0">Крупный город (от 1 млн)</option>
          <option :value="0.72">Средний город (300 тыс. – 1 млн)</option>
          <option :value="0.52">Малый город (до 300 тыс.)</option>
          <option :value="1.15">Вся Россия</option>
        </select>
      </div>

      <div class="fg">
        <label class="fl">Месячный бюджет</label>
        <div class="budget-hero">
          <div class="bn">{{ budget.toLocaleString('ru') }} ₽</div>
          <div class="bd">~{{ dailyBudget }} ₽ в день</div>
        </div>
        <input
          type="range"
          min="5000" max="500000" step="5000"
          :value="budget"
          :style="{ '--pct': sliderPct }"
          @input="onSlider"
        >
        <div class="rl"><span>5 000 ₽</span><span>500 000 ₽</span></div>
      </div>

      <div class="fg">
        <label class="fl">Или введите точную сумму, ₽</label>
        <input type="number" :value="budget" min="1000" step="1000" placeholder="Например: 75 000" @input="onBudgetInput">
      </div>

      <div class="fg">
        <label class="fl">Конверсия сайта в лид, %</label>
        <input v-model.number="siteCR" type="number" min="0.1" max="50" step="0.1">
        <div class="hint">Среднее по рынку: 2–5%. Не знаете — оставьте 3%</div>
      </div>
    </AppCard>

    <AppCard title="Параметры бизнеса" icon="💰">
      <span class="opt-lbl">Необязательно — для расчёта ROMI и прибыли</span>

      <div class="fg">
        <label class="fl">Средний чек, ₽</label>
        <input v-model.number="avgCheck" type="number" min="0" step="100" placeholder="Например: 8 000">
      </div>
      <div class="fg">
        <label class="fl">Конверсия лида в продажу, %</label>
        <input v-model.number="leadToSale" type="number" min="1" max="100" step="1">
        <div class="hint">Как часто лид становится клиентом. Среднее: 20–30%</div>
      </div>
      <div class="fg">
        <label class="fl">Маржинальность, %</label>
        <input v-model.number="margin" type="number" min="1" max="100" step="1">
        <div class="hint">Доля прибыли в выручке. Для расчёта чистого ROI</div>
      </div>
      <div class="fg">
        <label class="fl">Среднее кол-во покупок клиента (LTV)</label>
        <input v-model.number="ltvRepeat" type="number" min="1" max="50" step="1">
        <div class="hint">Сколько раз клиент покупает за период. 1 = разовая покупка</div>
      </div>

      <AppButton @click="calculate">Рассчитать медиаплан →</AppButton>

      <div v-if="showError" class="calc-error">⚠️ Выберите категорию и подниш</div>
    </AppCard>
  </div>
</template>

<style scoped>
.calc-form { display: flex; flex-direction: column; gap: 1.2rem; }
.fg { margin-bottom: .95rem; }
.fl { display: block; font-size: .7rem; font-weight: 600; color: var(--ds-muted); margin-bottom: .4rem; text-transform: uppercase; letter-spacing: .05em; }
select, input[type="number"] { width: 100%; padding: .62rem .95rem; background: var(--inp-bg); border: 1.5px solid var(--inp-border); border-radius: 11px; font-size: .88rem; font-family: inherit; color: var(--ds-text); outline: none; transition: border-color .2s, box-shadow .2s; }
select:focus, input[type="number"]:focus { border-color: var(--ds-primary-dark); background: rgba(99,102,241,.08); box-shadow: inset 0 0 0 1.5px rgba(99,102,241,.4); }
select:disabled { opacity: .4; cursor: not-allowed; }
select option { background: var(--opt-bg); color: var(--ds-text); }
.budget-hero { text-align: center; padding: .75rem 0 .35rem; }
.bn { font-size: 2.3rem; font-weight: 900; letter-spacing: -.04em; line-height: 1; background: linear-gradient(135deg, var(--ds-primary), var(--ds-secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.bd { font-size: .73rem; color: var(--ds-muted); margin-top: .25rem; }
input[type="range"] { width: 100%; cursor: pointer; -webkit-appearance: none; height: 5px; border-radius: 3px; background: linear-gradient(90deg, var(--ds-primary-dark) 0%, var(--ds-primary-dark) var(--pct, 20%), rgba(255,255,255,.12) var(--pct, 20%)); margin-top: .45rem; outline: none; }
input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: linear-gradient(135deg, var(--ds-primary), var(--ds-secondary)); box-shadow: 0 0 8px rgba(99,102,241,.4); cursor: pointer; }
.rl { display: flex; justify-content: space-between; font-size: .67rem; color: var(--ds-dim); margin-top: .25rem; }
.hint { font-size: .7rem; color: var(--ds-dim); margin-top: .28rem; line-height: 1.5; }
.opt-lbl { text-align: center; font-size: .7rem; color: var(--ds-dim); border: 1px dashed rgba(255,255,255,.1); border-radius: 8px; padding: .25rem .7rem; margin-bottom: .85rem; display: block; }
.chips { display: flex; gap: .35rem; flex-wrap: wrap; margin-top: .45rem; }
.chip { background: rgba(129,140,248,.1); border: 1px solid rgba(129,140,248,.2); border-radius: 6px; padding: .15rem .5rem; font-size: .67rem; color: var(--ds-primary); font-weight: 600; white-space: nowrap; }
.search-inp { width: 100%; background: rgba(148,163,184,.08); border: 1px solid rgba(148,163,184,.15); border-radius: 8px; padding: .55rem .8rem; font-size: .82rem; color: var(--ds-text); font-family: inherit; box-sizing: border-box; outline: none; }
.search-drop { position: absolute; left: 0; right: 0; max-height: 260px; overflow-y: auto; background: var(--ds-card-bg); border: 1px solid rgba(148,163,184,.2); border-radius: 0 0 8px 8px; z-index: 50; box-shadow: 0 4px 12px rgba(0,0,0,.15); }
.search-item { padding: .5rem .8rem; cursor: pointer; font-size: .8rem; color: var(--ds-text); border-bottom: 1px solid rgba(148,163,184,.08); transition: background .15s; }
.search-item:hover { background: rgba(129,140,248,.12); }
.search-empty { padding: .5rem .8rem; font-size: .8rem; color: var(--ds-dim); }
.calc-error { margin-top: 10px; background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.3); border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #fca5a5; text-align: center; }
</style>
