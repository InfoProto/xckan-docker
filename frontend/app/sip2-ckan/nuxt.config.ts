// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  devServer: {
    port: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 3000,
    host: process.env.SERVER_HOST || '0.0.0.0',
  },

  app: {
    head: {
      title: 'データカタログ横断検索システム',
      titleTemplate: '%s - %siteName',
      templateParams: {
        siteName: 'データカタログ横断検索システム',
        separator: '-'
      },
      meta: [
        {
          charset: "utf-8"
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, shrink-to-fit=no"
        },
        {
          name: "description",
          content: "データカタログ横断システムはSIP NIIコンソーシアムが開発したオープンデータに係る情報検索サイトです。"
        },
        {
          name: "keywords",
          content: "CKAN,オープンデータ,SIP,NII"
        },
        {
          property: "og:title",
          content: "データカタログ横断システム"
        },
        {
          property: "og:url",
          content: "https://search.ckan.jp"
        },
        {
          property: "og:description",
          content: "データカタログ横断システムはSIP NIIコンソーシアムが開発したオープンデータに係る情報検索サイトです。"
        },
        {
          property: "og:image",
          content: ""
        },
        {
          property: "og:site_name",
          content: "データカタログ横断システム"
        },
        {
          property: "twitter:card",
          content: "summary"
        },
        {
          property: "twitter:creator",
          content: "SIP NIIコンソーシアム"
        },
        {
          property: "twitter:title",
          content: "データカタログ横断システム"
        },
        {
          property: "twitter:description",
          content: "データカタログ横断システムはSIP NIIコンソーシアムが開発したオープンデータに係る情報検索サイトです。"
        },
        {
          property: "twitter:image",
          content: ""
        },
      ],
      link: [
        {
          rel: "apple-touch-icon-precomposed",
          href: ""
        },
        {
          rel: "icon",
          href: "",
          sizes: "192x192",
          type: "image/png"
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap"
        },
        {
          "rel": "stylesheet",
          "href": "/css/all.min.css"
        },
        {
          "rel": "stylesheet",
          "href": "/css/destyle.css"
        },
        {
          "rel": "stylesheet",
          "href": "/css/style.css"
        },
        {
          "rel": "stylesheet",
          "href": "/css/markdown.css"
        }
      ]
    },
  },

  modules: ["@nuxt/content", "nuxt-gtag"],

  gtag: {
    id: '',
    enabled: false,
  },

  $production: {
    gtag: {
      id: process.env.GOOGLE_GTAG,
      enabled: true,
    },
  },

  runtimeConfig: {
    // URL of the backend API server.
    backendApiBaseUrl: '',

    public: {
      // Following 2 URLs are used in the client-side application (web).
      // They are prepared for the case that the accessible URLs are different between SSR server and client web browser.
      // In SSR server, private ones above are available and overwrite these public ones.
      frontendWebBaseUrl: '',
      backendApiBaseUrl: '',
    },
  },
})