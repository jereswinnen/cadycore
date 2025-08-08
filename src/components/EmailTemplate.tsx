import React from 'react';

interface EmailTemplateProps {
  runnerName: string;
  bibNumber: string;
  photoCount: number;
  downloadUrl?: string;
}

export function PhotoDeliveryEmailTemplate({ 
  runnerName, 
  bibNumber, 
  photoCount,
  downloadUrl 
}: EmailTemplateProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: '1.6',
        color: '#333',
        backgroundColor: '#f8fafc',
        margin: '0',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px 30px',
            textAlign: 'center'
          }}>
            <h1 style={{
              color: 'white',
              margin: '0',
              fontSize: '28px',
              fontWeight: 'bold'
            }}>
              🏃‍♂️ Your Race Photos Are Ready!
            </h1>
          </div>

          {/* Content */}
          <div style={{ padding: '40px 30px' }}>
            <p style={{ fontSize: '18px', marginBottom: '20px' }}>
              Hi {runnerName},
            </p>
            
            <p style={{ fontSize: '16px', marginBottom: '25px' }}>
              Thank you for your purchase! Your high-resolution race photos are attached to this email as a ZIP file.
            </p>

            <div style={{
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '25px'
            }}>
              <h3 style={{ 
                margin: '0 0 15px 0', 
                color: '#1e293b',
                fontSize: '16px'
              }}>
                📋 Purchase Details
              </h3>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Bib Number:</strong> #{bibNumber}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Photos:</strong> {photoCount} high-resolution image{photoCount > 1 ? 's' : ''}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Purchase Date:</strong> {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div style={{
              backgroundColor: '#fef3c7',
              borderLeft: '4px solid #f59e0b',
              padding: '15px 20px',
              marginBottom: '25px'
            }}>
              <p style={{ margin: '0', fontSize: '14px', color: '#92400e' }}>
                <strong>📎 Your photos are attached as a ZIP file</strong><br />
                Download and extract the ZIP file to access your high-resolution images.
              </p>
            </div>

            {downloadUrl && (
              <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <a href={downloadUrl} style={{
                  display: 'inline-block',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px 30px',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  📥 Alternative Download Link
                </a>
              </div>
            )}

          </div>

          {/* Footer */}
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '30px',
            textAlign: 'center',
            borderTop: '1px solid #e2e8f0'
          }}>
            <p style={{
              margin: '0 0 10px 0',
              fontSize: '14px',
              color: '#64748b'
            }}>
              Thank you for choosing our race photo service!
            </p>
            <p style={{
              margin: '0',
              fontSize: '12px',
              color: '#94a3b8'
            }}>
              This email was sent to you because you purchased race photos for bib #{bibNumber}.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

// Generate HTML string for email
export function generatePhotoDeliveryEmail(props: EmailTemplateProps): string {
  // For server-side rendering, we'll generate the HTML string directly
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Race Photos Are Ready!</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
        🏃‍♂️ Your Race Photos Are Ready!
      </h1>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 18px; margin-bottom: 20px;">
        Hi ${props.runnerName},
      </p>
      
      <p style="font-size: 16px; margin-bottom: 25px;">
        Thank you for your purchase! Your high-resolution race photos are attached to this email as a ZIP file.
      </p>

      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 16px;">
          📋 Purchase Details
        </h3>
        <p style="margin: 5px 0; font-size: 14px;">
          <strong>Bib Number:</strong> #${props.bibNumber}
        </p>
        <p style="margin: 5px 0; font-size: 14px;">
          <strong>Photos:</strong> ${props.photoCount} high-resolution image${props.photoCount > 1 ? 's' : ''}
        </p>
        <p style="margin: 5px 0; font-size: 14px;">
          <strong>Purchase Date:</strong> ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin-bottom: 25px;">
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          <strong>📎 Your photos are attached as a ZIP file</strong><br>
          Download and extract the ZIP file to access your high-resolution images.
        </p>
      </div>

      ${props.downloadUrl ? `
      <div style="text-align: center; margin-bottom: 25px;">
        <a href="${props.downloadUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
          📥 Alternative Download Link
        </a>
      </div>
      ` : ''}

    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;">
        Thank you for choosing our race photo service!
      </p>
      <p style="margin: 0; font-size: 12px; color: #94a3b8;">
        This email was sent to you because you purchased race photos for bib #${props.bibNumber}.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}