import fs from 'node:fs';
import path from 'node:path';
import { renderAsync } from '@resvg/resvg-js';

const svgPath = path.resolve('public/app-icon-master.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generateIcon(size, outputPath, paddingPercent = 0) {
  let svgContent = svgBuffer.toString();

  // If padding requested for maskable icon, adjust viewport or render with bg
  if (paddingPercent > 0) {
    // Generate maskable icon with green background and scaled content inside safe zone (80% inner circle)
    const scale = (100 - paddingPercent * 2) / 100;
    const offset = (1024 * (1 - scale)) / 2;
    
    // Wrap in maskable container with solid background
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
        <rect width="1024" height="1024" fill="#082212"/>
        <g transform="translate(${offset}, ${offset}) scale(${scale})">
          ${svgBuffer.toString().replace(/<\/?svg[^>]*>/g, '')}
        </g>
      </svg>
    `;
  }

  const resvg = await renderAsync(svgContent, {
    fitTo: {
      mode: 'width',
      value: size,
    },
  });

  const pngBuffer = resvg.asPng();
  fs.writeFileSync(outputPath, pngBuffer);
  console.log(`Generated: ${outputPath} (${size}x${size}) [${(pngBuffer.length / 1024).toFixed(1)} KB]`);
}

async function run() {
  console.log('🚀 Generating crisp PWA icons from master SVG...');

  // 1. Android & General PWA Icons
  await generateIcon(512, 'public/icon-512.png');
  await generateIcon(192, 'public/icon-192.png');
  await generateIcon(144, 'public/icon-144.png');
  await generateIcon(96, 'public/icon-96.png');

  // 2. Android Maskable/Adaptive Icons (with 15% safe-zone margin)
  await generateIcon(512, 'public/icon-maskable-512.png', 15);
  await generateIcon(192, 'public/icon-maskable-192.png', 15);

  // 3. iOS Apple Touch Icons
  await generateIcon(180, 'public/apple-touch-icon.png');
  await generateIcon(180, 'public/apple-touch-icon-precomposed.png');

  // 4. Favicons
  await generateIcon(64, 'public/favicon.png');
  await generateIcon(32, 'public/favicon-32x32.png');
  await generateIcon(16, 'public/favicon-16x16.png');
  await generateIcon(32, 'public/favicon.ico');

  // 5. Official App Brand Logos
  await generateIcon(1024, 'public/integral_nuts_logo.png');
  await generateIcon(1024, 'public/integral_nuts_logo.jpg'); // Saved as PNG content to prevent corrupt JPG header

  console.log('✨ All mobile installation & web app icons created successfully!');
}

run().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
