import 'dotenv/config';
import { getPayload } from 'payload';
import configPromise from '../src/payload.config';

async function run() {
  const p = await getPayload({ config: configPromise });

  const products = await p.find({
    collection: 'products',
    limit: 1000,
    depth: 1
  });

  const media = await p.find({
    collection: 'media',
    limit: 1000,
  });

  console.log(`Found ${products.totalDocs} products and ${media.totalDocs} media files.`);

  let updatedCount = 0;

  for (const prod of products.docs) {
    let needsUpdate = false;
    let dataToUpdate: any = {};

    // Determine the base search string for the product
    let searchString = (prod.name || prod.slug).toLowerCase().replace(/[^a-z0-9]/g, ' ');
    // special cases mapping
    if (prod.slug === 'cagrilintide') searchString += ' cag';
    if (prod.slug === 'tirzepatide') searchString += ' tirz';
    if (prod.slug === 'semaglutide') searchString += ' sema';
    if (prod.slug === 'retatrutide') searchString += ' reta';

    const searchTerms = searchString.split(' ').filter(t => t.length > 2);
    
    // Find all images matching this product's base name
    let productMedia = media.docs.filter(m => {
        const lowerFilename = m.filename.toLowerCase();
        return searchTerms.some(term => lowerFilename.includes(term));
    });

    if (productMedia.length === 0) continue;

    // Check main image
    let hasMainImage = !!(prod.meta?.image || prod.image || (prod.images && prod.images.length > 0));
    if (!hasMainImage) {
      // Just pick the first matched image as the main product image
      // Prefer images that DO NOT have "mg" or "spray" in the name if possible, or just the first one.
      dataToUpdate.images = [
        {
          image: productMedia[0].id
        }
      ];
      needsUpdate = true;
    }

    // Check variant images
    if (prod.hasVariants && prod.variants && Array.isArray(prod.variants)) {
      const updatedVariants = prod.variants.map((v: any) => {
        if (v.images && v.images.length > 0) return v; // already has image

        // Try to match variant
        // e.g. options: [{ key: 'Size', value: '10mg' }]
        let variantMatch = null;
        const variantOptions = v.options?.map((o:any) => o.value.toLowerCase()) || [];
        
        for (const m of productMedia) {
          const lowerFilename = m.filename.toLowerCase();
          // if variant is "10mg", see if filename contains "10mg"
          if (variantOptions.some((opt: string) => lowerFilename.includes(opt.replace(/\s+/g, '')))) {
            variantMatch = m;
            break;
          }
        }

        if (variantMatch) {
          return {
            ...v,
            images: [{ image: variantMatch.id }]
          };
        }
        return v;
      });

      // Check if variants actually changed
      const variantsChanged = JSON.stringify(updatedVariants) !== JSON.stringify(prod.variants);
      if (variantsChanged) {
        dataToUpdate.variants = updatedVariants;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      console.log(`Updating ${prod.slug}...`);
      if (dataToUpdate.images) {
         console.log(`  -> Main Image: ${productMedia[0].filename}`);
      }
      if (dataToUpdate.variants) {
         console.log(`  -> Variants updated based on options.`);
      }

      await p.update({
        collection: 'products',
        id: prod.id,
        data: dataToUpdate
      });
      updatedCount++;
    }
  }

  console.log(`\nSuccessfully auto-matched and updated ${updatedCount} products!`);
  process.exit(0);
}

run().catch(console.error);
