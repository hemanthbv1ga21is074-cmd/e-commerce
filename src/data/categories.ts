import type { CategoryNode, MegaMenuSection } from '../types';

export const categoryTree: CategoryNode[] = [
  {
    id: 'men',
    label: 'Men',
    slug: 'men',
    gender: 'men',
    children: [
      {
        id: 'men-topwear', label: 'Topwear', slug: 'topwear', children: [
          { id: 'men-tshirts', label: 'T-Shirts', slug: 't-shirts', productCount: 8 },
          { id: 'men-shirts', label: 'Casual Shirts', slug: 'shirts', productCount: 6 },
          { id: 'men-formal-shirts', label: 'Formal Shirts', slug: 'formal-shirts', productCount: 4 },
        ]
      },
      {
        id: 'men-bottomwear', label: 'Bottomwear', slug: 'bottomwear', children: [
          { id: 'men-jeans', label: 'Jeans', slug: 'jeans', productCount: 5 },
          { id: 'men-trousers', label: 'Trousers', slug: 'trousers', productCount: 4 },
          { id: 'men-shorts', label: 'Shorts', slug: 'shorts', productCount: 3 },
        ]
      },
      {
        id: 'men-ethnic', label: 'Ethnic Wear', slug: 'ethnic', children: [
          { id: 'men-kurtas', label: 'Kurtas', slug: 'kurtas', productCount: 4 },
          { id: 'men-ethnic-sets', label: 'Kurta Sets', slug: 'kurta-sets', productCount: 3 },
        ]
      },
      {
        id: 'men-winterwear', label: 'Winter Wear', slug: 'winterwear', children: [
          { id: 'men-jackets', label: 'Jackets', slug: 'jackets', productCount: 4 },
          { id: 'men-sweaters', label: 'Sweaters', slug: 'sweaters', productCount: 3 },
        ]
      },
      {
        id: 'men-activewear', label: 'Activewear', slug: 'activewear', children: [
          { id: 'men-trackpants', label: 'Track Pants', slug: 'track-pants', productCount: 3 },
          { id: 'men-sports-tshirts', label: 'Sports T-Shirts', slug: 'sports-tshirts', productCount: 3 },
        ]
      },
      {
        id: 'men-innerwear', label: 'Innerwear', slug: 'innerwear', children: [
          { id: 'men-briefs', label: 'Briefs', slug: 'briefs', productCount: 2 },
          { id: 'men-vests', label: 'Vests', slug: 'vests', productCount: 2 },
        ]
      },
    ],
  },
  {
    id: 'women',
    label: 'Women',
    slug: 'women',
    gender: 'women',
    children: [
      {
        id: 'women-western', label: 'Western Wear', slug: 'western', children: [
          { id: 'women-dresses', label: 'Dresses', slug: 'dresses', productCount: 6 },
          { id: 'women-tops', label: 'Tops', slug: 'tops', productCount: 5 },
          { id: 'women-jeans', label: 'Jeans', slug: 'jeans', productCount: 4 },
        ]
      },
      {
        id: 'women-ethnic', label: 'Ethnic Wear', slug: 'ethnic', children: [
          { id: 'women-kurtas', label: 'Kurtas & Sets', slug: 'kurtas', productCount: 6 },
          { id: 'women-sarees', label: 'Sarees', slug: 'sarees', productCount: 4 },
          { id: 'women-ethnic-bottoms', label: 'Ethnic Bottoms', slug: 'ethnic-bottoms', productCount: 3 },
        ]
      },
      {
        id: 'women-activewear', label: 'Activewear', slug: 'activewear', children: [
          { id: 'women-sports-bras', label: 'Sports Bras', slug: 'sports-bras', productCount: 3 },
          { id: 'women-leggings', label: 'Leggings', slug: 'leggings', productCount: 3 },
        ]
      },
    ],
  },
  {
    id: 'kids',
    label: 'Kids',
    slug: 'kids',
    gender: 'kids',
    children: [
      {
        id: 'kids-boys', label: 'Boys', slug: 'boys', children: [
          { id: 'kids-boys-tshirts', label: 'T-Shirts', slug: 't-shirts', productCount: 5 },
          { id: 'kids-boys-shorts', label: 'Shorts', slug: 'shorts', productCount: 3 },
          { id: 'kids-boys-jeans', label: 'Jeans', slug: 'jeans', productCount: 3 },
        ]
      },
      {
        id: 'kids-girls', label: 'Girls', slug: 'girls', children: [
          { id: 'kids-girls-dresses', label: 'Dresses', slug: 'dresses', productCount: 5 },
          { id: 'kids-girls-tops', label: 'Tops', slug: 'tops', productCount: 3 },
        ]
      },
      {
        id: 'kids-infants', label: 'Infants', slug: 'infants', children: [
          { id: 'kids-infants-rompers', label: 'Rompers', slug: 'rompers', productCount: 4 },
          { id: 'kids-infants-sets', label: 'Clothing Sets', slug: 'sets', productCount: 4 },
        ]
      },
    ],
  },
];

export const megaMenuSections: MegaMenuSection[] = [
  {
    label: 'Men',
    gender: 'men',
    columns: [
      {
        title: 'Topwear',
        links: [
          { label: 'T-Shirts', href: '/men/t-shirts' },
          { label: 'Casual Shirts', href: '/men/shirts' },
          { label: 'Formal Shirts', href: '/men/formal-shirts' },
        ],
      },
      {
        title: 'Bottomwear',
        links: [
          { label: 'Jeans', href: '/men/jeans' },
          { label: 'Trousers', href: '/men/trousers' },
          { label: 'Shorts', href: '/men/shorts' },
        ],
      },
      {
        title: 'Ethnic Wear',
        links: [
          { label: 'Kurtas', href: '/men/kurtas' },
          { label: 'Kurta Sets', href: '/men/kurta-sets' },
        ],
      },
      {
        title: 'Winter Wear',
        links: [
          { label: 'Jackets', href: '/men/jackets' },
          { label: 'Sweaters', href: '/men/sweaters' },
        ],
      },
      {
        title: 'Activewear',
        links: [
          { label: 'Track Pants', href: '/men/track-pants' },
          { label: 'Sports T-Shirts', href: '/men/sports-tshirts' },
        ],
      },
    ],
  },
  {
    label: 'Women',
    gender: 'women',
    columns: [
      {
        title: 'Western Wear',
        links: [
          { label: 'Dresses', href: '/women/dresses' },
          { label: 'Tops', href: '/women/tops' },
          { label: 'Jeans', href: '/women/jeans' },
        ],
      },
      {
        title: 'Ethnic Wear',
        links: [
          { label: 'Kurtas & Sets', href: '/women/kurtas' },
          { label: 'Sarees', href: '/women/sarees' },
          { label: 'Ethnic Bottoms', href: '/women/ethnic-bottoms' },
        ],
      },
      {
        title: 'Activewear',
        links: [
          { label: 'Sports Bras', href: '/women/sports-bras' },
          { label: 'Leggings', href: '/women/leggings' },
        ],
      },
    ],
  },
  {
    label: 'Kids',
    gender: 'kids',
    columns: [
      {
        title: 'Boys',
        links: [
          { label: 'T-Shirts', href: '/kids/t-shirts' },
          { label: 'Shorts', href: '/kids/shorts' },
          { label: 'Jeans', href: '/kids/jeans' },
        ],
      },
      {
        title: 'Girls',
        links: [
          { label: 'Dresses', href: '/kids/dresses' },
          { label: 'Tops', href: '/kids/tops' },
        ],
      },
      {
        title: 'Infants',
        links: [
          { label: 'Rompers', href: '/kids/rompers' },
          { label: 'Clothing Sets', href: '/kids/sets' },
        ],
      },
    ],
  },
  {
    label: 'Brands',
    gender: 'brands',
    columns: [
      {
        title: 'Popular Brands',
        links: [
          { label: 'Zephyr', href: '/search?brand=Zephyr' },
          { label: 'UrbanThread', href: '/search?brand=UrbanThread' },
          { label: 'Kalyani', href: '/search?brand=Kalyani' },
          { label: 'IronForge', href: '/search?brand=IronForge' },
          { label: 'Saheli', href: '/search?brand=Saheli' },
        ],
      },
      {
        title: 'Trending',
        links: [
          { label: 'StreetCode', href: '/search?brand=StreetCode' },
          { label: 'PeakPulse', href: '/search?brand=PeakPulse' },
          { label: 'Drift', href: '/search?brand=Drift' },
          { label: 'Vogue Valley', href: '/search?brand=Vogue Valley' },
          { label: 'Zenith', href: '/search?brand=Zenith' },
        ],
      },
      {
        title: 'Kids Brands',
        links: [
          { label: 'LilStar', href: '/search?brand=LilStar' },
          { label: 'TinyTroop', href: '/search?brand=TinyTroop' },
          { label: 'Nimboo', href: '/search?brand=Nimboo' },
        ],
      },
    ],
  },
  {
    label: 'Sale',
    gender: 'sale',
    columns: [
      {
        title: 'Best Deals',
        links: [
          { label: 'Min 40% Off', href: '/search?discount=40', highlight: true },
          { label: 'Min 50% Off', href: '/search?discount=50', highlight: true },
          { label: 'Min 60% Off', href: '/search?discount=60', highlight: true },
        ],
      },
      {
        title: 'Shop by Category',
        links: [
          { label: 'Men\'s Sale', href: '/men?discount=30' },
          { label: 'Women\'s Sale', href: '/women?discount=30' },
          { label: 'Kids\' Sale', href: '/kids?discount=30' },
        ],
      },
    ],
  },
];
