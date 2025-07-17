const { createClient } = require('@supabase/supabase-js');

// You'll need to install supabase-js in your project or run this with your existing setup
// npm install @supabase/supabase-js

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const dummyPhotos = [
  {
    bib_number: '1001',
    preview_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    highres_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=90',
    watermark_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    metadata: { event: 'Marathon 2024', photographer: 'John Doe' }
  },
  {
    bib_number: '1002',
    preview_url: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&q=80',
    highres_url: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=1920&q=90',
    watermark_url: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&q=80',
    metadata: { event: 'Marathon 2024', photographer: 'Jane Smith' }
  },
  {
    bib_number: '1003',
    preview_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
    highres_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1920&q=90',
    watermark_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
    metadata: { event: 'Marathon 2024', photographer: 'Mike Johnson' }
  },
  {
    bib_number: '1004',
    preview_url: 'https://images.unsplash.com/photo-1506629905962-b73259c4abd6?w=800&q=80',
    highres_url: 'https://images.unsplash.com/photo-1506629905962-b73259c4abd6?w=1920&q=90',
    watermark_url: 'https://images.unsplash.com/photo-1506629905962-b73259c4abd6?w=800&q=80',
    metadata: { event: 'Marathon 2024', photographer: 'Sarah Wilson' }
  },
  {
    bib_number: '1005',
    preview_url: 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?w=800&q=80',
    highres_url: 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?w=1920&q=90',
    watermark_url: 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?w=800&q=80',
    metadata: { event: 'Marathon 2024', photographer: 'David Brown' }
  }
];

async function insertDummyData() {
  try {
    console.log('🚀 Inserting dummy photos...');
    
    // Insert photos
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .insert(dummyPhotos)
      .select();

    if (photosError) {
      console.error('Error inserting photos:', photosError);
      return;
    }

    console.log(`✅ Inserted ${photos.length} photos`);

    // Create access records for all photos
    const accessRecords = photos.map(photo => ({
      photo_id: photo.id,
      bib_number: photo.bib_number,
      survey_completed: false,
      payment_completed: false,
      is_unlocked: false
    }));

    const { data: accessData, error: accessError } = await supabase
      .from('photo_access')
      .insert(accessRecords);

    if (accessError) {
      console.error('Error inserting access records:', accessError);
      return;
    }

    console.log('✅ Created photo access records');

    // Add a completed example for bib 1001
    const photo1001 = photos.find(p => p.bib_number === '1001');
    if (photo1001) {
      // Add survey response
      const { error: surveyError } = await supabase
        .from('survey_responses')
        .insert({
          photo_id: photo1001.id,
          bib_number: '1001',
          runner_name: 'John Runner',
          runner_email: 'john@example.com',
          age_group: '30-39',
          race_experience: 'intermediate',
          satisfaction_rating: 5,
          would_recommend: true,
          feedback: 'Great race! Amazing organization and support.',
          marketing_consent: true
        });

      if (surveyError) {
        console.error('Error inserting survey:', surveyError);
      } else {
        console.log('✅ Added survey response for bib 1001');
      }

      // Add payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          photo_id: photo1001.id,
          bib_number: '1001',
          stripe_session_id: 'cs_test_completed_12345',
          amount: 1000,
          currency: 'USD',
          status: 'completed',
          completed_at: new Date().toISOString()
        });

      if (paymentError) {
        console.error('Error inserting payment:', paymentError);
      } else {
        console.log('✅ Added payment record for bib 1001');
      }

      // Update access to show completed
      const { error: updateError } = await supabase
        .from('photo_access')
        .update({
          survey_completed: true,
          payment_completed: true,
          is_unlocked: true,
          unlocked_at: new Date().toISOString()
        })
        .eq('bib_number', '1001');

      if (updateError) {
        console.error('Error updating access:', updateError);
      } else {
        console.log('✅ Updated access for bib 1001 (unlocked)');
      }
    }

    console.log('\n🎉 Dummy data insertion complete!');
    console.log('\nTest with these bib numbers:');
    console.log('• 1001 - Fully completed (unlocked photo)');
    console.log('• 1002 - Available for purchase');
    console.log('• 1003 - Available for purchase');
    console.log('• 1004 - Available for purchase');
    console.log('• 1005 - Available for purchase');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

insertDummyData();