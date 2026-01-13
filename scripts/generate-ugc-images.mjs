import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Different interviewees to show variety
const INTERVIEWEES = [
  'a warm, smiling Asian grandmother in her 70s with silver hair',
  'a Black grandfather in his 80s with kind eyes and a gentle smile',
  'a Hispanic elderly woman in her 70s, expressive and animated',
  'a white-haired grandfather in his 80s with glasses, mid-laugh'
];

// Interview UI description for generating reference screenshot
const createUIPrompt = (interviewee) => `Generate a screenshot of a video interview app UI. The design should be:
- Dark/black background (like #1c1917 stone-950)
- A video player showing ${interviewee} being interviewed
- The person should look natural, mid-conversation, warm lighting on their face
- Amber/orange accent color (#f59e0b) for buttons and UI elements
- Clean, minimal interface with a subtle question text below the video
- Modern, premium feel like a high-end app
- The video should take up most of the screen
- 16:9 aspect ratio

This is for a family history interview recording app called "Our History". Make it look like a real app screenshot.`;

const UGC_PROMPTS = [
  {
    name: 'tiktok-couch',
    intervieweeIndex: 0,
    prompt: `Generate a vertical TikTok-style photo (9:16 aspect ratio). First-person POV sitting on a couch with feet up on ottoman, TV in background showing the interview UI from the reference image. Include TikTok-style bold white text at the top third saying "finally got mom to do this 🥹". Cozy blanket on lap, warm evening lighting, authentic phone camera quality. The TV should be clearly visible showing the interview.`
  },
  {
    name: 'family-tv-night',
    intervieweeIndex: 1,
    prompt: `Generate a candid landscape photo (4:3 aspect ratio). A multi-generational family gathered in a cozy living room watching a large TV. The TV displays the interview UI from the reference image showing the elderly person being interviewed. Include: kids sitting on floor, parents on couch, everyone emotionally engaged and leaning in. Warm lamp lighting, real lived-in room with some family photos visible. Slightly off-center framing like someone quickly snapped a photo.`
  },
  {
    name: 'instagram-story-crying',
    intervieweeIndex: 2,
    prompt: `Generate a vertical Instagram story style photo (9:16 aspect ratio). A woman in her 30s sitting on a bed, emotional with tears, looking at a laptop screen beside her. The laptop clearly shows the interview UI from the reference. Include subtle Instagram story UI elements - a text box saying "I can't stop watching this" or similar. Natural bedroom lighting from a window, cozy and intimate feel. Authentic, not overly posed.`
  },
  {
    name: 'sharing-phone',
    intervieweeIndex: 3,
    prompt: `Generate a landscape photo (4:3 aspect ratio). Close-up of hands holding a smartphone horizontally, the phone screen clearly showing the interview UI from reference with the elderly person being interviewed. Background is a blurred home kitchen/dining setting with warm daylight. The angle should look like someone took a quick photo to send to family - casual "look at this!" energy. Focus on making the phone screen content visible.`
  }
];

async function generateImage(prompt, filename, referenceImage = null) {
  try {
    console.log(`Generating: ${filename}...`);

    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-image-preview',
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE']
      }
    });

    const contents = [];

    if (referenceImage) {
      contents.push(referenceImage);
      contents.push(`Use the interview UI shown in this reference image as what appears on any screens (TV, laptop, phone) in the generated image. Keep the same elderly person from the reference visible on screens. ${prompt}`);
    } else {
      contents.push(prompt);
    }

    const result = await model.generateContent(contents);
    const response = result.response;

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        const extension = mimeType.split('/')[1] || 'png';

        const outputPath = path.join('public', 'ugc', `${filename}.${extension}`);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, Buffer.from(imageData, 'base64'));
        console.log(`  Saved: ${outputPath}`);

        return {
          path: outputPath,
          inlineData: { data: imageData, mimeType }
        };
      }
    }

    console.log(`  No image generated for ${filename}`);
    return null;
  } catch (error) {
    console.error(`  Error generating ${filename}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('Generating UGC-style images for Our History...\n');

  const results = [];
  const referenceImages = [];

  // Step 1: Generate reference UI screenshots with different interviewees
  console.log('Step 1: Generating interview UI references with different people...\n');

  for (let i = 0; i < INTERVIEWEES.length; i++) {
    const prompt = createUIPrompt(INTERVIEWEES[i]);
    const result = await generateImage(prompt, `reference-ui-${i}`);
    if (result) {
      referenceImages.push({ inlineData: result.inlineData });
      results.push({ name: `reference-ui-${i}`, path: result.path });
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  if (referenceImages.length === 0) {
    console.error('Failed to generate any reference UIs. Exiting.');
    process.exit(1);
  }

  console.log('\nStep 2: Generating UGC images using references...\n');
  await new Promise(r => setTimeout(r, 2000));

  // Step 2: Generate UGC images, each using its designated reference
  for (const { name, prompt, intervieweeIndex } of UGC_PROMPTS) {
    const refIndex = Math.min(intervieweeIndex, referenceImages.length - 1);
    const result = await generateImage(prompt, name, referenceImages[refIndex]);
    if (result) {
      results.push({ name, path: result.path });
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n--- Summary ---');
  console.log(`Generated ${results.length} images`);
  results.forEach(r => console.log(`  - ${r.path}`));
}

main().catch(console.error);
