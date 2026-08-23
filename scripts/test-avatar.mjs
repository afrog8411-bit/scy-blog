import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createAvatarJpeg, resolvePublicImagePath } from "../src/lib/avatar.ts";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const settingsPath = path.join(projectRoot, "src", "data", "site-settings.json");
const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
const profileImage = settings.shared.profileImage;

assert.throws(
  () => resolvePublicImagePath("uploads/avatar.jpg", projectRoot),
  /must start with a single slash/
);
assert.throws(
  () => resolvePublicImagePath("//example.com/avatar.jpg", projectRoot),
  /must start with a single slash/
);
assert.throws(
  () => resolvePublicImagePath("/../package.json", projectRoot),
  /must stay inside public/
);

const sourcePath = resolvePublicImagePath(profileImage, projectRoot);
assert.ok(fs.existsSync(sourcePath));

const avatarJpeg = await createAvatarJpeg(profileImage, projectRoot);
const metadata = await sharp(avatarJpeg).metadata();

assert.equal(metadata.format, "jpeg");
assert.ok(metadata.width > 0);
assert.ok(metadata.height > 0);

console.log("avatar generator valid");
