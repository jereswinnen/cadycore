// Pricing logic for multiple photo purchases

export interface PricingTier {
  minPhotos: number;
  maxPhotos: number | null;
  pricePerPhoto: number; // in cents
  displayPrice: string;
}

export const PRICING_TIERS: PricingTier[] = [
  { minPhotos: 1, maxPhotos: 1, pricePerPhoto: 1499, displayPrice: '$14.99' },
  { minPhotos: 2, maxPhotos: 2, pricePerPhoto: 1299, displayPrice: '$12.99' },
  { minPhotos: 3, maxPhotos: 3, pricePerPhoto: 1166, displayPrice: '$11.66' },
  { minPhotos: 4, maxPhotos: 4, pricePerPhoto: 1099, displayPrice: '$10.99' },
  { minPhotos: 5, maxPhotos: null, pricePerPhoto: 999, displayPrice: '$9.99' },
];

/**
 * Calculate the price per photo based on the number of photos selected
 */
export function calculatePricePerPhoto(photoCount: number): number {
  if (photoCount <= 0) return 0;
  
  const tier = PRICING_TIERS.find(tier => 
    photoCount >= tier.minPhotos && 
    (tier.maxPhotos === null || photoCount <= tier.maxPhotos)
  );
  
  return tier?.pricePerPhoto || PRICING_TIERS[PRICING_TIERS.length - 1].pricePerPhoto;
}

/**
 * Calculate the total amount for a given number of photos
 */
export function calculateTotalAmount(photoCount: number): number {
  const pricePerPhoto = calculatePricePerPhoto(photoCount);
  return pricePerPhoto * photoCount;
}

/**
 * Get the pricing tier information for a given number of photos
 */
export function getPricingTier(photoCount: number): PricingTier | null {
  if (photoCount <= 0) return null;
  
  return PRICING_TIERS.find(tier => 
    photoCount >= tier.minPhotos && 
    (tier.maxPhotos === null || photoCount <= tier.maxPhotos)
  ) || PRICING_TIERS[PRICING_TIERS.length - 1];
}

/**
 * Format price in cents to display format
 */
export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`;
}

/**
 * Calculate savings compared to single photo price
 */
export function calculateSavings(photoCount: number): {
  savings: number;
  savingsPerPhoto: number;
  percentageSaved: number;
} {
  if (photoCount <= 1) {
    return { savings: 0, savingsPerPhoto: 0, percentageSaved: 0 };
  }
  
  const singlePhotoPrice = PRICING_TIERS[0].pricePerPhoto;
  const actualPricePerPhoto = calculatePricePerPhoto(photoCount);
  const savingsPerPhoto = singlePhotoPrice - actualPricePerPhoto;
  const totalSavings = savingsPerPhoto * photoCount;
  const percentageSaved = (savingsPerPhoto / singlePhotoPrice) * 100;
  
  return {
    savings: totalSavings,
    savingsPerPhoto,
    percentageSaved: Math.round(percentageSaved)
  };
}

/**
 * Get all pricing tiers for display purposes
 */
export function getAllPricingTiers(): PricingTier[] {
  return PRICING_TIERS;
}

/**
 * Validate photo count
 */
export function validatePhotoCount(photoCount: number): boolean {
  return photoCount > 0 && photoCount <= 100; // reasonable upper limit
}