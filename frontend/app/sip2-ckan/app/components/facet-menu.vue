<script setup lang="ts">
import { useDataset, useSearch, useSearchResult } from '~/composables/api/useDataset';
import type { Facet } from '~/types/dataset';

const props = defineProps<{
  facet: Facet,
}>();

const result = await useSearchResult();
const collapses = ref<[boolean, boolean, boolean, boolean]>([false, false, false, false]);

function sortFacets(facets: [string, number][], used: string[], onlySelected: boolean): [string, number, boolean][] {
  let acc: [Array<[string, number, boolean]>, Array<[string, number, boolean]>] = [[], []]

  acc = facets.reduce((a, v) => {
    if (used.includes(v[0])) {
      a[0].push([v[0], v[1], true])
    } else {
      a[1].push([v[0], v[1], false])
    }
    return a
  }, acc)

  return (onlySelected && acc[0].length > 0) ? acc[0] : acc[0].concat(acc[1])
}

function toFacets(values: any[]): [string, number][] {
   let m = new Array<[string, number]>()

   for (let i = 0; i < values.length; i += 2) {
      m.push([values[i] as string, values[i + 1] as number])
   }

   return m
}

const organizations = computed((): [string, number, boolean][] => {
  return sortFacets(toFacets(props.facet.organization), result.value.usedFacets.get("organization") ?? [], true)
})

const sites = computed((): [string, number, boolean][] => {
  return sortFacets(toFacets(props.facet.xckan_site_name), result.value.usedFacets.get("site") ?? [], true)
})

const tags = computed((): [string, number, boolean][] => {
  return sortFacets(toFacets(props.facet.tags), result.value.usedFacets.get("tag") ?? [], false)
})

const formats = computed((): [string, number, boolean][] => {
  return sortFacets(toFacets(props.facet.res_format), result.value.usedFacets.get("format") ?? [], false)
})

const toggleFacet = (index: number) => {
  // タプルの要素更新ではビューに反映されない。代入しなおす。
  let clps: [boolean, boolean, boolean, boolean] = [...collapses.value];
  clps[index] = !clps[index];

  collapses.value = clps;
}

</script>

<template>
  <aside class="content__side">
    <section class="filter">
      <div class="filter__header">
        <h2 class="level2-heading_filter-head"><i class="fas fa-filter"></i>検索条件</h2>
        <a href="" class="filter__clear" @click.prevent.stop="$emit('clear-facet')">条件クリア ×</a>
      </div>
      <div class="filter__content filter__org">
        <div class="filter__content-head"><i class="fas fa-building"></i>組織</div>
        <ul class="filter__list">
          <li class="filter__item" :class="{ active: o[2] }" v-for="(o, i) in organizations" :key="i"
            v-show="i < 5 || collapses[0]">
            <a v-if="o[2]" href="" @click.prevent.stop="$emit('remove-facet', 'organization', o[0])">{{ o[0]
              }}&nbsp;<span>({{ o[1] }})</span></a>
            <a v-else href="" @click.prevent.stop="$emit('add-facet', 'organization', o[0])">{{ o[0] }}&nbsp;<span>({{
                o[1] }})</span></a>
          </li>
        </ul>
        <p v-if="organizations.length > 0 && !organizations[0]![2]" class="text-right">
          <a href="" class="viewall" @click.stop.prevent="toggleFacet(0)">
            <span v-if="!collapses[0]">全て表示</span>
            <span v-else>データが多い組織だけ表示する</span>
          </a>
        </p>
      </div>
      <div class="filter__content filter__org">
        <div class="filter__content-head"><i class="fas fa-window-maximize"></i>サイト名</div>
        <ul class="filter__list">
          <li class="filter__item" :class="{ active: s[2] }" v-for="(s, i) in sites" :key="i"
            v-show="i < 5 || collapses[1]">
            <a v-if="s[2]" href="" @click.prevent.stop="$emit('remove-facet', 'site', s[0])">{{ s[0] }}&nbsp;<span>({{
                s[1] }})</span></a>
            <a v-else href="" @click.prevent.stop="$emit('add-facet', 'site', s[0])">{{ s[0] }}&nbsp;<span>({{ s[1]
                }})</span></a>
          </li>
        </ul>
        <p v-if="sites.length > 0 && !sites[0]![2]" class="text-right">
          <a href="" class="viewall" @click.stop.prevent="toggleFacet(1)">
            <span v-if="!collapses[1]">全て表示</span>
            <span v-else>データが多いサイト名だけ表示する</span>
          </a>
        </p>
      </div>
      <div class="filter__content filter__tag">
        <div class="filter__content-head"><i class="fas fa-tag"></i>タグ<span>(複数選択可)</span></div>
        <ul class="filter__list">
          <li class="filter__item" :class="{ active: t[2] }" v-for="(t, i) in tags" :key="i"
            v-show="i < 5 || collapses[2]">
            <a v-if="t[2]" href="" @click.prevent.stop="$emit('remove-facet', 'tag', t[0])">{{ t[0] }}&nbsp;<span>({{
                t[1] }})</span></a>
            <a v-else href="" @click.prevent.stop="$emit('add-facet', 'tag', t[0])">{{ t[0] }}&nbsp;<span>({{ t[1]
                }})</span></a>
          </li>
        </ul>
        <p class="text-right">
          <a href="" class="viewall" @click.stop.prevent="toggleFacet(2)">
            <span v-if="!collapses[2]">全て表示</span>
            <span v-else>多いタグだけ表示する</span>
          </a>
        </p>
      </div>
      <div class="filter__content filter__tag">
        <div class="filter__content-head"><i class="fas fa-file"></i>ファイル形式<span>(複数選択可)</span></div>
        <ul class="filter__list">
          <li class="filter__item" :class="{ active: f[2] }" v-for="(f, i) in formats" :key="i"
            v-show="i < 5 || collapses[3]">
            <a v-if="f[2]" href="" @click.prevent.stop="$emit('remove-facet', 'format', f[0])">{{ f[0] }}&nbsp;<span>({{
                f[1] }})</span></a>
            <a v-else href="" @click.prevent.stop="$emit('add-facet', 'format', f[0])">{{ f[0] }}&nbsp;<span>({{ f[1]
                }})</span></a>
          </li>
        </ul>
        <p class="text-right">
          <a href="" class="viewall" @click.stop.prevent="toggleFacet(3)">
            <span v-if="!collapses[3]">全て表示</span>
            <span v-else>上位のファイル形式のみ表示する</span>
          </a>
        </p>
      </div>
    </section>
  </aside>
</template>