<script setup lang="ts">
import moment from 'moment';
import type { Dataset, Resource } from '~/types/dataset';

const props = withDefaults(defineProps<{
  dataset: Dataset,
  aggregation?: boolean
}>(), {
  aggregation: false
});

const dtfmt = (s: string): string => {
  return moment(s).utcOffset("+09:00").format("YYYY/MM/DD HH:mm:ss");
}

const hasImage = computed((): boolean => {
  let url = props.dataset.organization?.image_url

  if (url) {
    return url.startsWith("http://") || url.startsWith("https://")
  } else {
    return false
  }
})

const formats = computed((): string => {
  return props.dataset.resources.reduce((acc: Array<string>, r: Resource) => {
    if (r.format && !acc.includes(r.format!)) {
      acc.push(r.format!)
    }
    return acc;
  }, []).join(", ");
})
</script>

<template>
  <li class="result__item">
    <nuxt-link :to="{ name: 'datasets-id', params: { id: dataset.xckan_id } }" class="result__link">
      <h3 class="level3-heading_result">{{ dataset.xckan_title }}</h3>
      <div v-if="hasImage" class="result__org-logo">
        <img :src="dataset.organization?.image_url" />
      </div>
      <div class="result__source">{{ dataset.xckan_site_name }}</div>
      <div class="result__description">{{ dataset.xckan_description.length < 512 ? dataset.xckan_description :
        dataset.xckan_description.substring(0, 512) + "..." }} </div>
          <div class="result__meta">
            <div class="result__date">最終更新日: {{ dtfmt(dataset.xckan_last_updated) }}</div>
            <div class="result__file">
              <i class="fas fa-file"></i> : {{ formats }}
            </div>
          </div>
    </nuxt-link>
    <div v-if="aggregation" class="aggregation"><a href="" class="btn-circle-3d"
        @click.prevent.stop="$emit('show-aggregation')">+</a></div>
  </li>
</template>