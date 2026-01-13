import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend lazily to avoid build-time errors
let resend: Resend | null = null;
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, intervieweeName, watchUrl, type } = body;

    if (!to) {
      return NextResponse.json(
        { error: 'Missing required field: to' },
        { status: 400 }
      );
    }

    let subject: string;
    let html: string;

    if (type === 'interview-link') {
      // Email sent when interview link is created (to organizer)
      const { interviewLink } = body;
      if (!interviewLink) {
        return NextResponse.json(
          { error: 'Missing required field: interviewLink' },
          { status: 400 }
        );
      }

      subject = `Interview link for ${intervieweeName || 'your family member'}`;
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0c0a09; margin: 0; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background-color: #1c1917; border-radius: 16px; padding: 40px; border: 1px solid #292524;">
              <h1 style="color: #ffffff; font-size: 24px; text-align: center; margin: 0 0 16px 0; font-weight: 500;">
                Your interview is ready
              </h1>

              <p style="color: #a8a29e; font-size: 16px; text-align: center; margin: 0 0 32px 0; line-height: 1.6;">
                Pass this link to ${intervieweeName || 'your family member'} so they can record their interview.
              </p>

              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${interviewLink}" style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                  Interview Link
                </a>
              </div>

              <p style="color: #78716c; font-size: 12px; text-align: center; margin: 0;">
                This link is private. Only share it with the person you want to interview.
              </p>
            </div>

            <p style="color: #57534e; font-size: 12px; text-align: center; margin-top: 24px;">
              Sent from <a href="https://myhousetales.com" style="color: #f59e0b; text-decoration: none;">My House Tales</a>
            </p>
          </body>
        </html>
      `;
    } else {
      // Email sent when interview is completed (default)
      if (!watchUrl) {
        return NextResponse.json(
          { error: 'Missing required field: watchUrl' },
          { status: 400 }
        );
      }

      subject = `${intervieweeName ? `${intervieweeName}'s` : 'Your'} interview is finished!`;
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0c0a09; margin: 0; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background-color: #1c1917; border-radius: 16px; padding: 40px; border: 1px solid #292524;">
              <h1 style="color: #ffffff; font-size: 24px; text-align: center; margin: 0 0 16px 0; font-weight: 500;">
                Interview complete!
              </h1>

              <p style="color: #a8a29e; font-size: 16px; text-align: center; margin: 0 0 32px 0; line-height: 1.6;">
                Your interview for ${intervieweeName || 'your family member'} has been finished. Click below to watch.
              </p>

              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${watchUrl}" style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                  Watch Now
                </a>
              </div>

              <p style="color: #78716c; font-size: 12px; text-align: center; margin: 0;">
                This link is private and only accessible to those who have it.
              </p>
            </div>

            <p style="color: #57534e; font-size: 12px; text-align: center; margin-top: 24px;">
              Sent from <a href="https://myhousetales.com" style="color: #f59e0b; text-decoration: none;">My House Tales</a>
            </p>
          </body>
        </html>
      `;
    }

    const { data, error } = await getResend().emails.send({
      from: 'My House Tales <noreply@myhousetales.com>',
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error: any) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
