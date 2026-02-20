/**
 * サイト情報。
 */
export interface Site {
  title: string
  dataset_url: string
  update_interval: string | null
  full_update_interval: string | null
}