import { TemplateParamsPlugin } from '@unhead/vue/plugins'

// Unhead plugins must be specified explicitly in Nuxt 4.
// https://nuxt.com/docs/4.x/getting-started/upgrade#unhead-v2
export default defineNuxtPlugin({
  setup() {
    const unhead = injectHead();
    unhead.use(TemplateParamsPlugin)
  }
})