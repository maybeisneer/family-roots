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
    const { to, intervieweeName, watchUrl, type, organizerName } = body;

    if (!to) {
      return NextResponse.json(
        { error: 'Missing required field: to' },
        { status: 400 }
      );
    }

    let subject: string;
    let text: string;

    if (type === 'interview-link') {
      // Email sent when interview link is created (to organizer)
      const { interviewLink } = body;
      if (!interviewLink) {
        return NextResponse.json(
          { error: 'Missing required field: interviewLink' },
          { status: 400 }
        );
      }

      subject = `Your interview link for ${intervieweeName || 'your family member'}`;
      text = `Hey${organizerName ? ` ${organizerName}` : ''},

Your interview link is ready to pass onto ${intervieweeName || 'your family member'}:

${interviewLink}

Once they've finished their interview, you'll get an email with a link to watch it.

If you have any troubles, feel free to reply to this email.

Best,
Neer

--
My House Tales
https://myhousetales.com`;
    } else {
      // Email sent when interview is completed (default)
      if (!watchUrl) {
        return NextResponse.json(
          { error: 'Missing required field: watchUrl' },
          { status: 400 }
        );
      }

      subject = `${intervieweeName || 'Your family member'}'s interview is ready to watch!`;
      text = `Hey${organizerName ? ` ${organizerName}` : ''},

Great news! ${intervieweeName || 'Your family member'} has finished recording their interview.

Watch it here:

${watchUrl}

To unlock the video, you'll need to enter the email you used when creating the interview.

If you have any troubles, feel free to reply to this email.

Best,
Neer

--
My House Tales
https://myhousetales.com`;
    }

    const { data, error } = await getResend().emails.send({
      from: 'Neer from My House Tales <noreply@myhousetales.com>',
      replyTo: 'hey@neer.is',
      to: [to],
      subject,
      text,
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
