<script setup lang="ts">
import moment from 'moment';
import { useSiteList } from '~/composables/api/useSiteList';

//----------------------------------------------------------------
// Composables
//----------------------------------------------------------------
const { sites } = await useSiteList();

//----------------------------------------------------------------
// Functions
//----------------------------------------------------------------
function formatDuration(duration: string): string {
  if (window.navigator.language.startsWith('ja')) {
    const md = moment.duration(duration);
    return [
      md.years() ? `${md.years()}年` : '',
      md.months() ? `${md.months()}月` : '',
      md.days() ? `${md.days()}日` : '',
      md.hours() ? `${md.hours()}時間` : '',
      md.minutes() ? `${md.minutes()}分` : '',
      md.seconds() ? `${md.seconds()}秒` : '',
    ].join('');
  } else {
    return moment.duration(duration).humanize();
  }
}

</script>

<template>
  <Suspense>
    <div>
      <div class="head_border">
      </div>

      <article class="content content-about">
        <main class="content__main content-about__main">
          <div class="content-about__head">
            <h1 class="level1-heading_detail">サイト一覧</h1>
          </div>
          <section class="content-about__item">
            <div class="content-about__item__inner">
              <template v-for="(s, index) in sites" :key="index">
                <h3 class="level3-heading_dataset">{{ s.title }}</h3>
                <table class="dataset__table dataset__main">
                  <tbody>
                    <tr>
                      <th>URL</th>
                      <td><a :href="s.dataset_url" target="_blank">{{ s.dataset_url }}</a></td>
                    </tr>
                    <tr>
                      <th>差分更新頻度</th>
                      <td>
                        <ClientOnly>
                          {{ s.update_interval ? formatDuration(s.update_interval) : "なし" }}
                          <template #fallback>
                            {{ s.update_interval }}
                          </template>
                        </ClientOnly>
                      </td>
                    </tr>
                    <tr>
                      <th>全更新頻度</th>
                      <td>
                        <ClientOnly>
                          {{ s.full_update_interval ? formatDuration(s.full_update_interval) : "なし" }}
                          <template #fallback>
                            {{ s.full_update_interval }}
                          </template>
                        </ClientOnly>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </template>
            </div>
          </section>
        </main>
      </article>
    </div>
  </Suspense>
</template>

<style lang="css" scoped>
.dataset__table a {
    color: #EA5449;
}
.dataset__table a:hover {
    text-decoration: underline;
}
</style>