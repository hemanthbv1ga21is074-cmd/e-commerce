import { PrismaClient, Gender } from '@prisma/client';
import { products } from '../../src/data/products';
import { categoryTree } from '../../src/data/categories';

// Connect using direct connection for max performance
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

function mapGender(g: string): Gender {
  const upper = (g || '').toUpperCase();
  if (upper === 'MEN') return Gender.MEN;
  if (upper === 'WOMEN') return Gender.WOMEN;
  return Gender.KIDS;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function seedCategories() {
  console.log('--- Checking & Seeding Categories ---');
  for (const root of categoryTree) {
    const rootGender = mapGender(root.gender || root.slug);
    const rootCategory = await prisma.category.upsert({
      where: { slug: root.slug },
      update: { label: root.label, gender: rootGender },
      create: {
        id: root.id,
        label: root.label,
        slug: root.slug,
        gender: rootGender,
      },
    });

    if (root.children) {
      for (const sub of root.children) {
        const subSlug = `${root.slug}-${sub.slug}`;
        const subCategory = await prisma.category.upsert({
          where: { slug: subSlug },
          update: { label: sub.label, gender: rootGender, parentId: rootCategory.id },
          create: {
            id: sub.id,
            label: sub.label,
            slug: subSlug,
            gender: rootGender,
            parentId: rootCategory.id,
          },
        });

        if (sub.children) {
          for (const leaf of sub.children) {
            const leafSlug = `${root.slug}-${leaf.slug}`;
            await prisma.category.upsert({
              where: { slug: leafSlug },
              update: { label: leaf.label, gender: rootGender, parentId: subCategory.id },
              create: {
                id: leaf.id,
                label: leaf.label,
                slug: leafSlug,
                gender: rootGender,
                parentId: subCategory.id,
              },
            });
          }
        }
      }
    }
  }
}

async function seedProducts() {
  console.log(`--- Seeding ${products.length} Products ---`);

  // Ensure all brands exist
  const existingBrands = await prisma.brand.findMany();
  const brandMap = new Map(existingBrands.map(b => [b.name.toLowerCase(), b.id]));

  for (const item of products) {
    const brandName = item.brand || 'StyleBazaar';
    if (!brandMap.has(brandName.toLowerCase())) {
      const b = await prisma.brand.create({
        data: {
          name: brandName,
          slug: slugify(brandName),
          tagline: `${brandName} Fashion`,
        },
      });
      brandMap.set(brandName.toLowerCase(), b.id);
    }
  }

  // Pre-fetch all categories for lookup
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));

  // Batch insert all products
  for (let i = 0; i < products.length; i++) {
    const item = products[i];
    const brandId = brandMap.get((item.brand || 'StyleBazaar').toLowerCase())!;
    const gender = mapGender(item.gender);
    const mrpInPaise = Math.round(item.mrp * 100);
    const priceInPaise = Math.round(item.price * 100);
    const discountPercent = item.discountPercent || Math.round(((item.mrp - item.price) / item.mrp) * 100);

    // Find category ID from categoryPath
    let categoryId: string | null = null;
    if (item.categoryPath && item.categoryPath.length > 0) {
      const leafSlug = slugify(item.categoryPath[item.categoryPath.length - 1]);
      const fullLeafSlug = `${slugify(item.gender)}-${leafSlug}`;
      categoryId = categoryMap.get(fullLeafSlug) || categoryMap.get(leafSlug) || null;
    }

    const prod = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description || `Premium ${item.title}`,
        gender,
        categoryPath: item.categoryPath,
        brandId,
        categoryId,
        mrpInPaise,
        priceInPaise,
        discountPercent,
        fabric: item.fabric || 'Cotton',
        fit: item.fit || 'Regular',
        pattern: item.pattern || 'Solid',
        occasion: item.occasion || ['Casual'],
        highlights: item.highlights || ['Premium quality'],
        careInstructions: item.careInstructions || ['Machine wash'],
        deliveryEstimateDays: item.deliveryEstimateDays || 4,
        returnWindowDays: item.returnWindowDays || 30,
        tags: item.tags || [],
        rating: item.rating || 4.2,
        ratingCount: item.ratingCount || 100,
        isArchived: false,
      },
      create: {
        id: item.id,
        slug: item.slug,
        title: item.title,
        description: item.description || `Premium ${item.title}`,
        gender,
        categoryPath: item.categoryPath,
        brandId,
        categoryId,
        mrpInPaise,
        priceInPaise,
        discountPercent,
        fabric: item.fabric || 'Cotton',
        fit: item.fit || 'Regular',
        pattern: item.pattern || 'Solid',
        occasion: item.occasion || ['Casual'],
        highlights: item.highlights || ['Premium quality'],
        careInstructions: item.careInstructions || ['Machine wash'],
        deliveryEstimateDays: item.deliveryEstimateDays || 4,
        returnWindowDays: item.returnWindowDays || 30,
        tags: item.tags || [],
        rating: item.rating || 4.2,
        ratingCount: item.ratingCount || 100,
        isArchived: false,
      },
    });

    // Delete existing images & variants for clean upsert
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });

    // Batch create images
    if (item.images && item.images.length > 0) {
      await prisma.productImage.createMany({
        data: item.images.map((url, idx) => ({
          productId: prod.id,
          url,
          altText: `${item.title} image ${idx + 1}`,
          sortOrder: idx,
        })),
      });
    }

    // Batch create variants
    const colors = item.colors && item.colors.length > 0
      ? item.colors
      : [{ name: 'Default', hex: '#000000', images: [] }];
    const sizes = item.sizes && item.sizes.length > 0
      ? item.sizes
      : [{ name: 'M', stock: 15 }];

    const variantsData: any[] = [];
    for (const color of colors) {
      for (const size of sizes) {
        variantsData.push({
          productId: prod.id,
          skuCode: `${item.id}-${slugify(color.name)}-${slugify(size.name)}`,
          size: size.name,
          colorName: color.name,
          colorHex: color.hex || '#000000',
          stock: size.stock,
        });
      }
    }

    if (variantsData.length > 0) {
      await prisma.productVariant.createMany({
        data: variantsData,
        skipDuplicates: true,
      });
    }

    if ((i + 1) % 20 === 0 || i === products.length - 1) {
      console.log(`Seeded ${i + 1} / ${products.length} products`);
    }
  }

  const finalCount = await prisma.product.count();
  const variantsCount = await prisma.productVariant.count();
  const imagesCount = await prisma.productImage.count();
  console.log(`\nAll done! Total in Supabase: ${finalCount} products, ${variantsCount} variants, ${imagesCount} images.`);
}

async function main() {
  await seedCategories();
  await seedProducts();
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
