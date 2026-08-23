// Adapted from https://equk.co.uk/2023/02/02/generating-slug-from-title-in-astro/

import { GENERATE_SLUG_FROM_TITLE } from '../config'

function slugify(value: string) {
  return value
    // remove leading & trailing whitespace
    .trim()
    // output lowercase
    .toLowerCase()
    // replace spaces
    .replace(/\s+/g, '-')
    // keep letters and numbers from every language
    .replace(/[^\p{L}\p{N}_-]/gu, '')
    // remove leading & trailing separators
    .replace(/^-+|-+$/g, '')
}

export default function (title: string, staticSlug: string) {
  if (!GENERATE_SLUG_FROM_TITLE) return staticSlug

  return slugify(title) || slugify(staticSlug)
}
