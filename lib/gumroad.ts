export interface GumroadProduct {
  id: string;
  name: string;
  url: string;
  imageUrl: string;
  badge?: 'new' | 'hot';
  description?: string;
}

// Manual product list - update this when you add/remove products from Gumroad
export const GUMROAD_PRODUCTS: GumroadProduct[] = [
  {
    id: 'flip7',
    name: 'Z Flip 7 Recreation',
    url: 'https://thatjoshguy.gumroad.com/l/flip7',
    imageUrl: '/images/wallpapers/flip7.png',
    badge: 'new',
  },
  {
    id: 'oneui8',
    name: 'One UI 8',
    url: 'https://thatjoshguy.gumroad.com/l/oneui8',
    imageUrl: '/images/wallpapers/oui8-dark.png',
    badge: 'hot',
  },
  {
    id: 's25u',
    name: 'S25 Ultra recreation',
    url: 'https://thatjoshguy.gumroad.com/l/s25u',
    imageUrl: '/images/wallpapers/s25-web.png',
  },
  {
    id: 'eclypse',
    name: 'Eclypse',
    url: 'https://thatjoshguy.gumroad.com/l/eclypse',
    imageUrl: '/images/wallpapers/Eclypse.jpg',
  },
  {
    id: 'mono',
    name: 'Monochromes',
    url: 'https://mono.thatjoshguy.me',
    imageUrl: '/images/wallpapers/mono.png',
  },
  {
    id: 'a15-walls',
    name: 'Android 15 Walls',
    url: 'https://thatjoshguy.gumroad.com/l/a15-walls',
    imageUrl: '/images/wallpapers/a15.png',
  },
  {
    id: 'pixelvibes',
    name: 'Pixel Vibes',
    url: 'https://thatjoshguy.gumroad.com/l/pixelvibes',
    imageUrl: '/images/wallpapers/pixel-vibes.png',
  },
  {
    id: 'circles',
    name: 'Circles',
    url: 'https://thatjoshguy.gumroad.com/l/circles',
    imageUrl: '/images/wallpapers/circles.png',
  },
  {
    id: 'circles-s24',
    name: 'Circles S24 Edition',
    url: 'https://thatjoshguy.gumroad.com/l/CirclesS24',
    imageUrl: '/images/wallpapers/circles-s24e.png',
  },
  {
    id: 'jpick',
    name: "Josh's Pick",
    url: 'https://thatjoshguy.gumroad.com/l/jpick',
    imageUrl: '/images/wallpapers/joshs-pick.png',
  },
];

export async function getGumroadProducts(): Promise<GumroadProduct[]> {
  // For now, return the static list
  // In the future, this could fetch from an API or cache
  return GUMROAD_PRODUCTS;
}

