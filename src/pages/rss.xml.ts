import type { AstroGlobal, ImageMetadata } from 'astro'
import { getImage } from 'astro:assets'
import type { CollectionEntry } from 'astro:content'
import rss, { getRssString } from '@astrojs/rss'
import type { Root } from 'mdast'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'
import config from 'virtual:config'

import { getBlogCollection, sortMDByDate } from 'astro-pure/server'

// Get dynamic import of images as a map collection
const imagesGlob = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/blog/**/*.{jpeg,jpg,png,gif}' // add more image formats if needed
)

// Remove illegal XML 1.0 control characters (except tab, LF, CR)
const sanitizeXmlText = (input: string | undefined | null): string | undefined => {
  if (typeof input !== 'string') return input ?? undefined
  const xmlIllegalChars = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g
  return input.replace(xmlIllegalChars, '')
}

const renderContent = async (post: CollectionEntry<'blog'>, site: URL) => {
  // Replace image links with the correct path
  function remarkReplaceImageLink() {
    /**
     * @param {Root} tree
     */
    return async function (tree: Root) {
      const promises: Promise<void>[] = []
      visit(tree, 'image', (node) => {
        if (node.url.startsWith('/images')) {
          node.url = `${site}${node.url.replace('/', '')}`
        } else {
          const imagePathPrefix = `/src/content/blog/${post.id}/${node.url.replace('./', '')}`
          const promise = imagesGlob[imagePathPrefix]?.().then(async (res) => {
            const imagePath = res?.default
            if (imagePath) {
              node.url = `${site}${(await getImage({ src: imagePath })).src.replace('/', '')}`
            }
          })
          if (promise) promises.push(promise)
        }
      })
      await Promise.all(promises)
    }
  }

  const file = await unified()
    .use(remarkParse)
    .use(remarkReplaceImageLink)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(post.body)

  // Sanitize: remove illegal XML 1.0 control chars (except \t, \n, \r) and collapse to single line
  const xmlIllegalChars = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g
  return String(file)
    .replace(xmlIllegalChars, '')
    .replace(/\n/g, '')
}

const GET = async (context: AstroGlobal) => {
  const allPostsByDate = sortMDByDate(await getBlogCollection()) as CollectionEntry<'blog'>[]
  const siteUrl = context.site ?? new URL(import.meta.env.SITE)

  const rssString = await getRssString({
    // Basic configs
    trailingSlash: false,
    xmlns: { h: 'http://www.w3.org/TR/html4/', content: 'http://purl.org/rss/1.0/modules/content/' },

    // Contents
    title: sanitizeXmlText(config.title)!,
    description: sanitizeXmlText(config.description)!,
    site: siteUrl,
    items: await Promise.all(
      allPostsByDate.map(async (post) => {
        const heroImageSrc = post.data.heroImage?.src
        const heroImageUrl =
          typeof heroImageSrc === 'string'
            ? heroImageSrc
            : heroImageSrc?.src
        const absoluteHeroImageUrl = heroImageUrl
          ? new URL(heroImageUrl, siteUrl).href
          : undefined

        return {
          ...post.data,
          title: sanitizeXmlText(post.data.title),
          description: sanitizeXmlText(post.data.description),
          pubDate: post.data.publishDate,
          link: `/blog/${post.id}`,
          customData: absoluteHeroImageUrl
            ? `<h:img src="${absoluteHeroImageUrl}" />
          <enclosure url="${absoluteHeroImageUrl}" />`
            : undefined,
          content: await renderContent(post, siteUrl)
        }
      })
    )
  })

  // Return custom Response with required headers for Pretty Feed (Safari compatibility)
  const rssOut = sanitizeXmlText(rssString)!
  return new Response(rssOut, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'x-content-type-options': 'nosniff'
    }
  })
}

export { GET }