# Jack Tinsley Digital Card

A very small static digital card for Jack Tinsley.

The public site is plain HTML, CSS and vanilla JavaScript. There is no build
step, no runtime dependency, no analytics, no tracking and no cookies.

## Public Page

- `index.html`: one centered column with the uploaded business-card PNG, visible identity text and the required actions
- `styles.css`: minimal responsive styling using the card colours
- `script.js`: vCard download, link setup and copy-button behavior
- `config.js`: the single place to edit personal details
- `assets/business-card.png`: the business-card image shown at the top
- `assets/jack-tinsley-cv.pdf`: the CV opened by the CV button

The public page is suitable for GitHub Pages because all paths are relative and
the files can be served as-is from the repository root.

## Update Personal Details

Edit `config.js`.

Important fields:

- `name`
- `descriptor`
- `email`
- `website`
- `linkedInUrl`
- `cvPath`
- `phone`
- `vCard`

The public email is configured in `config.js`:

```js
email: "jacktinsley0@outlook.com"
```

The email action, copy action and generated vCard use this value.

If you change the CV filename, update `cvPath` in `config.js`. Keeping
`assets/jack-tinsley-cv.pdf` is simplest because printed QR codes and old links
can keep working while the PDF content changes.

TODO before final launch: replace `assets/jack-tinsley-cv.pdf` with the final
updated CV at the same path so printed QR cards keep pointing to the stable
landing page.

## Local Testing

The site itself does not need npm. You can test it with any static file server.

Using Python:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/index.html
```

Manual checks:

- business card PNG displays without cropping
- visible name and descriptor match `config.js`
- Add to Contacts downloads `jack-tinsley.vcf`
- CV opens from `assets/jack-tinsley-cv.pdf`
- LinkedIn opens externally
- Email opens a `mailto:` link when `config.js` includes a public email address
- Copy Website shows success feedback
- Copy All Details copies a clean text block
- mobile widths around 360px, 390px and 430px have no horizontal scrolling

## Testing and QA

This repo still includes optional Playwright tests for browser QA. They are for
development only; the deployed site does not depend on them.

```bash
npm install
npx playwright install chromium
npm run check
npm run test:mobile
npm run screenshots
```

## Privacy

Everything in this repository is public once deployed. Only put contact details
in `config.js`, the CV PDF, or vCard output if they are intended to be public.
