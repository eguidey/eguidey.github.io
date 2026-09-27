# My Blog

A Jekyll blog for GitHub Pages: post cards on the home page, a year-by-year archive, a sidebar with bio, "recently viewed" and tags, share buttons, reading time, RSS and dark mode.

## Put it online (about 5 minutes, all in the browser)

1. **Create the repo.** On GitHub, click **New repository**. Name it exactly `YOUR-USERNAME.github.io` (so the site lives at `https://YOUR-USERNAME.github.io`). Make it **Public**. Don't add a README.
2. **Upload the files.** On the empty repo page, click **uploading an existing file**, drag in *everything inside* this folder (not the folder itself — `_config.yml` must be at the top level), and click **Commit changes**.
3. **Turn on Pages.** Go to **Settings → Pages**. Under *Build and deployment*, set Source to **Deploy from a branch**, branch **main**, folder **/ (root)**, and Save.
4. **Wait ~1 minute**, then open `https://YOUR-USERNAME.github.io`. The **Actions** tab shows build progress/errors.

> Using a different repo name (e.g. `blog`)? Then set `baseurl: "/blog"` in `_config.yml`, and your site will be at `https://YOUR-USERNAME.github.io/blog`.

## Make it yours

- **`_config.yml`** — your name, bio, social links, nav menu. (Edit, commit, done.)
- **`about.md`** — your About page.
- **`assets/css/style.css`** — colors are at the very top (`--accent` is the main one).

## Write a post

Add a file to `_posts/` named `YYYY-MM-DD-your-title.md`:

```markdown
---
layout: post
title: "My Post Title"
description: "One-line summary shown on the home page."
categories: blog
tags: [cloud, labs]
---

Your post in Markdown...
```

Commit it and the site rebuilds automatically. Delete the two sample posts when you're ready.

## Custom domain (optional)

Settings → Pages → *Custom domain*, enter your domain, then point your DNS at GitHub Pages (instructions are linked right there).

## Preview locally (optional)

```bash
bundle install
bundle exec jekyll serve
# open http://localhost:4000
```
