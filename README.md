# samadashboard

The public website of SAMA at [samatechlb.com](https://samatechlb.com): a web design and development studio in Beirut, Lebanon. It uses the design of the SAMA site (`studio-dashboard/sama`), shows only the top 30 projects, and is plain static HTML, CSS and JavaScript.

## Publish on GitHub Pages

1. In this repository, open **Settings → Pages**. Under Source choose **Deploy from a branch**, then `main` and `/ (root)`.
2. At your domain registrar, add these DNS records:
   - `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` record for `www`: `samatech-lb.github.io`
3. Back in **Settings → Pages**, confirm the custom domain is `samatechlb.com`, wait for the DNS check, then tick **Enforce HTTPS**.

## Add or remove projects

No subdomain or online admin is needed. Forma Studio on your computer is the dashboard.

1. Open `studio-dashboard/index.html` and use **Add to portfolio** or **Remove from portfolio**.
2. Click **Save to website** and save over `studio-dashboard/portfolio.js`.
3. Double-click `publish.bat` in this folder.

## Change something

| To change | Do this |
| --- | --- |
| Wording, email or WhatsApp number | Edit `tools/content.mjs`, then run `node tools/build.mjs` |
| Add an icon | Add it to `tools/fetch_assets.mjs`, then run that file |
| Check for SEO mistakes and broken links | Run `node tools/check.mjs` |

To refresh screenshots, run `python -m http.server 8123 --bind 127.0.0.1` in this folder, then `node tools/capture.mjs` and `python tools/images.py` in a second terminal.

Pages at the site root, `work/`, the service folders, `about/` and `contact/` are generated, so edit `tools/` rather than those files. Demos in `demos/` are copied from Forma and carry a `noindex` tag, because they show fictional businesses.
