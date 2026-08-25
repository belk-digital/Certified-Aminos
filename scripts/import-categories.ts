import 'dotenv/config';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import fs from 'fs';

async function run() {
  const p = await getPayload({
    config: configPromise,
  });

  const importDataPath = 'C:\\Users\\aquib\\OneDrive\\Desktop\\99 Purity Peptides NextJS\\category-migration2.json';
  if (!fs.existsSync(importDataPath)) {
    console.error(`Import data file not found at ${importDataPath}`);
    process.exit(1);
  }

  const exportData = JSON.parse(fs.readFileSync(importDataPath, 'utf8'));
  const categoriesToImport = exportData.categories;
  const productsToImport = exportData.products;

  console.log(`Found ${categoriesToImport.length} categories to import.`);

  // 1. Fetch all existing categories in HelixBio and delete them
  const existingCategories = await p.find({
    collection: 'categories',
    limit: 1000,
  });

  console.log(`Found ${existingCategories.totalDocs} existing categories in HelixBio. Deleting them...`);
  for (const cat of existingCategories.docs) {
    await p.delete({
      collection: 'categories',
      id: cat.id,
    });
  }
  console.log('All existing categories deleted.');

  // 2. Create the new categories and store a mapping of their new IDs
  const slugToIdMap: Record<string, string | number> = {};
  for (const cat of categoriesToImport) {
    const createdCat = await p.create({
      collection: 'categories',
      data: {
        name: cat.name,
        slug: cat.slug,
      },
    });
    slugToIdMap[createdCat.slug] = createdCat.id;
    console.log(`Created category: ${cat.name} (${createdCat.id})`);
  }

  // 3. Update products
  console.log(`Updating products...`);
  const allProducts = await p.find({
    collection: 'products',
    limit: 1000,
  });

  for (const prod of allProducts.docs) {
    // Find matching product in the export data
    const matchedExportProduct = productsToImport.find((pExport: any) => pExport.slug === prod.slug);
    
    let newCategoryIds: (string | number)[] = [];
    if (matchedExportProduct) {
      // Map the imported category slugs to the newly created IDs
      newCategoryIds = matchedExportProduct.categories
        .map((catSlug: string) => slugToIdMap[catSlug])
        .filter(Boolean);
    }

    // Update the product's categories
    await p.update({
      collection: 'products',
      id: prod.id,
      data: {
        categories: newCategoryIds,
      },
    });
    console.log(`Updated product ${prod.slug} with categories: [${newCategoryIds.join(', ')}]`);
  }

  console.log('Migration complete!');
  process.exit(0);
}

run().catch(console.error);
