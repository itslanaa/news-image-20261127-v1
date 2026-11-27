// news-image-20261127 v1 — "The World in One Day".
//
// The entry image is entry.png beside this file: a front page drawn in the
// build session from real news photos (Wikimedia Commons, credited in the
// image) and the day's verified facts. This program's only job is to prove
// the file is a whole, well-formed PNG inside the competition's limits and
// then place those exact bytes at the grader's output path.
//
// It reads nothing else, reaches no network, and writes the same bytes on
// every run: the output is a byte-for-byte copy of the checked input.
//
// Checked before the copy: the PNG signature, the size and dimension
// limits, every chunk's CRC, and that IEND is the last thing in the file.
//
// Run locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// The PNG signature every PNG file starts with.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// Limits from the competition rules: at most 1 MiB, at most 1024 by 1024.
const MAX_BYTES = 1024 * 1024;
const MAX_SIDE = 1024;

// CRC-32 (IEEE, polynomial 0xedb88320) over a chunk's type + data, as PNG
// requires. The table is built once from the polynomial.
const CRC_TABLE: number[] = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c;
}

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const byte of buf) {
    c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function fail(message: string): never {
  throw new Error(`entry.png rejected: ${message}`);
}

// Walk every chunk of the file, checking its shape and checksum, and read
// the width and height out of the IHDR chunk. Returns [width, height].
function inspectPng(bytes: Buffer): [number, number] {
  if (bytes.length < 8 || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    fail('not a PNG file (bad signature)');
  }
  if (bytes.length > MAX_BYTES) {
    fail(`too large: ${bytes.length} bytes (limit ${MAX_BYTES})`);
  }
  let offset = 8;
  let seenIhdr = false;
  let seenIend = false;
  let width = 0;
  let height = 0;
  while (offset + 8 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString('ascii');
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > bytes.length) {
      fail(`chunk ${type} runs past the end of the file`);
    }
    const storedCrc = bytes.readUInt32BE(dataEnd);
    const actualCrc = crc32(Buffer.concat([bytes.subarray(offset + 4, offset + 8), bytes.subarray(dataStart, dataEnd)]));
    if (storedCrc !== actualCrc) {
      fail(`chunk ${type} has a bad checksum`);
    }
    if (type === 'IHDR') {
      if (seenIhdr || offset !== 8 || length !== 13) {
        fail('IHDR is missing, duplicated, or in the wrong place');
      }
      seenIhdr = true;
      width = bytes.readUInt32BE(dataStart);
      height = bytes.readUInt32BE(dataStart + 4);
    }
    if (type === 'IEND') {
      seenIend = true;
      if (dataEnd + 4 !== bytes.length) {
        fail('bytes follow the IEND chunk');
      }
      break;
    }
    offset = dataEnd + 4;
  }
  if (!seenIhdr || !seenIend) {
    fail('missing IHDR or IEND chunk');
  }
  if (width > MAX_SIDE || height > MAX_SIDE || width === 0 || height === 0) {
    fail(`dimensions ${width}x${height} are outside the 1024x1024 limit`);
  }
  return [width, height];
}

const source = new URL('./entry.png', import.meta.url);
const bytes = readFileSync(source);
const [width, height] = inspectPng(bytes);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), bytes);

console.log(`wrote entry.png: ${width}x${height}, ${bytes.length} bytes`);
