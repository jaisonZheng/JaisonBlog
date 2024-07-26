import { defineConfig } from 'astro/config'
// Adapter
import vercel from '@astrojs/vercel/serverless'
// Integrations
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import icon from 'astro-icon'
import playformCompress from '@playform/compress'
// Markdown
import { remarkReadingTime } from './src/utils/remarkReadingTime.ts'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkUnwrapImages from 'remark-unwrap-images'
import rehypeExternalLinks from 'rehype-external-links'
import { siteConfig } from './src/site.config.ts'

// https://astro.build/config
export default defineConfig({
  // Top-Level Options
  site: siteConfig.site,
  // base: '/docs',
  trailingSlash: 'never',
  output: 'server',
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
    // imagesConfig: {
    //   sizes: [320, 640, 1280]
    // }
    // imageService: true
    // isr: true // cache
  }),
  integrations: [
    tailwind({
      applyBaseStyles: false
    }),
    sitemap(),
    mdx(),
    icon(),
    playformCompress({
      SVG: false
    })
  ],
  // root: './my-project-directory',

  // Prefetch Options
  prefetch: true,
  // Server Options
  server: {
    host: true
  },
  // Markdown Options
  markdown: {
    remarkPlugins: [remarkUnwrapImages, remarkMath, remarkReadingTime],
    rehypePlugins: [
      [rehypeKatex, {}],
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['nofollow, noopener, noreferrer']
        }
      ]
    ],
    remarkRehype: {
      footnoteLabelProperties: {
        className: ['']
      }
    },
    shikiConfig: {
      themes: {
        dark: 'github-dark',
        light: 'github-light'
      }
    }
  }
})
