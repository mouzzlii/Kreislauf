import { readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Make the Better Auth schema visible to the existing non-recursive migrator
 * only for an auth-enabled Netlify build. The generated root-level copy is
 * removed after the build/migration; an existing user-managed copy is preserved.
 *
 * @param {string} root
 * @param {boolean} authEnabled
 * @returns {Promise<{ created: boolean, cleanup: () => Promise<void> }>}
 */
export async function prepareNetlifyAuthMigration(root, authEnabled) {
  if (!authEnabled) {
    return { created: false, cleanup: async () => {} };
  }

  const sourcePath = join(root, "migrations", "auth", "0001_auth.sql");
  const targetPath = join(root, "migrations", "0001_auth.sql");
  const source = await readFile(sourcePath, "utf8");

  let existing;
  try {
    existing = await readFile(targetPath, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  if (existing !== undefined) {
    if (existing !== source) {
      throw new Error(
        "migrations/0001_auth.sql differs from migrations/auth/0001_auth.sql. " +
          "Refusing to apply a divergent Better Auth schema.",
      );
    }
    return { created: false, cleanup: async () => {} };
  }

  await writeFile(targetPath, source, { flag: "wx" });

  return {
    created: true,
    cleanup: async () => {
      let current;
      try {
        current = await readFile(targetPath, "utf8");
      } catch (error) {
        if (error?.code === "ENOENT") return;
        throw error;
      }
      if (current === source) await unlink(targetPath);
    },
  };
}
