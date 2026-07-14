# CLAUDE.md

- The **acrm** project is located in the `prototypes/acrm_se` directory. 
- All work is carried out in this directory.
- Always communicate with the user in Russian only (все ответы — только на русском языке).
- All work must be done in a branch named after the git user name, then merged into the `slave` branch (do not commit directly to `main`). The branch name is derived from the git user name using only lowercase letters and hyphens (e.g. "Alexey L." → `alexey-l`).
- When the user writes "сохрани", stage new files (`git add`), commit, and push to the current branch.
- ALWAYS verify that `npm run build` succeeds before executing "сохрани"; do not commit or push if the build fails.
