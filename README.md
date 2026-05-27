# Jack Tinsley Digital Card

A static digital business card and QR landing page for Jack Tinsley.

The project is designed for a printed business card with a QR code on the back.
When someone scans the code, they should land on a premium mobile-first page where
they can:

- save Jack&rsquo;s contact details
- view or download a CV
- open selected portfolio, research or capstone links

Everything is static. There is no backend, database, login system, analytics,
tracking, cookies or paid CMS.

## Project structure

- `index.html`: the public page the QR code should point to
- `config.js`: the single source of truth for visible content and layout choices
- `styles.css`: shared styling for the public page and local tools
- `script.js`: shared client-side logic, page rendering and vCard generation
- `editor.html` / `editor.js`: local editor for updating details and exporting a new `config.js`
- `card-preview.html` / `card-preview.js`: front and back business card design sandbox
- `assets/jack-tinsley-cv.pdf`: replace this placeholder with the real public-facing CV
- `assets/jack-tinsley.vcf`: static fallback contact file
- `assets/qr-code.svg`: placeholder QR artwork for the print preview

## How to edit Jack&rsquo;s details

You have two options:

1. Edit `config.js` directly.
2. Open `editor.html`, change the fields, then export a new `config.js`.

The editor stores a local draft in your browser so you can work without changing
the public page immediately.

To publish an update:

1. Export `config.js` from `editor.html`.
2. Replace the repository&rsquo;s `config.js` with the exported file.
3. Commit and push the change.
4. Let Cloudflare Pages redeploy.

## How to update the CV

Replace `assets/jack-tinsley-cv.pdf` with the final public-facing CV.

Keep the same filename after the physical QR card is printed. That lets you update
the CV later without changing the QR code or the landing page URL.

If you deliberately change the filename, update `config.js` as well.

## How to update links

Edit the URL fields in `config.js` or in `editor.html`:

- `links.publicUrl`
- `links.cvUrl`
- `links.portfolioUrl`
- `links.researchUrl`
- `links.capstoneUrl`
- `contact.website`
- `contact.linkedIn`

Blank fields are hidden automatically on the public page.

## How the vCard works

The preferred flow is client-side generation from `config.js` when someone taps
`Add to Contacts`.

The site also includes a static fallback at:

- `assets/jack-tinsley.vcf`

If you change public contact details, export a new `.vcf` from `editor.html` and
replace the fallback file if you want both versions to stay identical.

## QR code workflow

Do not generate the final printed QR until the site is deployed and the landing
page URL is permanent.

Recommended workflow:

1. Deploy the site.
2. Confirm the final long-term URL.
3. Generate a high-error-correction QR code that points to the landing page.
4. Replace `assets/qr-code.svg` with the final QR artwork.
5. Re-check the preview in `card-preview.html`.
6. Test the printed QR on both iPhone Camera and Android Camera before ordering cards.

Why the QR should point to the landing page:

- the landing page can change without reprinting the card
- the CV file can be updated later
- contact details can evolve over time

Do not point the printed QR directly to:

- the CV PDF
- the `.vcf` file
- a local file path
- a temporary preview or staging URL

## Cloudflare Pages deployment

Primary workflow:

1. Put the project in a GitHub repository.
2. Create a Cloudflare Pages project and connect it to that GitHub repository.
3. Use the repository root as the build output because this is a static site with
   no build step.
4. Let Cloudflare deploy the files as-is.
5. Copy the final `pages.dev` or custom-domain URL into `links.publicUrl`.
6. Commit the updated `config.js` and redeploy.

Notes:

- A custom domain is optional.
- A free `*.pages.dev` URL is enough if you do not want to buy anything yet.
- Once physical cards are printed, do not change the landing page URL. Update the
  files behind it instead.

## Other hosting options

If you prefer, the same files can also be deployed on:

- GitHub Pages
- Netlify

The site uses relative paths and should work on any simple static host.

## Testing and QA

Install the local QA dependencies:

```bash
npm install
npx playwright install chromium
```

The Playwright setup starts a local static server automatically and checks the
real browser experience for:

- static file sanity
- public page loading
- mobile responsive layouts at `360px`, `390px` and `430px`
- desktop and tablet layouts
- button and link behaviour
- generated `.vcf` content
- editor exports
- card preview controls
- basic accessibility
- screenshot capture for manual review

Useful commands:

```bash
npm run check
npm run test:e2e
npm run test:mobile
npm run test:a11y
npm run test:static
npm run screenshots
```

What each command does:

- `npm run check`: runs the static, browser and accessibility checks
- `npm run test:e2e`: runs the main browser tests for `index.html`, `editor.html`
  and `card-preview.html`
- `npm run test:mobile`: focuses on the mobile widths and screenshot capture
- `npm run test:a11y`: runs the accessibility-focused Playwright checks
- `npm run test:static`: verifies required files and references exist
- `npm run screenshots`: generates manual review screenshots

Artifacts:

- HTML report: `playwright-report/index.html`
- screenshots: `test-results/screenshots/`
- Playwright traces and failure output: `test-results/playwright/`

How to inspect screenshots:

1. Run `npm run screenshots`.
2. Open the images in `test-results/screenshots/`.
3. Review spacing, clipping, legibility, button hierarchy and QR quiet-zone space.

What still needs manual testing on real devices:

- open the final deployed page on a real iPhone and Android phone
- test the `Add to Contacts` flow in Safari and Chrome
- confirm copy buttons feel natural on touch screens
- verify the CV opens cleanly in the native browser PDF viewer
- scan the final QR code from an actual printed proof, not only from a screen

How to test the QR after deployment:

1. Deploy the site and confirm the final permanent landing page URL.
2. Generate the production QR from that final URL.
3. Replace `assets/qr-code.svg` if needed and re-check `card-preview.html`.
4. Scan the QR with both iPhone Camera and Android Camera.
5. Test it at the actual printed size before placing a full order.

How to test the vCard after deployment:

- On iPhone: open the deployed page in Safari, tap `Add to Contacts`, and confirm
  the contact sheet or download flow shows the right name, title, organisation,
  and only the public fields you intentionally included.
- On Android: open the deployed page in Chrome, tap `Add to Contacts`, and confirm
  the `.vcf` downloads or opens correctly and imports the expected fields.
- Also test the static fallback link to `assets/jack-tinsley.vcf`.

How to test the CV after deployment:

- Tap `View CV` from the deployed page on desktop and mobile.
- Confirm it points to the intended same-origin PDF.
- Confirm the file opens without a 404 and is still readable after any CV replacement.

If you later put the project in GitHub, the optional workflow at
`.github/workflows/qa.yml` can run the automated suite on pushes and pull requests.

## How to test before printing

- Open `index.html` and confirm the digital card works on mobile-width screens.
- Check `editor.html` and export a fresh `config.js`.
- Open `card-preview.html` and test the chosen print layout.
- Test at roughly `360px`, `390px`, `430px`, `768px` and desktop widths.
- Check contrast carefully, especially around the QR area.
- Verify the final QR at real card size with multiple phones.
- Check your printer&rsquo;s template for bleed, quiet zone, safe area and colour mode requirements.

## Privacy and safety

This project is static, so anything in `config.js`, the fallback `.vcf` and the
CV PDF should be treated as public.

Hidden buttons are a design feature, not a security feature.

Only put details in the project that you are happy to make public.
