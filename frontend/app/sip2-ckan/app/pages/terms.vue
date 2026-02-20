<script setup lang="ts">

const { data: page } = await useAsyncData('terms', () => {
  return queryCollection('content').path('/terms').first();
})

</script>

<template>
  <div>
    <div class="head_border">
    </div>

    <article class="content content-about">
      <main class="content__main content-about__main">
        <div class="content-about__head">
          <h1 class="level1-heading_detail">{{ page?.title }}</h1>
        </div>
        <section class="content-about__item">
          <div class="content-about__item__inner">
            <ContentRenderer v-if="page" :value="page" />
          </div>
        </section>
      </main>
    </article>
  </div>
</template>