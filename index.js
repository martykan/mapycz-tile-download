#!/usr/bin/env node

const sharp = require("sharp");
const https = require("https");
const fs = require("fs");
const { join } = require("path");

// Tile ID helper functions
function long2tile(zoom, lon) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}
function lat2tile(zoom, lat) {
  return Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  );
}

function getApiKey() {
  // Based on SMap.getSDKHeaderValue
  var data = ["mapyapi", "Armstrong", (Date.now() / 1e3) >>> 0].join(",");
  var xor_value = [];
  var max = data.length,
    keyMax = 3,
    ptr = 0;
  for (var i = 0; i < max; i++) {
    var dataChar = data[i].charCodeAt(0);
    var keyChar = "sdk"[ptr].charCodeAt(0);
    xor_value.push(String.fromCharCode(dataChar ^ keyChar));
    ptr++;
    if (ptr == keyMax) {
      ptr = 0;
    }
  }
  return btoa(xor_value.join(""));
}

async function downloadTile(dir, zoom, x, y) {
  const filename = join(dir, x + "-" + y + ".png");
  if (fs.existsSync(filename)) {
    return filename;
  }
  return await new Promise((resolve, reject) => {
    const url =
      "https://mapserver.mapy.cz/bing/" +
      zoom +
      "-" +
      x +
      "-" +
      y +
      "?key=" +
      encodeURIComponent(getApiKey());
    const file = fs.createWriteStream(filename);
    https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36",
          Referer: "https://www.mapy.cz/",
        },
      },
      (res) => {
        if (res.statusCode != 200) {
          reject("Cannot GET tile " + url);
        }
        res.pipe(file);
        file.on("finish", () => {
          resolve(filename);
        });
      }
    );
  });
}

async function composite(dest, tiles, tileSize, xCount, yCount) {
  const toCompositeOp = ({ x, y, file }) => ({
    input: file,
    top: y * tileSize,
    left: x * tileSize,
  });
  try {
    const { channels } = await sharp(tiles[0].file).metadata();
    await sharp({
      create: {
        width: tileSize * xCount,
        height: tileSize * yCount,
        channels,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .composite(tiles.map(toCompositeOp))
      .png()
      .toFile(dest);
  } catch (error) {
    console.log(error);
  }
}

async function downloadMapyCzTiles(
  dir,
  zoom,
  fromLong,
  fromLat,
  toLong,
  toLat
) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  var fromX = long2tile(zoom, fromLong);
  var fromY = lat2tile(zoom, fromLat);
  var toX = long2tile(zoom, toLong);
  var toY = lat2tile(zoom, toLat);
  if (fromX > toX) {
    var tmp = toX;
    toX = fromX;
    fromX = tmp;
  }
  if (fromY > toY) {
    var tmp = toY;
    toY = fromY;
    fromY = tmp;
  }
  console.log(`Coords from ${fromX}, ${fromY} to ${toX}, ${toY}`);
  const xCount = toX - fromX;
  const yCount = toY - fromY;
  const tileSize = 256;
  const cleanupList = [];
  const rows = [];
  for (var y = 0; y < yCount; y++) {
    const tiles = [];
    for (var x = 0; x < xCount; x++) {
      try {
        const file = await downloadTile(dir, zoom, fromX + x, fromY + y);
        console.log("Downloaded " + file);
        cleanupList.push(file);
        tiles.push({ x, y: 0, file });
      } catch (error) {
        console.log(error);
        return;
      }
    }
    const rowFile = join(dir, "row-" + y + ".png");
    cleanupList.push(rowFile);
    await composite(rowFile, tiles, tileSize, xCount, 1);
    rows.push({ x: 0, y, file: rowFile });
    console.log("Stitched row " + (y + 1));
  }
  await composite(join(dir, "output.png"), rows, tileSize, xCount, yCount);
  console.log("Output saved");
  cleanupList.forEach((file) => fs.unlinkSync(file));
}

function printUsage() {
  console.log("Usage: ");
  console.log(
    "$ npx mapycz-tile-downl <output dir> <zoom level> <from lat> <from long> <to lat> <to long>"
  );
  console.log("Example: ");
  console.log(
    "$ npx mapycz-tile-downl tiles/ 18 49.199381 16.601219 49.192088 16.613920"
  );
}

function validateArgs(args) {
  if (
    Number.isNaN(args[1]) ||
    Number.isNaN(args[2]) ||
    Number.isNaN(args[3]) ||
    Number.isNaN(args[4]) ||
    Number.isNaN(args[5])
  ) {
    return false;
  }

  var dir = join(process.cwd(), args[0] + "/");
  var zoom = Number.parseInt(args[1]);
  var fromLat = Number.parseFloat(args[2]);
  var fromLong = Number.parseFloat(args[3]);
  var toLat = Number.parseFloat(args[4]);
  var toLong = Number.parseFloat(args[5]);
  downloadMapyCzTiles(dir, zoom, fromLong, fromLat, toLong, toLat);
  return true;
}

const args = process.argv.slice(2);
if (args.length != 6 || !validateArgs(args)) {
  printUsage();
  return;
}
