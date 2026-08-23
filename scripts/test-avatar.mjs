import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
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
if (process.platform === "win32") {
  assert.throws(
    () => resolvePublicImagePath("/uploads\\..\\..\\package.json", projectRoot),
    /must stay inside public/
  );
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "avatar-test-"));

try {
  const publicRoot = path.join(tempRoot, "public");
  const outsideRoot = path.join(tempRoot, "outside");
  const linkedRoot = path.join(publicRoot, "linked");

  fs.mkdirSync(publicRoot);
  fs.mkdirSync(outsideRoot);
  fs.writeFileSync(path.join(outsideRoot, "avatar.jpg"), "outside");
  fs.symlinkSync(
    outsideRoot,
    linkedRoot,
    process.platform === "win32" ? "junction" : "dir"
  );

  assert.throws(
    () => resolvePublicImagePath("/linked/avatar.jpg", tempRoot),
    /must stay inside public/
  );
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

const sourcePath = resolvePublicImagePath(profileImage, projectRoot);
assert.ok(fs.existsSync(sourcePath));

await assert.rejects(
  () => createAvatarJpeg("/uploads/does-not-exist.jpg", projectRoot),
  /ENOENT|no such file/i
);

const avatarJpeg = await createAvatarJpeg(profileImage, projectRoot);
const metadata = await sharp(avatarJpeg).metadata();

assert.equal(metadata.format, "jpeg");
assert.ok(metadata.width > 0);
assert.ok(metadata.height > 0);

console.log("avatar generator valid");
