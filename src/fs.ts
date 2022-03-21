import * as fs from "fs";

export class FS {
  writeFileSync(filename: string, content: string): void {
    fs.writeFileSync(filename, content, "utf8");
  }
  readFileSync: (path: string) => string;
  readJSONSync<T = object>(path: string): T {
    return require(path);
  }
}

export const _fs = new FS();
