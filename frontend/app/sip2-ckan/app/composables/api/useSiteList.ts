import type { Site } from "~/types/site";

//----------------------------------------------------------------
// Composables
//----------------------------------------------------------------
export const useSiteList = async () => {
  const { data } = await useApi<Site[]>('/site_list');

  return {
    sites: data,
  }
}
