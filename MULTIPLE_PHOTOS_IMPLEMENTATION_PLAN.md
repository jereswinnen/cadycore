# Multiple Photo Selection Implementation Plan

## Overview
Implement support for multiple photos per bib number with tiered pricing, photo selection interface, and bulk payment processing.

## Complexity Assessment: **Medium-High**
While the core architecture supports this change well, several components need significant updates to handle multiple photos, selection state, and dynamic pricing.

## Detailed Implementation Plan

### Phase 1: Database Schema Updates
**Files to modify:** `supabase-schema.sql`, `src/types/index.ts`

1. **Remove unique constraint** on `bib_number` in photos table to allow multiple photos per bib
2. **Add new tables:**
   - `photo_selections`: Track which photos are selected for purchase
   - `order_items`: Track individual photo purchases within an order
3. **Update Payment model:**
   - Change from single photo_id to support multiple photos
   - Add `selected_photo_ids` array field
   - Add `total_photos` and `price_per_photo` fields
4. **Update TypeScript interfaces:**
   - `Photo[]` arrays instead of single `Photo`
   - New `PhotoSelection`, `OrderItem` interfaces
   - Update `Payment` interface for multi-photo support

### Phase 2: Pricing Logic Implementation
**Files to create/modify:** `src/lib/pricing.ts`, `src/lib/stripe.ts`

1. **Create pricing calculator:**
   ```typescript
   // Tiered pricing: 1=$14.99, 2=$12.99, 3=$11.66, 4=$10.99, 5+=$9.99
   export function calculatePrice(photoCount: number): number
   export function calculateTotal(photoCount: number): number
   ```
2. **Update Stripe configuration** to handle dynamic pricing
3. **Add validation** for minimum/maximum photo selections

### Phase 3: API Routes Updates
**Files to modify:** 
- `src/app/api/photos/[bib]/route.ts` 
- `src/app/api/checkout/route.ts`
- `src/app/api/stripe-webhook/route.ts`

1. **Update photos API** to return array of photos instead of single photo
2. **Modify checkout API:**
   - Accept `selected_photo_ids[]` instead of single `photo_id`
   - Calculate dynamic pricing based on selection count
   - Create Stripe line items for selected photos
   - Store photo selections in database
3. **Update webhook handler:**
   - Process multiple photo unlocks
   - Update multiple photo_access records
   - Handle batch operations

### Phase 4: Frontend Components Overhaul
**Files to modify:**
- `src/components/PhotoPreview.tsx` → `src/components/PhotoGallery.tsx`
- `src/app/photo/[bib]/page.tsx`
- `src/app/photo/[bib]/unlock/page.tsx`

1. **Create PhotoGallery component:**
   - Display grid of photos with checkboxes
   - Handle selection state management
   - Show real-time pricing updates
   - Display total cost prominently
2. **Update photo page:**
   - Replace single photo view with gallery
   - Add "Select All" / "Deselect All" functionality
   - Show pricing breakdown
3. **Update unlock page:**
   - Display selected photos summary
   - Show itemized pricing
   - Update survey to reference multiple photos

### Phase 5: Selection State Management
**Files to create:** `src/hooks/usePhotoSelection.ts`, `src/context/PhotoSelectionContext.tsx`

1. **Create selection hook:**
   ```typescript
   export function usePhotoSelection() {
     const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
     const [totalPrice, setTotalPrice] = useState(0)
     // Selection logic, pricing calculations
   }
   ```
2. **Add context provider** for sharing selection state across components
3. **Persist selections** in localStorage for better UX

### Phase 6: Payment Flow Updates
**Files to modify:**
- `src/app/success/[bib]/page.tsx`
- `src/app/api/download/[bib]/route.ts`

1. **Update success page:**
   - Show all purchased photos
   - Provide individual download links
   - Display purchase summary
2. **Modify download API:**
   - Support downloading individual photos or ZIP of all
   - Track individual photo download counts
   - Add bulk download functionality

### Phase 7: Database Migration Scripts
**Files to create:** `migration-multiple-photos.sql`, `seed-multiple-photos.sql`

1. **Create migration script** to update existing single photos to support multiple
2. **Add sample data** with multiple photos per bib for testing
3. **Update reset script** for development

### Phase 8: UI/UX Enhancements
**Files to modify:** CSS files, component styling

1. **Responsive photo grid** layout
2. **Loading states** for photo gallery
3. **Visual feedback** for selections
4. **Price animation** on selection changes
5. **Mobile-optimized** selection interface

## Pricing Structure

The new tiered pricing system will be:
- **1 photo selected**: $14.99 each
- **2 photos selected**: $12.99 each  
- **3 photos selected**: $11.66 each
- **4 photos selected**: $10.99 each
- **5 or more photos selected**: $9.99 each

All photos are selected by default when user views their photos for a bib number.

## Testing Strategy

### Unit Tests
- Pricing calculation functions
- Photo selection logic
- Validation functions

### Integration Tests
- Multi-photo API endpoints
- Stripe checkout with multiple items
- Webhook processing for bulk orders

### User Acceptance Tests
- Complete flow: bib → select photos → survey → payment → download
- Edge cases: no photos, single photo, maximum photos
- Mobile responsiveness

## Deployment Strategy

### Phase 1: Database Updates (Non-breaking)
- Add new tables without removing old constraints
- Test with existing single-photo flow

### Phase 2: Backend API Updates
- Deploy new endpoints with backward compatibility
- Gradual migration of data

### Phase 3: Frontend Deployment
- Feature flag for multi-photo vs single-photo mode
- A/B testing capability

### Phase 4: Full Migration
- Remove old single-photo constraints
- Switch to multi-photo mode for all users

## Risk Assessment

### High Risk Areas
1. **Database migration** - Risk of data loss or corruption
2. **Stripe integration** - Complex line items and metadata handling
3. **State management** - Photo selection synchronization across components

### Mitigation Strategies
1. **Comprehensive backups** before database changes
2. **Thorough testing** of Stripe webhook handling
3. **Progressive rollout** with feature flags
4. **Rollback plan** to single-photo mode if needed

## Timeline Estimate
- **Database & Backend**: 2-3 days
- **Frontend Components**: 3-4 days  
- **Testing & Integration**: 2-3 days
- **Deployment & Migration**: 1-2 days

**Total: 8-12 days** depending on complexity of UI/UX requirements

## Files to Create/Modify Summary

### New Files (7)
- `src/lib/pricing.ts`
- `src/hooks/usePhotoSelection.ts`
- `src/context/PhotoSelectionContext.tsx`
- `src/components/PhotoGallery.tsx`
- `migration-multiple-photos.sql`
- `seed-multiple-photos.sql`
- `MULTIPLE_PHOTOS_IMPLEMENTATION_PLAN.md`

### Modified Files (12)
- `supabase-schema.sql`
- `src/types/index.ts`
- `src/lib/stripe.ts`
- `src/app/api/photos/[bib]/route.ts`
- `src/app/api/checkout/route.ts`
- `src/app/api/stripe-webhook/route.ts`
- `src/app/photo/[bib]/page.tsx`
- `src/app/photo/[bib]/unlock/page.tsx`
- `src/app/success/[bib]/page.tsx`
- `src/app/api/download/[bib]/route.ts`
- `src/components/PhotoPreview.tsx`
- Various CSS/styling files

This implementation will provide a robust, scalable solution for multiple photo purchases with an excellent user experience and maintainable codebase.