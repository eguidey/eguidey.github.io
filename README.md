# ianguidry.com

Source for [ianguidry.com](https://ianguidry.com): Ian Guidry's cybersecurity blog and project write-ups. Built with Jekyll and hosted on GitHub Pages.

## Writing a post

1. Add `_posts/YYYY-MM-DD-title.md` with front matter (`layout: post`, `title`, `description`, `tags`).
2. Put screenshots in `assets/images/<post-name>/` and place them with:
   `{% include figure.html src="/assets/images/<post-name>/file.png" alt="..." caption="..." %}`
   A slot whose image doesn't exist yet simply doesn't render.
3. Commit to `main`. GitHub Pages rebuilds the site in about a minute.

## Local preview

```bash
bundle install
bundle exec jekyll serve   # http://localhost:4000
```
