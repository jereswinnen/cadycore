# Multiple Photo Selection - Testing Instructions

## Setup Requirements

### 1. Database Setup

1. **Clear your current Supabase database:**

   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the following to clear existing data:

   ```sql
   DELETE FROM order_items;
   DELETE FROM photo_access;
   DELETE FROM photo_selections;
   DELETE FROM survey_responses;
   DELETE FROM payments;
   DELETE FROM photos;
   ```

2. **Apply new schema:**

   - Copy and run the entire contents of `supabase-schema-multiple-photos.sql` in the SQL Editor
   - This will create the updated table structure with support for multiple photos

3. **Insert seed data:**
   - Copy and run the entire contents of `seed-multiple-photos.sql` in the SQL Editor
   - This creates test data with different bib numbers having 1-6 photos each

### 2. Verify Environment Variables

Ensure these are set in your Vercel deployment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Test Scenarios

### Test Case 1: Single Photo (Bib 1005)

**Purpose:** Verify pricing for 1 photo = $14.99

**Steps:**

1. Navigate to your deployed app
2. Enter bib number `1005`
3. Verify:
   - ✅ Shows 1 photo
   - ✅ Photo is selected by default
   - ✅ Price shows "$14.99 each"
   - ✅ Total shows "$14.99"
   - ✅ No savings message displayed
4. Click "Continue with 1 photo - $14.99"
5. Complete survey with valid data
6. Complete Stripe payment
7. Verify payment status updates in database

### Test Case 2: Two Photos (Bib 1001)

**Purpose:** Verify pricing for 2 photos = $12.99 each

**Steps:**

1. Enter bib number `1001`
2. Verify:
   - ✅ Shows 2 photos
   - ✅ Both photos selected by default
   - ✅ Price shows "$12.99 each"
   - ✅ Total shows "$25.98"
   - ✅ Savings message: "Save $4.00 (13% off)"
3. Test photo selection/deselection:
   - Uncheck one photo → Price changes to $14.99 each, total $14.99
   - Check it again → Price returns to $12.99 each, total $25.98
4. Complete payment flow with both photos selected

### Test Case 3: Three Photos (Bib 1002)

**Purpose:** Verify pricing for 3 photos = $11.66 each

**Steps:**

1. Enter bib number `1002`
2. Verify:
   - ✅ Shows 3 photos
   - ✅ All photos selected by default
   - ✅ Price shows "$11.66 each"
   - ✅ Total shows "$34.98"
   - ✅ Savings message displayed
3. Test "Select All" / "Deselect All" buttons
4. Complete payment flow

### Test Case 4: Four Photos (Bib 1003)

**Purpose:** Verify pricing for 4 photos = $10.99 each

**Steps:**

1. Enter bib number `1003`
2. Verify:
   - ✅ Shows 4 photos
   - ✅ Price shows "$10.99 each"
   - ✅ Total shows "$43.96"
3. Complete payment flow

### Test Case 5: Five Photos (Bib 1004)

**Purpose:** Verify pricing for 5+ photos = $9.99 each

**Steps:**

1. Enter bib number `1004`
2. Verify:
   - ✅ Shows 5 photos
   - ✅ Price shows "$9.99 each"
   - ✅ Total shows "$49.95"
   - ✅ Maximum savings displayed
3. Complete payment flow

### Test Case 6: Six Photos (Bib 1006)

**Purpose:** Verify 5+ pricing applies to 6 photos

**Steps:**

1. Enter bib number `1006`
2. Verify:
   - ✅ Shows 6 photos
   - ✅ Price still shows "$9.99 each"
   - ✅ Total shows "$59.94"
3. Complete payment flow

## Key Areas to Test

### Photo Selection Interface

- [ ] Photos load correctly with preview images
- [ ] Default selection (all photos checked)
- [ ] Individual photo toggle works
- [ ] "Select All" button works
- [ ] "Deselect All" button works
- [ ] Pricing updates in real-time when selection changes
- [ ] Cannot proceed with 0 photos selected

### Pricing Calculations

- [ ] 1 photo: $14.99 each
- [ ] 2 photos: $12.99 each ($25.98 total)
- [ ] 3 photos: $11.66 each ($34.98 total)
- [ ] 4 photos: $10.99 each ($43.96 total)
- [ ] 5+ photos: $9.99 each
- [ ] Savings calculations are correct
- [ ] Percentage saved is accurate

### Survey Flow

- [ ] Survey shows selected photos summary
- [ ] Cannot submit with no photos selected
- [ ] Selected photo IDs are sent to backend
- [ ] Survey saves correctly to database

### Payment Flow

- [ ] Stripe checkout shows correct line items
- [ ] Product name includes photo count
- [ ] Unit price matches per-photo price
- [ ] Quantity matches photo count
- [ ] Total amount is correct
- [ ] Metadata includes selected_photo_ids

### Webhook Processing

- [ ] Webhook receives correct metadata
- [ ] Payment status updates in database
- [ ] All selected photos unlock simultaneously
- [ ] Order items are created for each photo
- [ ] Photo access records are updated

### Post-Payment Experience

- [ ] Success page shows all purchased photos
- [ ] Individual download links work
- [ ] Download count increments
- [ ] Photos show as "Unlocked" in gallery
- [ ] High-res images are accessible

## Stripe Integration Testing

### Webhook Testing

1. **Local Testing:**

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```

2. **Production Testing:**
   - Verify webhook endpoint is set to: `https://your-domain.vercel.app/api/stripe-webhook`
   - Check webhook logs in Stripe dashboard for 200 status codes
   - Monitor Vercel function logs for webhook processing

### Payment Verification

- [ ] Test with Stripe test card: `4242 4242 4242 4242`
- [ ] Verify payment appears in Stripe dashboard
- [ ] Check payment metadata includes all photo IDs
- [ ] Confirm webhook processes successfully

## Database Verification

After each successful payment, check these tables in Supabase:

### `payments` table:

- [ ] `selected_photo_ids` contains array of photo IDs
- [ ] `total_photos` matches selection count
- [ ] `price_per_photo` matches expected tier pricing
- [ ] `total_amount` is correct
- [ ] `status` changes from 'pending' to 'completed'
- [ ] `completed_at` is populated

### `photo_access` table:

- [ ] All selected photos have `payment_completed = true`
- [ ] All selected photos have `is_unlocked = true`
- [ ] `unlocked_at` timestamp is set

### `order_items` table:

- [ ] One record per purchased photo
- [ ] `price_paid` matches the per-photo price
- [ ] `payment_id` links to payments table

### `survey_responses` table:

- [ ] `selected_photo_ids` contains array of photo IDs
- [ ] Survey data is saved correctly

## Error Scenarios to Test

### Invalid Selections

- [ ] Try accessing `/photo/1001/unlock` with no photos selected
- [ ] Verify error message and redirect

### Duplicate Surveys

- [ ] Complete survey for a bib number
- [ ] Try to submit survey again
- [ ] Verify "Survey already completed" error

### Payment Errors

- [ ] Test with declined card
- [ ] Verify payment record stays 'pending'
- [ ] Photos remain locked

## Performance Testing

### Large Photo Sets

- If testing with more photos, verify:
  - [ ] Gallery loads quickly
  - [ ] Selection state updates are responsive
  - [ ] Price calculations are instant
  - [ ] Payment processing handles large metadata

## Mobile Testing

- [ ] Photo gallery is responsive
- [ ] Selection checkboxes are easily tappable
- [ ] Pricing summary is visible
- [ ] Payment flow works on mobile

## Expected Logs to Monitor

### Vercel Function Logs

Look for these successful log patterns:

```
// Photo API
Found X photos for bib XXXX
Created photo selections for bib XXXX

// Survey API
Survey saved for bib XXXX with X photos

// Checkout API
Creating payment record with session ID: cs_test_...
Payment record created successfully

// Webhook
Looking for payment records for bib XXXX
Payment records updated: 1
Updated X photo access records
Created X order items
Payment completed for bib XXXX, X photos unlocked
```

### Stripe Dashboard

- [ ] Webhook logs show 200 status codes
- [ ] Payment metadata includes selected_photo_ids
- [ ] Customer details are correct

## Troubleshooting Guide

### Common Issues

1. **Photos not loading:** Check Unsplash image URLs in seed data
2. **Pricing not updating:** Check browser console for API errors
3. **Payment failing:** Verify Stripe keys and webhook URL
4. **Database not updating:** Check webhook logs and service role permissions

### Reset Between Tests

To reset a bib number for retesting:

```sql
-- Replace XXXX with bib number
DELETE FROM order_items WHERE payment_id IN (SELECT id FROM payments WHERE bib_number = 'XXXX');
DELETE FROM photo_access WHERE bib_number = 'XXXX';
DELETE FROM photo_selections WHERE bib_number = 'XXXX';
DELETE FROM survey_responses WHERE bib_number = 'XXXX';
DELETE FROM payments WHERE bib_number = 'XXXX';

-- Recreate photo access and selections
INSERT INTO photo_access (photo_id, bib_number, survey_completed, payment_completed, is_unlocked)
SELECT id, bib_number, FALSE, FALSE, FALSE
FROM photos WHERE bib_number = 'XXXX';

INSERT INTO photo_selections (bib_number, photo_id, is_selected)
SELECT bib_number, id, TRUE
FROM photos WHERE bib_number = 'XXXX';
```

This comprehensive testing will verify that your multiple photo selection feature works correctly across all pricing tiers and user flows!
