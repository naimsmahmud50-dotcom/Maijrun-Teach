const fs = require('fs')
const path = require('path')

const TARGET_DIR = path.resolve(__dirname, '../../gh-pages-worktree')
const BASE_URL = 'http://localhost:8009/Maijrun-Teach'
const COOKIE = '_medusa_cache_id=test-session'

const DEMO_HANDLES = [
  'apple-macbook-pro-16-m4-max',
  'apple-macbook-pro-16-m4-pro',
  'apple-macbook-air-13-m3',
  'apple-macbook-air-15-m3',
  'asus-rog-zephyrus-g16',
  'lenovo-legion-pro-5',
  'lenovo-thinkpad-x1-carbon-gen12',
  'apple-iphone-16-pro',
  'apple-iphone-16-pro-max',
  'samsung-galaxy-s25-ultra',
  'samsung-galaxy-z-fold-6',
  'google-pixel-9-pro-xl',
  'oneplus-13-flagship',
  'xiaomi-15-ultra',
  'apple-ipad-pro-13-m4',
  'maijrun-titan-rtx-5090-extreme-battlestation',
  'apple-mac-studio-m2-ultra',
  'apple-mac-mini-m4-pro',
  'maijrun-horizon-creator-workstation',
  'maijrun-apex-battlestation',
  'apple-watch-ultra-2-titanium',
  'sony-wf-1000xm5',
  'bose-quietcomfort-ultra',
  'sony-wh-1000xm5',
  'apple-airpods-max-usbc',
  'keychron-q1-pro-mechanical-keyboard',
  'asus-rog-swift-oled-pg32ucdm',
  'lg-ultragear-32-oled-4k'
]

const STATIC_PAGES = [
  '',
  'store',
  'compare',
  'pc-builder',
  'cart',
  'account',
  'admin',
  'track',
  'privacy-policy',
  'refund-policy',
  'terms-of-service'
]

async function copyDir(src, dest) {
  await fs.promises.mkdir(dest, { recursive: true })
  const entries = await fs.promises.readdir(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    } else {
      await fs.promises.copyFile(srcPath, destPath)
    }
  }
}

async function fetchRoute(routePath) {
  const url = `${BASE_URL}${routePath.startsWith('/') ? routePath : '/' + routePath}`
  const res = await fetch(url, {
    headers: {
      Cookie: COOKIE,
      'User-Agent': 'Mozilla/5.0 (Static-Exporter)'
    }
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url} (status ${res.status})`)
  }
  return await res.text()
}

async function writeHtml(relativePath, html) {
  const fullPath = path.join(TARGET_DIR, relativePath)
  await fs.promises.mkdir(path.dirname(fullPath), { recursive: true })
  await fs.promises.writeFile(fullPath, html, 'utf8')
}

async function main() {
  console.log('Target directory:', TARGET_DIR)
  if (!fs.existsSync(TARGET_DIR)) {
    throw new Error(`Target directory ${TARGET_DIR} does not exist!`)
  }

  // 1. Copy _next/static
  const staticSrc = path.resolve(__dirname, '../storefront/.next/static')
  const staticDest = path.join(TARGET_DIR, '_next/static')
  console.log(`Copying static assets from ${staticSrc} to ${staticDest}...`)
  await copyDir(staticSrc, staticDest)

  // 2. Copy public directory assets
  const publicSrc = path.resolve(__dirname, '../storefront/public')
  if (fs.existsSync(publicSrc)) {
    console.log(`Copying public assets from ${publicSrc}...`)
    const pubFiles = await fs.promises.readdir(publicSrc, { withFileTypes: true })
    for (const f of pubFiles) {
      if (f.isFile()) {
        await fs.promises.copyFile(path.join(publicSrc, f.name), path.join(TARGET_DIR, f.name))
      }
    }
  }

  // 3. Ensure .nojekyll
  await fs.promises.writeFile(path.join(TARGET_DIR, '.nojekyll'), '')

  // 4. Export Pages
  let count = 0

  // Export BD and mirror to Root
  for (const p of STATIC_PAGES) {
    const route = p ? `/bd/${p}` : '/bd'
    const html = await fetchRoute(route)
    
    // Write to bd/...
    const bdFile = p ? `bd/${p}/index.html` : 'bd/index.html'
    await writeHtml(bdFile, html)
    count++

    // Mirror to root ...
    const rootFile = p ? `${p}/index.html` : 'index.html'
    await writeHtml(rootFile, html)
    count++
  }

  // Export US
  for (const p of STATIC_PAGES) {
    const route = p ? `/us/${p}` : '/us'
    const html = await fetchRoute(route)
    const usFile = p ? `us/${p}/index.html` : 'us/index.html'
    await writeHtml(usFile, html)
    count++
  }

  // Export all 28 Product PDPs
  for (const handle of DEMO_HANDLES) {
    // BD product
    const bdHtml = await fetchRoute(`/bd/products/${handle}`)
    await writeHtml(`bd/products/${handle}/index.html`, bdHtml)
    await writeHtml(`products/${handle}/index.html`, bdHtml)
    count += 2

    // US product
    const usHtml = await fetchRoute(`/us/products/${handle}`)
    await writeHtml(`us/products/${handle}/index.html`, usHtml)
    count++
  }

  // 5. Create 404.html from index.html with redirect fallback script
  const indexPath = path.join(TARGET_DIR, 'index.html')
  let indexHtml = await fs.promises.readFile(indexPath, 'utf8')
  const redirectScript = `
<script>
(function() {
  var p = window.location.pathname;
  if (p.startsWith('/Maijrun-Teach') && !p.endsWith('/') && !p.includes('.')) {
    window.location.replace(p + '/' + window.location.search + window.location.hash);
  }
})();
</script>`
  if (!indexHtml.includes("if (p.startsWith('/Maijrun-Teach')")) {
    indexHtml = indexHtml.replace('</body>', `${redirectScript}</body>`)
  }
  await fs.promises.writeFile(path.join(TARGET_DIR, '404.html'), indexHtml, 'utf8')
  console.log('Wrote 404.html with client basePath redirect fallback.')

  console.log(`Successfully exported all ${count} pages and routes to gh-pages!`)
}

main().catch(err => {
  console.error('Export failed:', err)
  process.exit(1)
})
