import { Jimp } from 'jimp';

const CREAM = 0xf1e6d1ff;
const SRC = 'assets/milogo.png';
const SIZE = 1024;

function centered(box) {
  return Math.round((SIZE - box) / 2);
}

async function make({ out, bg, box }) {
  const logo = await Jimp.read(SRC);
  logo.scaleToFit({ w: box, h: box });
  const canvas = new Jimp({ width: SIZE, height: SIZE, color: bg });
  const x = centered(logo.bitmap.width);
  const y = centered(logo.bitmap.height);
  canvas.composite(logo, x, y);
  await canvas.write(out);
  console.log('escrito', out, `(logo ${logo.bitmap.width}x${logo.bitmap.height})`);
}

// icon.png: fondo crema sólido (iOS no admite transparencia), logo grande
await make({ out: 'assets/icon.png', bg: CREAM, box: 820 });

// splash-icon.png: transparente (el splash usa backgroundColor crema), logo mediano
await make({ out: 'assets/splash-icon.png', bg: 0x00000000, box: 720 });

// adaptive-icon.png: transparente, logo dentro de la zona segura (~60%) para que Android no lo recorte
await make({ out: 'assets/adaptive-icon.png', bg: 0x00000000, box: 600 });
