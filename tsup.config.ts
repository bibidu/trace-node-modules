import type { Options } from "tsup";
import { replace } from "esbuild-plugin-replace";

export const tsup: Options = {
  clean: true,
  format: ["esm", "cjs", "iife"],
  legacyOutput: true,
  esbuildPlugins: [
    replace({
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    }),
  ],
};
