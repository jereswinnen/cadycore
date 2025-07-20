import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import archiver from 'archiver';
import { Readable } from 'stream';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bib: string }> }
) {
  try {
    const { bib } = await params;
    const bibNumber = bib.toUpperCase();
    
    // Get all unlocked photos for this bib
    const { data: accessRecords, error: accessError } = await supabase
      .from('photo_access')
      .select(`
        *,
        photo:photos(*)
      `)
      .eq('bib_number', bibNumber)
      .eq('is_unlocked', true);

    if (accessError || !accessRecords || accessRecords.length === 0) {
      return NextResponse.json({
        error: 'No unlocked photos found for this bib number'
      }, { status: 404 });
    }

    // Update download counts for all photos
    const updatePromises = accessRecords.map(access => 
      supabase
        .from('photo_access')
        .update({
          download_count: (access.download_count || 0) + 1,
          last_downloaded_at: new Date().toISOString()
        })
        .eq('id', access.id)
    );
    
    await Promise.all(updatePromises);

    // Create a zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Best compression
    });

    // Convert archive to a readable stream
    const chunks: Buffer[] = [];
    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      throw err;
    });

    // Add each photo to the zip
    const downloadPromises = accessRecords.map(async (access, index) => {
      if (!access.photo || !access.photo.highres_url) {
        console.warn(`Skipping photo ${access.photo_id}: No high-res URL`);
        return;
      }

      try {
        // Fetch the image
        const imageResponse = await fetch(access.photo.highres_url);
        if (!imageResponse.ok) {
          console.warn(`Failed to fetch photo ${access.photo_id}: ${imageResponse.status}`);
          return;
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const filename = `photo-${index + 1}-${access.photo_id.slice(-8)}.jpg`;
        
        // Add to zip
        archive.append(Buffer.from(imageBuffer), { name: filename });
      } catch (error) {
        console.error(`Error processing photo ${access.photo_id}:`, error);
      }
    });

    // Wait for all photos to be processed
    await Promise.all(downloadPromises);
    
    // Finalize the archive
    await archive.finalize();

    // Wait for archive to complete
    await new Promise((resolve, reject) => {
      archive.on('end', resolve);
      archive.on('error', reject);
    });

    // Create the final buffer
    const zipBuffer = Buffer.concat(chunks);
    
    // Create filename
    const filename = `race-photos-${bibNumber}.zip`;
    
    // Return the zip file
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-cache',
        'Content-Length': zipBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Zip download API error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}