const path = require("path");
import { _fs as fs } from "./fs";
import { IPackageJSON } from "./Application";

export interface IModuleInfo {
  entryAbsPath: string;
  moduleBasePath: string;
  modulePkgJSONPath: string;
  pkgJSON: IPackageJSON;
}
interface IPath {
  join: (...paths: string[]) => string;
  findModulePath: (...paths: string[]) => IModuleInfo;
}

export class Path implements IPath {
  findModulePath(
    basePath: string,
    modulePathWithNodeModules: string
  ): IModuleInfo {
    let modulePkgJSONPath;
    let pkgJSON;

    while (true) {
      modulePkgJSONPath = this.join(
        basePath,
        modulePathWithNodeModules,
        "package.json"
      );
      try {
        pkgJSON = fs.readJSONSync(modulePkgJSONPath);
        const entryAbsPath = this.join(
          basePath,
          modulePathWithNodeModules,
          pkgJSON.main || "index.js"
        );
        const moduleBasePath = this.join(basePath, modulePathWithNodeModules);

        return {
          entryAbsPath,
          moduleBasePath,
          modulePkgJSONPath,
          pkgJSON,
        };
      } catch (error) {
        if (path.dirname(basePath) === basePath) {
          return null;
        }
        basePath = path.dirname(basePath);
      }
    }
  }

  join(...paths: string[]): string {
    return path.join(...paths);
  }
}

export const _path = new Path();
