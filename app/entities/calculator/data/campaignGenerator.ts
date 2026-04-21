import type { SubnicheData } from '../model/types'
import { NEG_BASE, NEG_CAT } from './negatives'
import { AD_TEMPLATES } from './adTemplates'

export interface CampaignKey { kw: string; match: string; vol: number }
export interface CampaignGroup { name: string; type: 'search' | 'rsy'; desc?: string; keys: CampaignKey[] }
export interface AdVariant { t1: string; t2: string; desc: string; sl: string[] }
export interface GeneratedAds { search: AdVariant[]; rsy: AdVariant[] }
export interface GeneratedCampaign { groups: CampaignGroup[]; negatives: string[]; ads: GeneratedAds }

function estimateVol(cpcMin: number, cpcMax: number, comp: string, keyIdx: number): number {
  const cm: Record<string, number> = { 'Низкая': 4000, 'Средняя': 8000, 'Высокая': 14000, 'Очень высокая': 20000, 'Максимальная': 28000 }
  const base = (cm[comp] || 8000) + Math.round((cpcMax - cpcMin) * 8)
  const decay = 1 / (1 + keyIdx * 0.45)
  return Math.round(base * decay / 100) * 100
}

function expandKeys(baseKeys: string[], _nicheName: string): string[] {
  const result = [...baseKeys]
  const modifiers: Array<(k: string) => string> = [
    k => k + ' недорого',
    k => k + ' [город]',
    k => k + ' отзывы',
    k => k + ' акции',
    k => k.replace(/цена|стоимость/i, 'прайс'),
    k => k + ' под ключ',
    k => 'заказать ' + k.replace(/купить |заказать |записаться /i, ''),
    k => 'лучший ' + k.replace(/купить |заказать |лучший /i, ''),
    k => k + ' гарантия',
    k => k + ' в [город]',
  ]
  const seen = new Set(baseKeys.map(k => k.toLowerCase()))
  let modIdx = 0
  while (result.length < 12 && modIdx < modifiers.length) {
    for (let i = 0; i < baseKeys.length && result.length < 12; i++) {
      const nk = modifiers[modIdx](baseKeys[i])
      const lk = nk.toLowerCase()
      if (!seen.has(lk) && nk.length > 5) {
        seen.add(lk)
        result.push(nk)
      }
    }
    modIdx++
  }
  return result.slice(0, 12)
}

function tr(s: string, mx: number): string {
  s = s.replace(/\s+/g, ' ').trim()
  if (s.length <= mx) return s
  let t = s.slice(0, mx)
  const li = t.lastIndexOf(' ')
  return (li > mx * 0.5 ? t.slice(0, li) : t).trim()
}

export function generateAds(n: SubnicheData, catKey: string): GeneratedAds {
  const price = Math.round(n.cpcMin * 4)
  const nm = n.name
  const nmL = nm.toLowerCase()
  const tpl = AD_TEMPLATES[catKey] || AD_TEMPLATES['_default']
  const priceStr = 'от ' + price.toLocaleString('ru') + ' ₽'
  const ratingNum = '4.' + Math.floor(Math.random() * 2 + 8)
  const revCount = Math.floor(Math.random() * 2000 + 800)
  const ks = n.keys || []
  const clean = (s: string) => (s || '').replace(/\[город\]/g, '').trim()
  const kw1 = clean(ks[0]) || nm
  const kw2 = clean(ks[1]) || kw1
  const kw3 = clean(ks[2]) || kw2
  const kw4 = clean(ks[3]) || nm
  const kw5 = clean(ks[4]) || kw1
  const cap = (s: string) => (s || '').charAt(0).toUpperCase() + (s || '').slice(1)
  const disc = Math.floor(Math.random() * 10 + 10)
  const o = tpl.offers
  const c = tpl.cta

  return {
    search: [
      { t1: tr(cap(kw1) + ' — ' + priceStr, 52), t2: tr(o[0], 30), desc: tr(cap(kw1) + ' ' + priceStr + '. ' + o[0] + '. Заявка онлайн!', 81), sl: tpl.sl[0] },
      { t1: tr(cap(kw2) + ' ★' + ratingNum + ' · отзывы', 52), t2: tr(o[2], 30), desc: tr(revCount + '+ клиентов доверяют нам. ' + o[2] + '. Смотрите!', 81), sl: tpl.sl[1] },
      { t1: tr(cap(kw3) + ' · ' + o[1].toLowerCase(), 52), t2: tr(cap(c[0]), 30), desc: tr(o[3] + '. ' + cap(c[0]) + ' — выгодные условия!', 81), sl: tpl.sl[0] },
      { t1: tr(cap(kw4) + ' со скидкой ' + disc + '%', 52), t2: tr(cap(c[1]), 30), desc: tr('−' + disc + '% на «' + nmL + '». ' + o[1] + '. ' + cap(c[1]) + '!', 81), sl: tpl.sl[1] },
      { t1: tr(cap(kw5) + ' в [городе] — выгодно', 52), t2: tr(o[3], 30), desc: tr(cap(kw5) + ' рядом. ' + o[3] + '. Подробнее на сайте!', 81), sl: tpl.sl[0] },
    ],
    rsy: [
      { t1: tr('Ищете ' + nmL + '?', 52), t2: tr(priceStr + ' · ' + o[0], 30), desc: tr(o[0] + ', ' + o[1].toLowerCase() + '. ' + revCount + '+ клиентов!', 81), sl: tpl.rsySl[0] },
      { t1: tr(nm + ' · ' + o[2].toLowerCase(), 52), t2: tr(cap(c[0]) + ' со скидкой', 30), desc: tr('−' + disc + '% на «' + nmL + '». ' + o[3] + '. ' + cap(c[0]) + '!', 81), sl: tpl.rsySl[1] },
      { t1: tr('Устали переплачивать за ' + nmL + '?', 52), t2: tr('Честная цена · выгодно', 30), desc: tr('Честная цена ' + priceStr + '. ' + cap(c[1]) + ' без переплат!', 81), sl: tpl.rsySl[0] },
    ]
  }
}

export function generateCampaign(n: SubnicheData, catKey: string, _budget: number, _cAvg: number, _rm: number): GeneratedCampaign {
  const keys = expandKeys(n.keys, n.name)
  const negBase = NEG_BASE.slice()
  const negCat = NEG_CAT[catKey] || []
  const allNeg = [...new Set([...negBase, ...negCat])]
  const groups: CampaignGroup[] = []

  const used = new Set<string>()
  const hot = keys.filter(k => /цена|купить|заказать|запись|стоимость|срочно|вызов|забронировать|прайс|под ключ/i.test(k))
  hot.forEach(k => used.add(k))
  const geo = keys.filter(k => !used.has(k) && /\[город\]|выезд|в москве|в спб/i.test(k))
  geo.forEach(k => used.add(k))
  const price = keys.filter(k => !used.has(k) && /недорого|акци|скидк/i.test(k))
  price.forEach(k => used.add(k))
  const trust = keys.filter(k => !used.has(k) && /гарантия|отзывы|лучший/i.test(k))
  trust.forEach(k => used.add(k))
  const warm = keys.filter(k => !used.has(k))

  if (hot.length) groups.push({ name: '🔥 Горячие (транзакционные)', type: 'search', desc: 'Человек уже готов к покупке. Максимальные ставки, точное соответствие.', keys: hot.map((k, i) => ({ kw: k, match: 'Фраза', vol: estimateVol(n.cpcMin, n.cpcMax, n.comp, i) })) })
  if (warm.length) groups.push({ name: '🌡️ Тёплые (информационно-коммерческие)', type: 'search', desc: 'Человек изучает варианты. Средние ставки, ведём на подробную страницу.', keys: warm.map((k, i) => ({ kw: k, match: 'Фраза', vol: estimateVol(n.cpcMin, n.cpcMax, n.comp, hot.length + i) })) })
  if (geo.length) groups.push({ name: '📍 Гео-запросы (локальный спрос)', type: 'search', desc: 'Люди ищут рядом с собой. Обязательно настроить геотаргетинг в кампании.', keys: geo.map((k, i) => ({ kw: k, match: 'Фраза', vol: Math.round(estimateVol(n.cpcMin, n.cpcMax, n.comp, i + 3) * 0.7) })) })
  if (price.length) groups.push({ name: '💸 Ценовые (бюджетная аудитория)', type: 'search', desc: 'Ищут дешевле. Нужна отдельная посадочная с акцией/скидкой/рассрочкой.', keys: price.map((k, i) => ({ kw: k, match: 'Фраза', vol: Math.round(estimateVol(n.cpcMin, n.cpcMax, n.comp, i + 4) * 0.5) })) })
  if (trust.length) groups.push({ name: '⭐ Репутационные (доверие)', type: 'search', desc: 'Человек сравнивает. Нужны отзывы, рейтинг, портфолио на посадочной.', keys: trust.map((k, i) => ({ kw: k, match: 'Фраза', vol: Math.round(estimateVol(n.cpcMin, n.cpcMax, n.comp, i + 5) * 0.4) })) })

  const rsyKeys = keys.filter((_, i) => i % 2 === 0).slice(0, 6)
  const retKeys = keys.filter((_, i) => i % 2 === 1).slice(0, 4)
  groups.push({ name: '📢 РСЯ — новая аудитория', type: 'rsy', desc: 'Показы на сайтах-партнёрах людям, которые вас ещё не знают. Широкий охват.', keys: rsyKeys.map((k, i) => ({ kw: k, match: 'Широкая', vol: estimateVol(n.cpcMin, n.cpcMax, n.comp, i) })) })
  groups.push({ name: '🔁 РСЯ — ретаргетинг (возврат)', type: 'rsy', desc: 'Показы только тем, кто уже был на сайте. Настройте сегмент в Метрике: визит >30 сек, без конверсии.', keys: retKeys.map((k, i) => ({ kw: k + ' (ретаргетинг)', match: 'Аудитория', vol: Math.round(estimateVol(n.cpcMin, n.cpcMax, n.comp, i) * 0.15) })) })

  return { groups, negatives: allNeg, ads: generateAds(n, catKey) }
}
