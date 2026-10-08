export interface PostcssStylexOptions {
  /** Absolute application source paths/globs; compiled packages belong in metadata. */
  include: readonly string[];
  metadata: readonly (string | URL)[];
  unstable_moduleResolution?: { type: "commonJS"; rootDir?: string };
}
declare function postcssStylex(options: PostcssStylexOptions): unknown;
export default postcssStylex;
