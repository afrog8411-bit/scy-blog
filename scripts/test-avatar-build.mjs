import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createAvatarJpeg } from "../src/lib/avatar.ts";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const avatarPath = path.join(projectRoot, "dist", "avatar.jpg");
const indexPath = path.join(projectRoot, "dist", "index.html");
const settingsPath = path.join(projectRoot, "src", "data", "site-settings.json");
const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
const expectedAvatar = await createAvatarJpeg(
  settings.shared.profileImage,
  projectRoot
);

assert.ok(fs.existsSync(avatarPath), "dist/avatar.jpg must exist");

const builtAvatar = fs.readFileSync(avatarPath);
assert.deepEqual(
  builtAvatar,
  expectedAvatar,
  "dist/avatar.jpg must match the configured profile image"
);

const metadata = await sharp(avatarPath).metadata();
assert.equal(metadata.format, "jpeg", "dist/avatar.jpg must contain JPEG data");

const indexHtml = fs.readFileSync(indexPath, "utf8");
assert.ok(indexHtml.includes('src="/avatar.jpg"'), "homepage must use /avatar.jpg");
assert.ok(
  !indexHtml.includes(settings.shared.profileImage),
  "homepage must not expose the hashed profile image path"
);
assert.ok(!indexHtml.includes("<footer"), "homepage footer must be removed");

console.log("stable avatar build valid");
