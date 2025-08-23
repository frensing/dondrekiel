Project development guidelines (advanced)

This document captures project-specific knowledge to speed up development and reduce setup friction. It assumes
familiarity with Vite, React, TypeScript, Tailwind v4, and PWA tooling.

1. Build and configuration

- Runtime and toolchain
    - Node.js: Vite 6 and ESLint 9 work best on Node 20+. Use an active LTS (>= 20). The project is pure ESM ("type": "
      module").
    - Package scripts:
        - Dev: npm run dev → vite (HTTPS, see below)
        - Build: npm run build → tsc -b && vite build (composite TS refs)
        - Preview: npm run preview → vite preview
        - Lint: npm run lint → ESLint flat config

- Vite configuration (vite.config.ts)
    - Plugins: @vitejs/plugin-react, @tailwindcss/vite, vite-plugin-pwa, @vitejs/plugin-basic-ssl.
    - HTTPS dev server: server.https: true with basicSsl({ certDir: '~/dev/.cert' }).
        - Expected certificate files inside ~/dev/.cert. You can use mkcert to generate dev certs:
            - mkcert -install
            - mkdir -p ~/dev/.cert && cd ~/dev/.cert
            - mkcert localhost 127.0.0.1 ::1
            - Name the output files according to plugin-basic-ssl conventions (the plugin scans the directory); if you
              have multiple pairs, keep only the relevant ones to avoid ambiguity. Restart dev server after changes.
    - Host: true (dev server reachable on LAN).
    - Path alias: '@' → ./src configured in both Vite and tsconfig. Prefer import paths like import Comp from '
      @/components/...'.
    - PWA: vite-plugin-pwa is enabled in dev (devOptions.enabled = true) and build.
        - Manifest is defined inline; Workbox glob patterns include js, css, html, svg, png, ico.
        - pwaAssets: enabled; assets generated from public/favicon.svg via @vite-pwa/assets-generator.

- PWA assets generation
    - Config: pwa-assets.config.ts (minimal2023Preset, uses public/favicon.svg).
    - To regenerate assets (icons, etc.):
        - npx pwa-assets-generator generate
        - The generator auto-detects pwa-assets.config.ts. Commit new assets under public/ when you intentionally update
          branding.

- TypeScript configuration
    - Composite setup with tsconfig.json referencing tsconfig.app.json and tsconfig.node.json.
    - Strict mode, bundler moduleResolution, isolatedModules=true.
    - TS path alias mirrors Vite: '@/*' → './src/*'. Ensure both tsconfig and Vite stay in sync when changing aliases.

- Styling (Tailwind CSS v4)
    - Using @tailwindcss/vite plugin (no tailwind.config.{js,ts} required for basic usage).
    - src/index.css imports tailwindcss and tw-animate-css, defines theme tokens using CSS variables and @layer base
      with utility @apply. Dark mode is handled via a .dark class custom variant.
    - Keep design tokens centralized in src/index.css; components.json (shadcn config) points to src/index.css as the
      Tailwind entry.
- UI components (Shadcn)
    - Using shadcn ui components that should be installed locally using npx shadcn@latest add ...

- Routing and UI
    - React Router v7 with BrowserRouter in src/main.tsx. Bottom navigation is in src/components/BottomNav.tsx.
    - Leaflet/React-Leaflet is used for mapping, with geolocation via react-geolocated. Default icon assets are served
      from /public (marker icons). When changing marker assets, maintain the same paths or update MapView accordingly.

- PostgREST requests (dev utilities)
    - HTTP request collections are under postgrest/requests and target https://app.dondrekiel.de/api.
    - JetBrains HTTP Client: http-client.private.env.json (dev profile) contains username/password/team credentials. Do
      NOT commit real credentials; rotate if exposed. Use this for manual API probing during development.

2. Testing

Current status: no dedicated test framework in package.json. For quick verification during development, you can run
lightweight smoke tests with Node's built-in assert without adding dependencies. For full unit/component testing, prefer
Vitest + @testing-library/react (see recommendation below).

A. Minimal smoke test workflow (no new deps)

- Temporary file layout (example):
    - tests/demo.smoke.test.mjs
- Example content used to verify this repo (reads config and asserts expected project invariants):
    - Asserts package.json scripts and ESM mode
    - Asserts Vite alias '@' and https: true
    - Asserts tsconfig path alias '@/*' → './src/*'
- Run:
    - node tests/demo.smoke.test.mjs
- Expected output: "Smoke test passed: project configuration looks good." and exit code 0.
- Cleanup: Remove the temporary tests/ directory after verification (see note below).

Note: In this task, we created and executed such a smoke test and then deleted it, as requested. You can recreate it
locally following the steps above whenever needed.

B. Recommended full testing stack (future improvement)

- Add dependencies:
    - dev: vitest @vitest/ui @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
- Sample scripts:
    - "test": "vitest --run"
    - "test:watch": "vitest"
    - "test:ui": "vitest --ui"
- Vitest config (vite/vitest projects often work zero-config, but create vitest.config.ts if you need custom jsdom
  setup):
    - test.environment = 'jsdom'
    - test.setupFiles = ['src/test/setup.ts'] with import '@testing-library/jest-dom';
- Example component test (MapView with Leaflet is integration-heavy): prefer testing smaller UI pieces and business
  logic; for map interactions, abstract logic behind hooks or utility modules and test them in isolation.

3. Development notes and practices

- Code style
    - ESLint 9 (flat config) + typescript-eslint + react-hooks + react-refresh. Run npm run lint to catch issues (rules
      include react-refresh export guard and React Hooks rules).
    - Prettier 3 with prettierrc.json. Avoid conflicting ESLint formatting rules; rely on Prettier for style and ESLint
      for correctness.

- HTTPS in dev
    - Because server.https is forced true, dev requires local certificates. If you intentionally want HTTP for a quick
      test, temporarily comment https: true and basicSsl plugin in vite.config.ts, but prefer keeping HTTPS to mirror
      production behavior and to satisfy APIs requiring secure contexts (e.g., Geolocation and Service Worker
      behaviors).

- Service Workers and PWA
    - Dev mode has PWA devOptions.enabled=true; Service Worker will be active during dev. If you observe odd caching,
      use the browser Application panel to Unregister and Clear storage. During development, Workbox
      cleanupOutdatedCaches and clientsClaim are enabled.
    - After changing manifest/icons, rebuild or run the assets generator; then hard-reload and update the SW.

- Path alias and modules
    - Prefer '@/...' imports to avoid brittle relative paths. Keep tsconfig.json and vite.config.ts alias definitions
      consistent.
    - Project uses strict TS and isolatedModules. Avoid dynamic imports that confuse bundler resolution unless
      necessary.

- Tailwind v4 specifics
    - Utility-first styles come from @import 'tailwindcss' in src/index.css; you can add @layer and @theme blocks
      inline. No tailwind.config.js is used by default. If you need custom content scanning or plugins beyond what v4
      provides, evaluate whether you actually need a config file; many cases can be handled inline.

- Mapping and Geolocation
    - Geolocation requires secure context (HTTPS) and user permission. MapView centers on user coords if available,
      otherwise uses DEFAULT_COORDINATES. Ensure marker asset files exist in public/ (marker-icon.png,
      marker-icon-2x.png, marker-shadow.png). When changing tile providers, check attribution requirements.

- Router and layout
    - BottomNav uses NavLink isActive styles. Ensure main content reserves bottom padding (~ pb-20) to avoid overlap
      with the nav.

- API experiments
    - Use the JetBrains HTTP Client files under postgrest/requests. The http-client.private.env.json is for local-only
      secrets; keep real secrets out of VCS.

Appendix: Verified commands (as of this document)

- Install: npm i
- Dev (requires local certs): npm run dev
- Build: npm run build
- Preview (serves dist/): npm run preview
- Lint: npm run lint
- Smoke test example (temporary file): node tests/demo.smoke.test.mjs

Cleanup compliance for this task

- A temporary smoke test file was created under tests/ and executed successfully to validate the process. It has been
  removed per the task requirement, leaving only this .junie/guidelines.md file as the persistent change.
