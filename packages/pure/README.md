# Astro Theme Pure

A simple, fast and powerful blog theme built by Astro.

[![Vercel status](https://img.shields.io/website?down_message=offline&label=vercel&logo=vercel&up_message=online&url=https%3A%2F%2Fastro-pure.js.org)](#)
[![Npm version](https://badge.fury.io/js/astro-pure.svg)](https://www.npmjs.com/package/astro-pure)
[![Github license](https://img.shields.io/github/license/cworld1/astro-theme-pure)](https://github.com/cworld1/astro-theme-pure/blob/main/LICENSE)

![img](https://github.com/user-attachments/assets/6c42b061-df7e-4696-a29b-bff07fe17d88)

## Usage

### Use with theme template

See [Getting Started](https://astro-pure.js.org/docs/setup/getting-started).

### Use with common Astro project

Set up tailwindcss in your project.

```js
// tailwind.config.mjs

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    // Add astro-pure components in the tailwindcss render config
    './node_modules/astro-pure/components/**/*.astro'
  ]
}

export default config
```

See [User Components](https://astro-pure.js.org/docs/integrations/components) & [Advanced Components](https://astro-pure.js.org/docs/integrations/advanced) to learn how to use.

> Some part of Advanced Components may require Astro Integration config.

## Cli

```shell
# See all commands
astro-pure help
# Get the info of astro-pure
astro-pure info
# Create a new post in the blog
astro-pure new [options]
```

## License

This project is licensed under the Apache 2.0 License.
