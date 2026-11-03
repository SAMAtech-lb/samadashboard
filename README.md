# samadashboard

The public website of SAMA at [samatechlb.com](https://samatechlb.com): a web design and development studio in Beirut, Lebanon. It is plain static HTML, CSS and JavaScript, hosted on GitHub Pages.

## Manage projects

Open [samatechlb.com/admin/](https://samatechlb.com/admin/) and sign in with a GitHub access token (the sign-in page explains how to make one).

- **Add or Remove** moves a project on or off the website, and the arrows change its order.
- **+ New project** uploads a new project folder into the library.
- **Publish to website** saves everything as one commit. The `Build website` GitHub Action then makes screenshots and pages, and the page tells you when it's live.

The sign-in is the token itself: nothing secret is stored in this repository, so the page is useless without a token that can edit it.

The library lives in `data/library.json` and `demos/`, and the projects on the site are listed in `data/list.json`. This repository is public, so every project in `demos/` can be opened by anyone who has its address, even when it isn't on the site. Demos carry a `noindex` tag to keep them out of Google, because they show fictional businesses.

## Change wording

Edit `tools/content.mjs` and push. The Action rebuilds the site. To check locally, run `node tools/sync.mjs`, `node tools/build.mjs` and `node tools/check.mjs`.

Pages at the site root, `work/`, the service folders, `about/` and `contact/` are generated, so edit `tools/` rather than those files. To add an icon, add it to `tools/fetch_assets.mjs` and run that file.

## Hosting

GitHub Pages deploys `main` from `/ (root)`. DNS: `A` records for `@` to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and a `CNAME` for `www` to `samatech-lb.github.io`.
