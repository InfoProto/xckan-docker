import type { RouterOptions } from '@nuxt/schema';

export default {
  scrollBehavior: async (to, from, savedPosition) => {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
} satisfies RouterOptions;