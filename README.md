# samadashboard

The public website of SAMA at [samatechlb.com](https://samatechlb.com): a web design and development studio in Beirut, Lebanon. It is plain static HTML, CSS and JavaScript, hosted on GitHub Pages.

## Manage projects

Open [samatechlb.com/admin/](https://samatechlb.com/admin/) and sign in with your email and password. The first time, sign in with a GitHub access token and choose **Login settings** to set them.

- **All, Published and Not published** filter the grid of every website, and **View** opens any of them.
- **Add to website or Remove** changes what is on the site, and the arrows change its order.
- **+ New project** uploads a new project folder into the library.
- **Publish to website** saves everything as one commit. The `Build website` GitHub Action then makes screenshots and pages, and the page tells you when it's live.

GitHub Pages has no server, so the email and password are never stored or sent anywhere. Together they unlock a GitHub token kept encrypted in `admin/vault.json` (PBKDF2 and AES-GCM in the browser). That file is public, so use a long, unique password: anyone could try guessing it offline.

The library lives in `data/library.json` and `demos/`, and the projects on the site are listed in `data/list.json`. This repository is public, so every project in `demos/` can be opened by anyone who has its address, even when it isn't on the site. Demos carry a `noindex` tag to keep them out of Google, because they show fictional businesses.

## Change wording

Edit `tools/content.mjs` and push. The Action rebuilds the site. To check locally, run `node tools/sync.mjs`, `node tools/build.mjs` and `node tools/check.mjs`.

Pages at the site root, `work/`, the service folders, `about/` and `contact/` are generated, so edit `tools/` rather than those files. To add an icon, add it to `tools/fetch_assets.mjs` and run that file.

## Hosting

GitHub Pages deploys `main` from `/ (root)`. DNS: `A` records for `@` to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and a `CNAME` for `www` to `samatech-lb.github.io`.
