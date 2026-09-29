# Hide Whitespace for GitHub — Chrome Extension

<img src="https://github.com/jackchuka/chrome-extension-github-whitespace/blob/master/public/icon128.png?raw=true" alt="logo" width="64"/>

Hide whitespace-only changes in GitHub pull request diffs.

> This is an independent, open-source extension. It is not affiliated with, endorsed by, or sponsored by GitHub, Inc. "GitHub" is a trademark of GitHub, Inc.

## Built Based On

https://github.com/chibat/chrome-extension-typescript-starter

## Project Structure

- src/typescript: TypeScript source files
- src/assets: static files
- dist: Chrome Extension directory
- dist/js: Generated JavaScript files

## Setup

```
pnpm install
```

## Import as Visual Studio Code project

...

## Build

```
pnpm run build
```

## Build in watch mode

### terminal

```
pnpm run watch
```

### Visual Studio Code

Run watch mode.

type `Ctrl + Shift + B`

## Load extension to chrome

Load `dist` directory

## Test

```
pnpm test
```

## Checks

```
pnpm run check      # typecheck + lint + fmt:check + test
pnpm run lint:fix   # auto-fix lint issues
pnpm run fmt        # format files
```
