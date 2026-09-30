/**
 * Curated high-resolution fashion photography assets for StyleBazaar prototype.
 * All URLs are verified HTTP 200 OK fashion apparel photography on Unsplash.
 * Organized by demographic (Men, Women, Kids) and garment category.
 */

const FASHION_IMAGE_POOLS: Record<string, string[]> = {
  // Men's categories
  'men-t-shirts': [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&auto=format&fit=crop&q=80',
  ],
  'men-shirts': [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1549037173-e3b717902c57?w=800&auto=format&fit=crop&q=80',
  ],
  'men-jeans': [
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=800&auto=format&fit=crop&q=80',
  ],
  'men-trousers': [
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80',
  ],
  'men-jackets': [
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&auto=format&fit=crop&q=80',
  ],
  'men-ethnic': [
    'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
  ],

  // Women's categories
  'women-kurtas': [
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80',
  ],
  'women-sarees': [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&auto=format&fit=crop&q=80',
  ],
  'women-dresses': [
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
  ],
  'women-tops': [
    'https://images.unsplash.com/photo-1534126511673-b6899657816a?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
  ],
  'women-jeans': [
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&auto=format&fit=crop&q=80',
  ],
  'women-bottoms': [
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
  ],
  'women-activewear': [
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&auto=format&fit=crop&q=80',
  ],

  // Kids categories
  'kids-boys': [
    'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&auto=format&fit=crop&q=80',
  ],
  'kids-girls': [
    'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80',
  ],
  'kids-infants': [
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&auto=format&fit=crop&q=80',
  ],
};

/**
 * Returns a stable 4-image array for a given product based on its category and id.
 */
export function getDummyImagesForProduct(
  id: string,
  gender: string,
  categoryPath: string[] = []
): string[] {
  const cat = (categoryPath[categoryPath.length - 1] || '').toLowerCase();
  const mainCat = (categoryPath[1] || '').toLowerCase();
  const g = gender.toLowerCase();

  let poolKey = 'men-t-shirts';

  if (g === 'men') {
    if (cat.includes('shirt') || mainCat.includes('topwear')) {
      if (cat.includes('t-shirt') || cat.includes('tee')) poolKey = 'men-t-shirts';
      else poolKey = 'men-shirts';
    } else if (cat.includes('jean')) {
      poolKey = 'men-jeans';
    } else if (cat.includes('trouser') || cat.includes('pant') || cat.includes('chino')) {
      poolKey = 'men-trousers';
    } else if (cat.includes('jacket') || cat.includes('winter')) {
      poolKey = 'men-jackets';
    } else if (cat.includes('kurta') || cat.includes('ethnic')) {
      poolKey = 'men-ethnic';
    }
  } else if (g === 'women') {
    if (cat.includes('saree')) {
      poolKey = 'women-sarees';
    } else if (cat.includes('kurta') || cat.includes('ethnic')) {
      if (cat.includes('bottom') || cat.includes('palazzo') || cat.includes('sharara')) {
        poolKey = 'women-bottoms';
      } else {
        poolKey = 'women-kurtas';
      }
    } else if (cat.includes('dress')) {
      poolKey = 'women-dresses';
    } else if (cat.includes('top') || cat.includes('blouse') || cat.includes('shirt')) {
      poolKey = 'women-tops';
    } else if (cat.includes('jean')) {
      poolKey = 'women-jeans';
    } else if (cat.includes('bra') || cat.includes('legging') || cat.includes('active')) {
      poolKey = 'women-activewear';
    } else {
      poolKey = 'women-dresses';
    }
  } else if (g === 'kids') {
    if (mainCat.includes('boy')) {
      poolKey = 'kids-boys';
    } else if (mainCat.includes('girl')) {
      poolKey = 'kids-girls';
    } else if (mainCat.includes('infant')) {
      poolKey = 'kids-infants';
    } else {
      poolKey = 'kids-boys';
    }
  }

  const pool = FASHION_IMAGE_POOLS[poolKey] || FASHION_IMAGE_POOLS['men-t-shirts'];

  // Hash the ID to produce deterministic index selection
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const startIndex = Math.abs(hash) % pool.length;

  // Return 4 images from pool
  const images: string[] = [];
  for (let i = 0; i < 4; i++) {
    const img = pool[(startIndex + i) % pool.length];
    images.push(img);
  }

  return images;
}

