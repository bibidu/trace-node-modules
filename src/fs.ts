import * as nodeFS from "fs";
interface IFS {
  readFileSync: (path: string) => string;
  readJSONSync: <T = object>(path: string) => T;
  writeFileSync: (filename: string, content: string) => void;
}
export class FS implements IFS {
  writeFileSync(filename: string, content: string): void {
    nodeFS.writeFileSync(filename, content, "utf8");
  }
  readFileSync: (path: string) => string;
  readJSONSync<T = object>(path: string): T {
    return require(path);
  }
}

export const fs = new FS();
