<script setup lang="ts">
import { useHotTags, useSearch } from '~/composables/api/useDataset'
import type { Dataset, FacetKey } from '~/types/dataset'
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'

//----------------------------------------------------------------
// Types
//----------------------------------------------------------------
type PageItem = "<<" | "<" | number | ">" | ">>"
type AggregationType = "no" | "same" | "similar"

class Series {
  constructor(
    private datasets: Array<Dataset>
  ) { }

  get title(): string {
    return this.datasets[0]?.xckan_title ?? "";
  }

  get children(): Array<Dataset> {
    return this.datasets.slice(1)
  }
}

//----------------------------------------------------------------
// Variables
//----------------------------------------------------------------
const aggregationType = useState<AggregationType>(() => "no" as AggregationType);
const aggregationIndex = useState<number | null>(() => null);

//----------------------------------------------------------------
// Composables
//----------------------------------------------------------------
const { query, result, search, putFacet, delFacet, resetFacets, setPage } = await useSearch();
const { hotTags, refresh: refreshTags } = await useHotTags();

//----------------------------------------------------------------
// View models
//----------------------------------------------------------------
const datasets = computed<Dataset[]>(() => result.value.datasets)
const similarSeries = computed(() => result.value.similarSeries)
const sameSeries = computed(() => result.value.sameSeries)
const facet = computed(() => result.value.facets) // TODO: facet -> facets
const total = computed(() => result.value.total)

const selectedSeries = computed(() => {
  let series: Dataset[] = []

  if (aggregationIndex.value != null) {
    if (aggregationType.value == "similar") {
      series = similarSeries.value[aggregationIndex.value] ?? [];
    } else if (aggregationType.value == "same") {
      series = sameSeries.value[aggregationIndex.value] ?? [];
    }
  }
  return new Series(series)
})

const usedFacets = computed(() => {
  let facets: Array<[FacetKey, string]> = []

  for (let [k, values] of result.value.usedFacets.entries()) {
    for (const v of values) {
      facets.push([k, v])
    }
  }

  return facets
})

const pager = computed<Array<[PageItem, number, boolean]>>(() => {
  let current = query.value.page;
  let limit = query.value.limit;
  let length = 10
  let lhs = Math.floor((length - 1) / 2)
  let rhs = length - 1 - lhs

  let pages: Array<[PageItem, number, boolean]> = []

  let maxPage = Math.floor(total.value / limit) + (total.value % limit == 0 ? 0 : 1)

  if (maxPage <= 1) {
    return []
  }

  if (current - lhs >= 3) {
    pages.push(["<<", 1, false])
  }
  if (current - lhs >= 2) {
    pages.push(["<", current - 1, false])
  }

  let begin = Math.max(1, current - lhs)
  let end = Math.min(maxPage, current + rhs)

  for (let p = begin; p <= end; p++) {
    pages.push([p, p, p == current])
  }

  if (maxPage - (current + rhs) >= 1) {
    pages.push([">", current + 1, false])
  }
  if (maxPage - (current + rhs) >= 2) {
    pages.push([">>", maxPage, false])
  }

  return pages
})

//----------------------------------------------------------------
// Functions
//----------------------------------------------------------------
const addFacet = async (key: FacetKey, value: string) => {
  putFacet(key, value);
  setPage(1);
  await search();
}

const removeFacet = async (key: FacetKey, value: string) => {
  delFacet(key, value);
  setPage(1);
  await search();
}

const clearFacet = async () => {
  resetFacets();
  setPage(1);
  await search();
}

const changePage = async (page: number) => {
  setPage(page);
  await search();
}

onMounted((hook: any) => {
  /*-- モーダルを表示した場合はこれを実行。 */
  // https://github.com/willmcpo/body-scroll-lock
  // let modal = document.querySelector('.modal-content')
  // disableBodyScroll(modal!)
  /*-- モーダルを解除した場合はこれを実行 */
  clearAllBodyScrollLocks();
})

const showAggregation = (index: number) => {
  aggregationIndex.value = index
  let modal = document.querySelector('.modal-content')
  disableBodyScroll(modal!)
}

const hideAggregation = () => {
  aggregationIndex.value = null
  clearAllBodyScrollLocks()
}
</script>

<template>
  <div>
    <section id="search" class="search">
      <div class="search__inner">
        <div class="search__form">
          <form id="top__search__form" action="" v-on:submit.prevent.stop="search">
            <input v-model="query.keyword" id="search__box" class="search__box" name="search__box" type="text"
              placeholder="データセットを検索" />
            <button class="search__btn" aria-label="検索" type="button" @click="search">
              <i class="fas fa-search"></i>
            </button>
          </form>
        </div>
      </div>
    </section>

    <section id="result-head" class="result-head">
      <div class="result-head__inner">
        <div class="result-head__message"><span>{{ total }}</span>件のデータが見つかりました​</div>
        <div class="result-head__sort">
          <div class="result-head__sort__item">
            <select v-model="query.sortType" v-on:change="search">
              <option value="relevance">関連度の高い順</option>
              <option value="last_update">更新日</option>
            </select>
          </div>
          <div class="result-head__sort__item">
            <select v-model="query.limit" v-on:change="search">
              <option value="50">50件</option>
              <option value="100">100件</option>
              <option value="200">200件</option>
              <option value="500">500件</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <section class="result-aggregate">
      <div class="switch">
        <input id="no-aggregate" type="radio" class="agg-select" name="agg-select" value="no"
          v-model="aggregationType" />
        <label for="no-aggregate">個別表示</label>&nbsp;
        <input id="similar-aggregate" type="radio" class="agg-select" name="agg-select" value="similar"
          v-model="aggregationType" />
        <label for="similar-aggregate">シリーズをグループ化</label>&nbsp;
        <input id="same-aggregate" type="radio" class="agg-select" name="agg-select" value="same"
          v-model="aggregationType" />
        <label for="same-aggregate">重複結果をグループ化</label>&nbsp;
      </div>
    </section>

    <div class="content content-has-column">
      <FacetMenu :facet="facet" v-on:add-facet="addFacet" v-on:remove-facet="removeFacet"
        v-on:clear-facet="clearFacet" />
      <main class="content__main">
        <ul class="filtered">
          <li v-for="kv in usedFacets" :key="`${kv[0]}_${kv[1]}`" class="filtered__item">{{ kv[1] }}
            <a href="#" class="filtered__remove" title="削除" @click="removeFacet(kv[0], kv[1])"><i
                class="fas fa-times"></i></a>
          </li>
        </ul>
        <ul class="result">
          <template v-if="aggregationType == 'similar'">
            <template v-for="(ds, index) in similarSeries" :key="`${ds[0]!.xckan_id}_series`">
              <DatasetItem :dataset="ds[0]!" :aggregation="ds.length > 1"
                v-on:show-aggregation="showAggregation(index)" />
            </template>
          </template>
          <template v-else-if="aggregationType == 'same'">
            <template v-for="(ds, index) in sameSeries" :key="`${ds[0]!.xckan_id}_series`">
              <DatasetItem :dataset="ds[0]!" :aggregation="ds.length > 1"
                v-on:show-aggregation="showAggregation(index)" />
            </template>
          </template>
          <template v-else>
            <DatasetItem v-for="(d, index) in datasets" :key="`${d.xckan_id}_${index}`" :dataset="d" />
          </template>
        </ul>

        <nav class="pager">
          <ul class="pager__inner">
            <li v-for="p in pager" :key="p[0]" class="pager__item">
              <a class="pager__link" :class="{ pager__link__active: p[2] }" href=""
                @click.prevent.stop="changePage(p[1])">
                <template v-if="p[0] == '<<'"><i class="fas fa-angle-double-left"></i></template>
                <template v-else-if="p[0] == '<'"><i class="fas fa-angle-left"></i></template>
                <template v-else-if="p[0] == '>'"><i class="fas fa-angle-right"></i></template>
                <template v-else-if="p[0] == '>>'"><i class="fas fa-angle-double-right"></i></template>
                <template v-else>{{ p[0] }}</template>
              </a>
            </li>
          </ul>
        </nav>
      </main>
    </div>

    <div v-show="aggregationIndex !== null" class="modal-bg">
      <div class="modal-container">
        <div class="modal-header">
          <div class="title">{{ selectedSeries.title }}</div>
          <a href="" class="close" @click.prevent.stop="hideAggregation">×</a>
        </div>
        <div class="modal-content">
          <ul class="result">
            <DatasetItem v-for="(d, index) in selectedSeries.children" :key="`${d.xckan_id}_${index}`" :dataset="d" />
          </ul>
        </div>
      </div>
    </div>

  </div>

</template>

<style lang="css" scoped>
.result-head__sort__item option {
  color: #333333;
}
</style>