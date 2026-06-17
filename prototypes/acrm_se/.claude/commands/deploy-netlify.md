---
description: Build and deploy this prototype to Netlify
argument-hint: [prod]
---

Deploy this prototype to Netlify.

1. Run `npm run build` to produce `dist/`.
2. Check if the site is already linked: look for `.netlify/state.json` in the project root.
   - If linked, run `npx netlify-cli deploy --dir=dist` for a draft preview deploy.
   - If not linked, run `npx netlify-cli deploy --dir=dist --create-site` to create a new site and deploy in one step (pick a sensible site name if prompted, e.g. `acrm-se-prototype`, adjusting if it's taken).
3. If the argument `prod` was passed ($ARGUMENTS), add `--prod` to the deploy command for a production deploy instead of a draft.
4. Report the resulting preview/production URL(s) from the CLI output back to the user.

If `npx netlify-cli` reports it isn't authenticated, stop and tell the user to run `npx netlify-cli login` in their terminal first (it opens a browser, so it can't be completed from here).
