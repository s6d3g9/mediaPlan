<script setup lang="ts">
import type { CalculationResult } from '../../../entities/calculator/model/types'
import type { GeneratedCampaign } from '../../../entities/calculator/data/campaignGenerator'

const props = defineProps<{
  result: CalculationResult
  campaign: GeneratedCampaign
}>()

const MNF = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']

function fmt(n: number): string {
  if (n < 0) return '−' + fmt(-n)
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.', ',') + ' млн'
  if (n >= 1e4) return Math.round(n / 1e3) + ' тыс.'
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace('.', ',') + ' тыс.'
  return Math.round(n).toLocaleString('ru')
}

async function exportXLSX() {
  const d = props.result
  const camp = props.campaign
  try {
    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()

    const overview: unknown[][] = [
      ['МЕДИАПЛАН: ' + d.n.name],
      ['Категория', d.catName],
      ['Дата', new Date().toLocaleDateString('ru')],
      [],
      ['Бюджет/мес', d.budget],
      ['Средний CPC', Math.round(d.cAvg)],
      ['CPC диапазон', Math.round(d.cMin) + ' – ' + Math.round(d.cMax)],
      ['Кликов/мес (прогноз)', d.clAvg],
      ['Лидов/мес (прогноз)', d.ldAvg],
      ['CPL (прогноз)', Math.round(d.cplAvg)],
      ['Конверсия сайта', (d.siteCR * 100).toFixed(1) + '%'],
      ['Бюджет Поиск', d.sB],
      ['Бюджет РСЯ', d.rB],
    ]
    if (d.rD) {
      overview.push([], ['Продаж/мес', d.rD.s], ['Выручка', d.rD.rev], ['Маржа', d.rD.margin], ['Прибыль', d.rD.profit], ['ROMI', Math.round(d.rD.romi) + '%'])
    }
    const ws1 = XLSX.utils.aoa_to_sheet(overview)
    ws1['!cols'] = [{ wch: 25 }, { wch: 30 }]
    XLSX.utils.book_append_sheet(wb, ws1, 'Обзор')

    const kwRows: unknown[][] = [['Ключевое слово', 'Тип соответствия', 'Группа', 'Частотность/мес', 'Тип кампании']]
    camp.groups.forEach(g => {
      g.keys.forEach(k => {
        kwRows.push([k.kw, k.match, g.name, k.vol, g.type === 'rsy' ? 'РСЯ' : 'Поиск'])
      })
    })
    const ws2 = XLSX.utils.aoa_to_sheet(kwRows)
    ws2['!cols'] = [{ wch: 40 }, { wch: 15 }, { wch: 35 }, { wch: 15 }, { wch: 10 }]
    XLSX.utils.book_append_sheet(wb, ws2, 'Ключевые слова')

    const negRows: unknown[][] = [['Минус-слово']]
    camp.negatives.forEach(n => negRows.push([n]))
    const ws3 = XLSX.utils.aoa_to_sheet(negRows)
    ws3['!cols'] = [{ wch: 35 }]
    XLSX.utils.book_append_sheet(wb, ws3, 'Минус-слова')

    const adRows: unknown[][] = [['Тип','Вариант','Заголовок 1','Заголовок 2','Текст','Ссылка 1','Ссылка 2','Ссылка 3','Ссылка 4']]
    camp.ads.search.forEach((a, i) => adRows.push(['Поиск', 'Вариант ' + (i + 1), a.t1, a.t2, a.desc, ...a.sl]))
    camp.ads.rsy.forEach((a, i) => adRows.push(['РСЯ', 'Вариант ' + (i + 1), a.t1, a.t2, a.desc, ...a.sl]))
    const ws4 = XLSX.utils.aoa_to_sheet(adRows)
    ws4['!cols'] = [{ wch: 8 }, { wch: 12 }, { wch: 35 }, { wch: 35 }, { wch: 60 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }]
    XLSX.utils.book_append_sheet(wb, ws4, 'Объявления')

    const seaRows: unknown[][] = [['Месяц', 'Коэффициент спроса', 'Рекомендуемый бюджет']]
    d.n.season.forEach((s, i) => { seaRows.push([MNF[i], s, Math.round(d.budget * s)]) })
    const ws5 = XLSX.utils.aoa_to_sheet(seaRows)
    ws5['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 22 }]
    XLSX.utils.book_append_sheet(wb, ws5, 'Сезонность')

    XLSX.writeFile(wb, 'mediaplan_' + d.catKey + '_' + d.n.name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_') + '.xlsx')
  } catch (e) {
    console.error('XLSX export error:', e)
  }
}

function doPrint() {
  if (typeof window !== 'undefined') window.print()
}
</script>

<template>
  <div class="export-btns">
    <button class="ebtn green" @click="exportXLSX">📊 Скачать XLSX</button>
    <button class="pbtn" @click="doPrint">🖨️ Выгрузить PDF</button>
  </div>
</template>

<style scoped>
.export-btns { display: flex; gap: .5rem; margin-top: .7rem; flex-wrap: wrap; }
.ebtn { background: rgba(148,163,184,.1); border: 1px solid rgba(148,163,184,.18); border-radius: 8px; padding: .45rem .85rem; font-size: .74rem; font-weight: 600; cursor: pointer; transition: all .2s; color: var(--ds-text); font-family: inherit; flex: 1; }
.ebtn:hover { background: rgba(148,163,184,.18); }
.ebtn.green { background: rgba(52,211,153,.1); border-color: rgba(52,211,153,.25); color: #34d399; }
.ebtn.green:hover { background: rgba(52,211,153,.18); }
.pbtn { flex: 1; padding: .75rem; background: transparent; color: var(--ds-primary); border: 1.5px solid rgba(129,140,248,.35); border-radius: 11px; font-size: .88rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: background .2s, border-color .2s; }
.pbtn:hover { background: rgba(99,102,241,.08); border-color: var(--ds-primary); }
</style>
