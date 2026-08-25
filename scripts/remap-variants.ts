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

  let updatedCount = 0;

  for (const prod of products.docs) {
    let needsUpdate = false;
    let dataToUpdate: any = {};

    let searchString = (prod.name || prod.slug).toLowerCase().replace(/[^a-z0-9]/g, ' ');
    if (prod.slug === 'cagrilintide') searchString += ' cag';
    if (prod.slug === 'tirzepatide') searchString += ' tirz';
    if (prod.slug === 'semaglutide') searchString += ' sema';
    if (prod.slug === 'retatrutide') searchString += ' reta';
    if (prod.slug === 'melanotan-1') searchString += ' melanton'; // common typo in images
    if (prod.slug === 'melanotan-2') searchString += ' melanton';

    const searchTerms = searchString.split(' ').filter(t => t.length > 2);
    
    let productMedia = media.docs.filter(m => {
        const lowerFilename = m.filename.toLowerCase();
        return searchTerms.some(term => lowerFilename.includes(term));
    });

    if (productMedia.length === 0) continue;

    if (prod.hasVariants && prod.variants && Array.isArray(prod.variants)) {
      const updatedVariants = prod.variants.map((v: any) => {
        let variantMatch = null;
        
        // Find all option values (e.g., '10mg', '5mg')
        const variantOptions = v.options?.map((o:any) => o.value.toLowerCase().replace(/\s+/g, '')) || [];
        const sizeOption = variantOptions.find((opt: string) => opt.includes('mg') || opt.includes('mcg') || opt.includes('iu') || opt.includes('ml'));
        
        if (sizeOption) {
          // Find the exact image containing this size
          for (const m of productMedia) {
            const lowerFilename = m.filename.toLowerCase().replace(/\s+/g, '');
            if (lowerFilename.includes(sizeOption)) {
              variantMatch = m;
              // Prefer images that don't have '-1', '-2' if possible, or just take the first match
              break;
            }
          }
        } else {
          // If no specific size option, try to match the first image
          variantMatch = productMedia[0];
        }

        if (variantMatch) {
          return {
            ...v,
            images: [{ image: variantMatch.id }]
          };
        }
        
        // If no match could be found for this specific variant size, just use the first product media
        return {
          ...v,
          images: [{ image: productMedia[0].id }]
        };
      });

      const variantsChanged = JSON.stringify(updatedVariants) !== JSON.stringify(prod.variants);
      if (variantsChanged) {
        dataToUpdate.variants = updatedVariants;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      console.log(`Re-assigning variants for ${prod.slug}...`);
      await p.update({
        collection: 'products',
        id: prod.id,
        data: dataToUpdate
      });
      updatedCount++;
    }
  }

  console.log(`\nSuccessfully hard-remapped variants for ${updatedCount} products!`);
  process.exit(0);
}

run().catch(console.error);
