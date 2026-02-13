import type { UseFetchOptions } from "#app";

const BACKEND_API_BASE_URL = "https://search.ckan.jp/backend/api";
const FRONTEND_WEB_BASE_URL = "https://search.ckan.jp";

export function useUrls() {
  const config = useRuntimeConfig();

  return {
    backend: (config.backendApiBaseUrl || config.public.backendApiBaseUrl || BACKEND_API_BASE_URL) as string,
    frontend: (config.public.frontendWebBaseUrl || FRONTEND_WEB_BASE_URL) as string,
  }
}

export function useApi<T>(
  url: string | (() => string),
  options?: UseFetchOptions<T>,
) {
  const urls = useUrls();

  return useFetch(url, {
    baseURL: urls.backend,
    ...options,
  })
}