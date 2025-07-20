import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import archiver from 'archiver';

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

    // Fetch all photos first
    const photoData = await Promise.all(
      accessRecords.map(async (access, index) => {
        if (!access.photo || !access.photo.highres_url) {
          console.warn(`Skipping photo ${access.photo_id}: No high-res URL`);
          return null;
        }

        try {
          const imageResponse = await fetch(access.photo.highres_url);
          if (!imageResponse.ok) {
            console.warn(`Failed to fetch photo ${access.photo_id}: ${imageResponse.status}`);
            return null;
          }

          const imageBuffer = await imageResponse.arrayBuffer();
          const filename = `photo-${index + 1}-${access.photo_id.slice(-8)}.jpg`;
          
          return {
            buffer: Buffer.from(imageBuffer),
            filename
          };
        } catch (error) {
          console.error(`Error processing photo ${access.photo_id}:`, error);
          return null;
        }
      })
    );

    // Filter out failed downloads
    const validPhotos = photoData.filter(photo => photo !== null);

    if (validPhotos.length === 0) {
      return NextResponse.json({
        error: 'Failed to fetch any photos'
      }, { status: 500 });
    }

    // Create zip using Promise-based approach
    const zipBuffer = await new Promise<Buffer>((resolve, reject) => {
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      const chunks: Buffer[] = [];
      
      archive.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      archive.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      
      archive.on('error', (err) => {
        reject(err);
      });

      // Add all photos to the archive
      validPhotos.forEach(photo => {
        if (photo) {
          archive.append(photo.buffer, { name: photo.filename });
        }
      });

      // Finalize the archive
      archive.finalize();
    });

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