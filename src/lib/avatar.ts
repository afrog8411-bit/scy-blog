import path from "node:path";
import sharp from "sharp";

export function resolvePublicImagePath(
  profileImage: string,
  projectRoot = process.cwd()
): string {
  if (!profileImage.startsWith("/") || profileImage.startsWith("//")) {
    throw new Error("profile image path must start with a single slash");
  }

  const publicRoot = path.resolve(projectRoot, "public");
  const sourcePath = path.resolve(publicRoot, profileImage.slice(1));
  const relativePath = path.relative(publicRoot, sourcePath);

  if (
    relativePath === "" ||
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error("profile image path must stay inside public");
  }

  return sourcePath;
}

export async function createAvatarJpeg(
  profileImage: string,
  projectRoot = process.cwd()
): Promise<Buffer> {
  const sourcePath = resolvePublicImagePath(profileImage, projectRoot);

  return sharp(sourcePath)
    .rotate()
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
}
