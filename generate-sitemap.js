import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'

const supabaseUrl = 'https://xyfjwfiogdbyqfkkglrl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5Zmp3ZmlvZ2RieXFma2tnbHJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDcxMDUsImV4cCI6MjA5MTY4MzEwNX0.VbZC_ikMLXr-MlNZYwhPws3Q7aZ6zfKKDH4ks6lMrho'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const SITE_URL = 'https://masanienterprise.com'
const TODAY = new Date().toISOString().split('T')[0]

async function generateSitemap() {
  // Fetch all visible products
  const { data: products } = await supabase
    .from('products')
    .select('slug, created_at')
    .eq('is_visible', true)

  // Fetch all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/products', priority: '0.9', changefreq: 'daily' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
  ]

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`

  // Static pages
  for (const page of staticPages) {
    xml += `  <url>\n`
    xml += `    <loc>${SITE_URL}${page.url}</loc>\n`
    xml += `    <lastmod>${TODAY}</lastmod>\n`
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`
    xml += `    <priority>${page.priority}</priority>\n`
    xml += `  </url>\n`
  }

  // Category filter pages
  if (categories) {
    for (const cat of categories) {
      xml += `  <url>\n`
      xml += `    <loc>${SITE_URL}/products?category=${cat.slug}</loc>\n`
      xml += `    <lastmod>${TODAY}</lastmod>\n`
      xml += `    <changefreq>weekly</changefreq>\n`
      xml += `    <priority>0.8</priority>\n`
      xml += `  </url>\n`
    }
  }

  // Dynamic product pages
  if (products) {
    for (const product of products) {
      const lastmod = product.created_at
        ? product.created_at.split('T')[0]
        : TODAY
      xml += `  <url>\n`
      xml += `    <loc>${SITE_URL}/products/${product.slug}</loc>\n`
      xml += `    <lastmod>${lastmod}</lastmod>\n`
      xml += `    <changefreq>monthly</changefreq>\n`
      xml += `    <priority>0.8</priority>\n`
      xml += `  </url>\n`
    }
  }

  xml += `</urlset>`

  writeFileSync('./public/sitemap.xml', xml, 'utf-8')
  console.log(`✅ Sitemap generated with:`)
  console.log(`   - ${staticPages.length} static pages`)
  console.log(`   - ${categories?.length || 0} category pages`)
  console.log(`   - ${products?.length || 0} product pages`)
  console.log(`   Saved to: public/sitemap.xml`)
}

generateSitemap()
