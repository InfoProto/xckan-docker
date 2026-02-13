<script setup lang="ts">
import { useDataset } from '~/composables/api/useDataset';
import { useUrls } from '~/composables/useApi';
import { DatasetTitles } from '~/utils/labels';

//----------------------------------------------------------------
// Types
//----------------------------------------------------------------

//----------------------------------------------------------------
// Composables
//----------------------------------------------------------------
const route = useRoute();
const urls = useUrls();
const { dataset } = await useDataset(route.params.id as string);

const attrs = computed(() => ({
  title: dataset.value.xckan_title || "",
  siteUrl: `${urls.frontend}${route.path}`,
  description: dataset.value.xckan_description || dataset.value.notes || "",
  keywords: dataset.value.tags?.map((t: any) => t.display_name).join(", ") || "",
  imageUrl: dataset.value.organization?.image_url || "",
  creator: dataset.value.organization?.title ?? "",
  identifier: dataset.value.xckan_id || null,
  license: dataset.value.license_url || dataset.value.license || null,
  url: dataset.value.xckan_site_url || null,
  isOrganization: dataset.value.organization?.type == 'organization',
  name: dataset.value.xckan_site_name || null,
}));

useHead({
  title: attrs.value.title,
  meta: [
    {
      property: 'og:title',
      content: attrs.value.title,
    },
    {
      property: 'twitter:title',
      content: attrs.value.title,
    },
    {
      property: 'og:url',
      content: attrs.value.siteUrl,
    },
    ...(attrs.value.description ? [
      {
        name: 'description',
        content: attrs.value.description,
      },
      {
        property: 'og:description',
        content: attrs.value.description,
      },
      {
        name: 'twitter:description',
        content: attrs.value.description,
      },
    ] : []),
    ...(attrs.value.keywords ? [
      {
        name: 'keywords',
        content: attrs.value.keywords,
      },
    ] : []),
    ...(attrs.value.imageUrl ? [
      {
        property: 'og:image',
        content: attrs.value.imageUrl,
      },
      {
        name: 'twitter:image',
        content: attrs.value.imageUrl,
      },
    ] : []),
    ...(attrs.value.creator ? [
      {
        name: 'twitter:creator',
        content: attrs.value.creator,
      },
    ] : []),
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Dataset",
        "name": attrs.value.title,
        "description": attrs.value.description,
        "alternateName": null,
        "citation": null,
        "hasPart": null,
        "isPartOf": null,
        "idnetifier": attrs.value.identifier,
        "keywords": attrs.value.keywords,
        "license": attrs.value.license,
        "url": attrs.value.url,
        "creator": attrs.value.isOrganization ? {
          "@type": "Organization",
          "name": attrs.value.creator,
        } : {
          "@type": "Person",
          "name": attrs.value.name,
        },
      }, null, 2),
    },
  ],
});

//----------------------------------------------------------------
// View models
//----------------------------------------------------------------
const extras = computed<{ [key: string]: string }>(() => {
  const ex: { [key: string]: string } = {};
  dataset.value.extras.forEach((item) => {
    if (item.value) {
      ex[item.key] = item.value;
    }
  });
  return ex;
});

const creativeCommons = computed<string[]>(() => {
  let licenseId = dataset.value.license_id.toLowerCase();
  var marks: string[] = [];
  if (licenseId.search("by") >= 0) {
    marks.push("/images/cc-icons-svg/by.svg");
  }
  if (licenseId.search("nc") >= 0) {
    if (licenseId.search("eu") >= 0) {
      marks.push("/images/cc-icons-svg/nc-eu.svg");
    } else if (licenseId.search("ja") >= 0) {
      marks.push("/images/cc-icons-svg/nc-jp.svg");
    } else {
      marks.push("/images/cc-icons-svg/nc.svg");
    }
  }
  if (licenseId.search("sa") >= 0) {
    marks.push("/images/cc-icons-svg/sa.svg");
  }
  if (licenseId.search("nd") >= 0) {
    marks.push("/images/cc-icons-svg/nd.svg");
  }
  if (licenseId.search("pd") >= 0) {
    marks.push("/images/cc-icons-svg/pd.svg");
  }
  if (licenseId.search("zero") >= 0) {
    marks.push("/images/cc-icons-svg/zero.svg");
  }
  if (licenseId.search("sampling") >= 0) {
    marks.push("/images/cc-icons-svg/sampling.svg");
  }
  if (licenseId.search("share") >= 0) {
    marks.push("/images/cc-icons-svg/share.svg");
  }
  if (licenseId.search("remix") >= 0) {
    marks.push("/images/cc-icons-svg/remix.svg");
  }
  if (marks.length > 0) {
    marks.unshift("/images/cc-icons-svg/cc.svg");
  }
  return marks;
})

const jsonDownload = computed<string>(() => {
  return `${urls.backend}/package_show?id=${route.params.id}`;
})

const commonValues = computed<Iterable<[string, any]>>(() => {
  const values: [string, any][] = [];
  for (const key in dataset.value) {
    if (
      key != "organization" &&
      key != "tags" &&
      key != "groups" &&
      key != "resources" &&
      key != "extras"
    ) {
      values.push([key, dataset.value[key]]);
    }
  }
  return values;
})

//----------------------------------------------------------------
// Functions
//----------------------------------------------------------------
function getTitle(prefix: string, key: string): string {
  const titleKey = prefix ? `${prefix}:${key}` : key;
  return DatasetTitles[titleKey] || key;
}

function getDataType(content: any): number {
  return (typeof content === 'string' && content.indexOf("data:image") >= 0) ? 0 : 1
}

function getArrayProperty(key: string): { [key: string]: string }[] {
  const content = dataset.value[key];
  return content ? content : [];
}

function makeLink(content: any): string {
  content = _convertString(content);
  var regexp_url = /((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g;
  var regexp_makeLink = function (
    all: String,
    url: String,
    h: String,
    href: String
  ) {
    return '<a href="h' + href + '">' + url + "</a>";
  };
  let _target = `${content}`;
  return _target.replace(regexp_url, regexp_makeLink);
}

function _convertString(content: any): any {
  var conv: any = content;
  if (content == null || content === undefined) {
    return ""
  } else if (typeof content == 'object') {
    if (Array.isArray(content)) {
      var convArray = content.map(x => _convertString(x))
      conv = convArray.join("<br/>")
    } else {
      var convArray = []
      Object.keys(content).forEach(key => {
        convArray.push(key + ":" + _convertString(content[key]))
      })
      conv = convArray.join("<br/>")
    }
  }
  return conv
}

</script>

<template>
  <Suspense>
    <div>
      <div class="head_border"></div>

      <article class="content content-detail">
        <div class="content-detail__meta">
          <div class="content-detail__meta__url">{{ dataset.xckan_id }}</div>
          <div class="content-detail__meta__update">
            {{ dataset.xckan_last_updated }}
          </div>
        </div>
        <main class="content__main content-detail__main">
          <div class="detail">
            <h1 class="level1-heading_detail">{{ dataset.xckan_title }}</h1>
            <a :href="dataset.xckan_site_url" class="content-detail__link" target="_blank">
              <span class="content-detail__link__source">{{ dataset.xckan_site_url }} > dataset</span>
              <span class="content-detail__link__title"><span v-if="dataset.xckan_site_name">「{{ dataset.xckan_site_name
                  }}」</span>に移動する​</span>
            </a>

            <section class="dataset__about">
              <div class="dataset__head">
                <h2 class="level2-heading_dataset">データセットについて</h2>
              </div>
              <div class="dataset__description" v-html="dataset.xckan_description"></div>
              <div class="dataset__about__footer">
                <div class="cc-icon" v-if="dataset.license_id">
                  <template v-for="cc in creativeCommons">
                    <img :src="cc" />
                  </template>
                </div>
                <ul class="tag" v-for="tag in dataset.tags" :key="tag.display_name">
                  <li class="tag__item">{{ tag.display_name }}</li>
                </ul>
              </div>
              <div class="update__meta" v-if="dataset.maintainer">
                <div class="update__user" v-if="dataset.maintainer">
                  <span class="update__meta__title">更新者 :</span>{{ dataset.maintainer }}
                </div>
              </div>
            </section>

            <section class="dataset">
              <div class="dataset__head">
                <h2 class="level2-heading_dataset">データセット</h2>
                <a :href="jsonDownload" target="_blank" download="dataset.json" class="dataset__download"><i
                    class="fas fa-download"></i>JSONダウンロード</a>
              </div>
              <table class="dataset__table dataset__main">
                <tbody>
                  <tr v-for="[key, value] in commonValues" :key="key">
                    <th>{{ getTitle("", key) }}</th>
                    <td v-if="getDataType(value) == 1" v-html="makeLink(value)"></td>
                    <td v-else><img :src="value" /></td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section class="dataset" v-if="dataset.organization">
              <div class="dataset__head">
                <h2 class="level2-heading_dataset">組織</h2>
              </div>
              <table class="dataset__table dataset__main">
                <tbody>
                  <tr v-for="(value, key) in dataset.organization" :key="key">
                    <th>{{ getTitle("organization", key) }}</th>
                    <td v-html="makeLink(value)"></td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section class="dataset" v-if="dataset.tags && dataset.tags.length > 0">
              <div class="dataset__head">
                <h2 class="level2-heading_dataset">データセットのキーワード</h2>
              </div>

              <div class="dataset__sub" v-for="(items, index) in getArrayProperty('tags')" :key="index">
                <h3 class="level3-heading_dataset">キーワード{{ index + 1 }}</h3>
                <table class="dataset__table dataset__main">
                  <tbody>
                    <tr v-for="(value, key) in items" :key="key">
                      <th>{{ getTitle("tags", key) }}</th>
                      <td v-html="makeLink(value)"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="dataset" v-if="dataset.groups && dataset.groups.length > 0">
              <div class="dataset__head">
                <h2 class="level2-heading_dataset">グループ</h2>
              </div>

              <div class="dataset__sub" v-for="(items, index) in getArrayProperty('groups')" :key="index">
                <h3 class="level3-heading_dataset">グループ{{ index + 1 }}</h3>
                <table class="dataset__table dataset__main">
                  <tbody>
                    <tr v-for="(value, key) in items" :key="key">
                      <th>{{ getTitle("groups", key) }}</th>
                      <td v-html="makeLink(value)"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="dataset" v-if="dataset.resources && dataset.resources.length > 0">
              <div class="dataset__head">
                <h2 class="level2-heading_dataset">配信</h2>
              </div>

              <div class="dataset__sub" v-for="(items, index) in dataset.resources" :key="index">
                <h3 class="level3-heading_dataset">配信{{ index + 1 }}</h3>
                <table class="dataset__table dataset__main">
                  <tbody>
                    <tr v-for="(value, key) in items" :key="key">
                      <th>{{ getTitle("resource", key) }}</th>
                      <td v-html="makeLink(value)"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="dataset" v-if="dataset.extras && dataset.extras.length > 0">
              <div class="dataset__head">
                <h2 class="level2-heading_dataset">付加情報</h2>
              </div>
              <table class="dataset__table dataset__main">
                <tbody>
                  <tr v-for="(value, key) in extras" :key="key">
                    <th>{{ getTitle("extras", key) }}</th>
                    <td v-html="makeLink(value)"></td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        </main>
      </article>
      <!-- /.content -->

    </div>
  </Suspense>
</template>