import React from 'react'
import { ProductClient } from './ProductClient'
import { getOgImageUrl, encodeImageUrl } from '@/lib/utils'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Metadata } from 'next'
import { getCategoryDisplayName } from '@/lib/categoryDisplay'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string;  }>
}): Promise<Metadata> {
  const { slug } = await params
  const locale = 'en'
  const payload = await getPayload({ config: configPromise })
  
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1, // Need media depth for images
    locale: locale as 'en' | 'es',
    fallbackLocale: 'en',
  })

  if (!docs || docs.length === 0) {
    return { title: 'Product Not Found' }
  }

  const product = docs[0]
  const title = product.seoTitle || product.name || 'Product'
  const description = product.seoDescription || product.description?.substring(0, 160) || ''

  // Get primary image for open graph
  let imageUrl = undefined
  if (product.images && product.images.length > 0 && typeof product.images[0].image === 'object' && product.images[0].image?.url) {
    imageUrl = product.images[0].image.url
    if (imageUrl.startsWith('/')) {
      imageUrl = `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com'}${imageUrl}`
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: getOgImageUrl(title, description) }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [getOgImageUrl(title, description)],
    },
    alternates: {
      canonical: true ? `/product/${slug}` : `/${locale}/product/${slug}`,
      
    },
    robots: undefined,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string;  }>
}) {
  const { slug } = await params
  const locale = 'en'

  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'products',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 2, // To fetch categories and media
    locale: locale as 'en' | 'es',
    fallbackLocale: 'en',
  })

  if (!docs || docs.length === 0) {
    notFound()
  }

  const rawProduct = docs[0]

  // Map images
  const mappedImages = rawProduct.images?.map((img: any) => {
    if (typeof img.image === 'object' && img.image?.url) {
      return encodeImageUrl(img.image.url)
    }
    return ''
  }).filter(Boolean) || []

  // If no images are uploaded globally, check if variants have images
  if (mappedImages.length === 0) {
    let hasVariantImages = false
    if (rawProduct.hasVariants && rawProduct.variants?.length) {
      for (const variant of rawProduct.variants) {
        if (variant.images && variant.images.length > 0 && typeof variant.images[0].image === 'object' && variant.images[0].image?.url) {
          hasVariantImages = true
          break
        }
      }
    }
    
    // Only push fallback if NO global images and NO variant images exist
    if (!hasVariantImages) {
      mappedImages.push('/HelixBio Images/featured-research-2.webp')
    }
  }

  // Map categories
  const mappedCategories = rawProduct.categories?.map((cat: any) => {
    return typeof cat === 'object' ? getCategoryDisplayName(cat.name) : 'Category'
  }).filter(Boolean) || []

  // Map variants
  let mappedVariants = []
  if (rawProduct.hasVariants && rawProduct.variants?.length) {
    mappedVariants = rawProduct.variants.map((v: any, index: number) => {
      const mappedImages = v.images?.map((img: any) => {
        if (typeof img.image === 'object' && img.image?.url) {
          return encodeImageUrl(img.image.url)
        }
        return ''
      }).filter(Boolean) || []

      return {
        id: v.sku || `v-${index}`,
        sku: v.sku || '',
        title: v.options?.map((o: any) => o.value).join(' ') || `Variant ${index + 1}`,
        price: `$${Number(v.price || 0).toFixed(2)}`,
        salePrice: v.salePrice ? `$${Number(v.salePrice).toFixed(2)}` : undefined,
        inStock: (v.stock || 0) > 0,
        images: mappedImages,
      }
    })
  } else {
    mappedVariants = [
      {
        id: rawProduct.sku || String(rawProduct.id),
        sku: rawProduct.sku || '',
        title: 'Standard',
        price: `$${Number(rawProduct.price || 0).toFixed(2)}`,
        salePrice: rawProduct.salePrice ? `$${Number(rawProduct.salePrice).toFixed(2)}` : undefined,
        inStock: (rawProduct.stock || 0) > 0,
        images: [] as string[],
      }
    ]
  }

  // Map tabs (Pass as strings to avoid Turbopack RSC serialization panics)
  const mappedTabs = []
  if (rawProduct.productDetailsDescription) {
    mappedTabs.push({
      id: 'product-details',
      label: rawProduct.productDetailsTitle || 'Product Details',
      content: rawProduct.productDetailsDescription
    })
  }
  if (rawProduct.researchFocusDescription) {
    mappedTabs.push({
      id: 'research-focus',
      label: rawProduct.researchFocusTitle || 'Research Focus & Mechanism Overview',
      content: rawProduct.researchFocusDescription
    })
  }
  if (rawProduct.qualityPurityDescription) {
    mappedTabs.push({
      id: 'quality-purity',
      label: rawProduct.qualityPurityTitle || 'Quality & Purity Standards',
      content: rawProduct.qualityPurityDescription
    })
  }
  if (rawProduct.complianceNoticeDescription) {
    mappedTabs.push({
      id: 'compliance-notice',
      label: rawProduct.complianceNoticeTitle || 'Compliance Notice',
      content: rawProduct.complianceNoticeDescription
    })
  }

  if (mappedTabs.length === 0 && rawProduct.description) {
    mappedTabs.push({
      id: 'description',
      label: 'Description',
      content: rawProduct.description
    })
  }

  // Map FAQs
  const mappedFaqs = rawProduct.faqs?.map((faq: any, i: number) => ({
    id: `faq-${i}`,
    question: faq.question,
    answer: faq.answer
  })) || []

  // Extract COA URL
  let coaFileUrl = undefined
  if (typeof rawProduct.coaFile === 'object' && rawProduct.coaFile?.url) {
    coaFileUrl = encodeImageUrl(rawProduct.coaFile.url)
  }

  // Map to ProductData interface
  const productData = {
    id: String(rawProduct.id),
    name: rawProduct.name,
    slug: rawProduct.slug || slug,
    subtitle: rawProduct.seoDescription || '',
    category: mappedCategories[0] || 'Product',
    categories: mappedCategories,
    sku: rawProduct.sku,
    weight: rawProduct.weight,
    dimensions: rawProduct.dimensions,
    badges: rawProduct.status === 'active' ? [] : ['DRAFT'],
    description: rawProduct.description || '',
    shortDescription: rawProduct.description || rawProduct.seoDescription || '',
    averageRating: rawProduct.averageRating || 5.0,
    reviewCount: rawProduct.reviewCount || 0,

    bulkBundles: rawProduct.bulkBundles?.map((b: any) => ({
      id: b.id,
      name: b.name,
      quantity: b.quantity,
      discountPercentage: b.discountPercentage,
      price: b.price,
      salePrice: b.salePrice,
      image: typeof b.image === 'object' && b.image?.url ? encodeImageUrl(b.image.url) : undefined,
      variantOverrides: b.variantOverrides?.map((vo: any) => ({
        variantSku: vo.variantSku,
        price: vo.price,
        salePrice: vo.salePrice
      })) || []
    })) || [],
    images: mappedImages,
    variants: mappedVariants,
    coaFile: coaFileUrl,
    tabs: mappedTabs,
    faqs: mappedFaqs,
    reviews: [] as any[],
    relatedProducts: [] as any[],
    suggestedBlogs: [] as any[],
  }

  // Fetch related products (same category)
  if (rawProduct.categories && rawProduct.categories.length > 0) {
    const categoryIds = rawProduct.categories.map((c: any) => typeof c === 'object' ? c.id : c).filter(Boolean)
    
    if (categoryIds.length > 0) {
      const { docs: relatedDocs } = await payload.find({
        collection: 'products',
        where: {
          and: [
            {
              id: {
                not_equals: rawProduct.id,
              }
            },
            {
              'categories': {
                in: categoryIds,
              }
            },
            {
              status: {
                equals: 'active'
              }
            }
          ]
        },
        limit: 4,
        depth: 1, // Only need basic info and main image
      })

      productData.relatedProducts = relatedDocs.map((p: any) => {
        let imageUrl = '/HelixBio Images/featured-research-2.webp'
        let hoverImageUrl = undefined
        if (p.images && p.images.length > 0 && typeof p.images[0].image === 'object' && p.images[0].image?.url) {
          imageUrl = encodeImageUrl(p.images[0].image.url)
        }
        if (p.images && p.images.length > 1 && typeof p.images[1].image === 'object' && p.images[1].image?.url) {
          hoverImageUrl = encodeImageUrl(p.images[1].image.url)
        }

        // Fallback to variant images if no global image exists
        if (imageUrl === '/HelixBio Images/featured-research-2.webp' && p.hasVariants && p.variants && p.variants.length > 0) {
          for (const variant of p.variants) {
            if (variant.images && variant.images.length > 0 && typeof variant.images[0].image === 'object' && variant.images[0].image?.url) {
              imageUrl = encodeImageUrl(variant.images[0].image.url)
              if (variant.images.length > 1 && typeof variant.images[1].image === 'object' && variant.images[1].image?.url) {
                hoverImageUrl = encodeImageUrl(variant.images[1].image.url)
              }
              break
            }
          }
        }

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          image: imageUrl,
          hoverImage: hoverImageUrl,
          shortDescription: p.seoDescription || 'High-purity research peptide for laboratory use.',
          category: typeof p.categories?.[0] === 'object' ? p.categories[0].title : '',
          priceRange: `$${p.price?.toFixed(2) || '0.00'}`,
          originalPrice: p.salePrice ? `$${p.salePrice.toFixed(2)}` : undefined,
          isFrom: p.bulkBundles && p.bulkBundles.length > 0,
        }
      })
    }
  }

  // If we couldn't find related products by category, just get the newest ones
  if (productData.relatedProducts.length === 0) {
    const { docs: recentDocs } = await payload.find({
      collection: 'products',
      where: {
        id: {
          not_equals: rawProduct.id,
        },
        status: {
          equals: 'active'
        }
      },
      sort: '-createdAt',
      limit: 4,
      depth: 1,
    })

    productData.relatedProducts = recentDocs.map((p: any) => {
      let imageUrl = '/HelixBio Images/featured-research-2.webp'
      let hoverImageUrl = undefined
      if (p.images && p.images.length > 0 && typeof p.images[0].image === 'object' && p.images[0].image?.url) {
        imageUrl = encodeImageUrl(p.images[0].image.url)
      }
      if (p.images && p.images.length > 1 && typeof p.images[1].image === 'object' && p.images[1].image?.url) {
        hoverImageUrl = encodeImageUrl(p.images[1].image.url)
      }

      // Fallback to variant images if no global image exists
      if (imageUrl === '/HelixBio Images/featured-research-2.webp' && p.hasVariants && p.variants && p.variants.length > 0) {
        for (const variant of p.variants) {
          if (variant.images && variant.images.length > 0 && typeof variant.images[0].image === 'object' && variant.images[0].image?.url) {
            imageUrl = encodeImageUrl(variant.images[0].image.url)
            if (variant.images.length > 1 && typeof variant.images[1].image === 'object' && variant.images[1].image?.url) {
              hoverImageUrl = encodeImageUrl(variant.images[1].image.url)
            }
            break
          }
        }
      }

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: imageUrl,
        hoverImage: hoverImageUrl,
        shortDescription: p.seoDescription || 'High-purity research peptide for laboratory use.',
        category: typeof p.categories?.[0] === 'object' ? p.categories[0].title : '',
        priceRange: `$${p.price?.toFixed(2) || '0.00'}`,
        originalPrice: p.salePrice ? `$${p.salePrice.toFixed(2)}` : undefined,
        isFrom: p.bulkBundles && p.bulkBundles.length > 0,
      }
    })
  }

  // Generate JSON-LD Schemas
  
  // Fetch Suggested Blogs
  const { docs: blogDocs } = await payload.find({
    collection: 'blog-posts',
    where: {
      status: {
        equals: 'published'
      }
    },
    sort: '-publishedAt',
    limit: 3,
    depth: 1,
  })

  const mappedBlogs = blogDocs.map((post: any) => {
    let imageUrl = '/HelixBio Images/featured-research-2.webp'
    if (post.featuredImage && typeof post.featuredImage === 'object' && post.featuredImage.url) {
      imageUrl = encodeImageUrl(post.featuredImage.url)
    }
    return {
      id: String(post.id),
      title: post.title,
      slug: post.slug,
      author: typeof post.author === 'object' ? `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() || 'Admin' : 'Admin',
      date: new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      readTime: post.readTime || '5 min read',
      category: post.category || 'Research',
      excerpt: post.meta?.description || post.excerpt || 'Explore the latest research and clinical studies on this compound.',
      imageSrc: imageUrl
    }
  })

  productData.suggestedBlogs = mappedBlogs

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com'
  const productUrl = `${baseUrl}/product/${slug}`
  
  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: productData.name,
    description: productData.shortDescription,
    image: (productData.images.length > 0 ? productData.images : (
      productData.variants.find(v => v.images?.length > 0)?.images || ['/HelixBio Images/featured-research-2.webp']
    )).map((img: string) => img.startsWith('http') ? img : `${baseUrl}${img}`),
    sku: productData.sku || productData.id,
    mpn: productData.sku || productData.id,
    productID: productData.sku || productData.id,
    category: productData.category,
    ...(productData.weight ? {
      weight: {
        '@type': 'QuantitativeValue',
        value: productData.weight,
        unitCode: 'GRM' // Default to grams for peptides
      }
    } : {}),
    brand: {
      '@type': 'Brand',
      name: 'Helix Bio'
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Helix Bio'
    },
    offers: productData.variants.length > 1 ? {
      '@type': 'AggregateOffer',
      url: productUrl,
      priceCurrency: 'USD',
      lowPrice: Math.min(...productData.variants.map(v => Number((v.salePrice || v.price).replace(/[^0-9.]/g, '')))),
      highPrice: Math.max(...productData.variants.map(v => Number((v.salePrice || v.price).replace(/[^0-9.]/g, '')))),
      offerCount: productData.variants.length,
      offers: productData.variants.map(v => ({
        '@type': 'Offer',
        name: v.title,
        url: productUrl,
        priceCurrency: 'USD',
        price: (v.salePrice || v.price).replace(/[^0-9.]/g, ''),
        availability: v.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        sku: v.sku || productData.sku || productData.id,
      }))
    } : {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'USD',
      price: (productData.variants[0]?.salePrice || productData.variants[0]?.price || '$0').replace(/[^0-9.]/g, ''),
      availability: productData.variants[0]?.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      sku: productData.variants[0]?.sku || productData.sku || productData.id,
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'USD'
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'US'
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'd'
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 5,
            unitCode: 'd'
          }
        }
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'US',
        returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted'
      }
    },
    ...(productData.reviewCount > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: productData.averageRating,
        reviewCount: productData.reviewCount
      }
    } : {}),
    ...(productData.reviews && productData.reviews.length > 0 ? {
      review: productData.reviews
    } : {}),
  }

  const faqSchema = productData.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: productData.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  } : undefined

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Research Peptides',
        item: `${baseUrl}/shop`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: productData.categories[0] || 'Category',
        item: `${baseUrl}/shop?category=${encodeURIComponent(productData.categories[0] || '')}`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: productData.name,
        item: productUrl
      }
    ]
  }

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="flex-1">
        <ProductClient product={productData as any} />
      </main>
    </div>
  )
}
