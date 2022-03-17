const nodePath = require("path");
const { fs } = require("./fs");
import { IPackageJSON } from "./Application";

export interface IModuleInfo {
  entryPath: string;
  moduleAbsPath: string;
  modulePkgJSONPath: string;
  pkgJSON: IPackageJSON;
}
interface IPath {
  join: (...paths: string[]) => string;
  findModulePath: (...paths: string[]) => IModuleInfo;
}

export class Path implements IPath {
  findModulePath(basePath: string, ...paths: string[]): IModuleInfo {
    let modulePkgJSONPath;
    while (
      !(modulePkgJSONPath = this.join(basePath, ...paths, "package.json")) &&
      nodePath.dirname(basePath) !== basePath
    ) {
      basePath = nodePath.dirname(basePath);
    }

    if (!modulePkgJSONPath) {
      throw Error(`不存在 module ${paths.join(".")}!`);
    }

    let pkgJSON;
    try {
      pkgJSON = fs.readJSONSync(modulePkgJSONPath);
    } catch (error) {
      return null;
    }
    return {
      entryPath: this.join(...paths, pkgJSON.main || "index.js"),
      moduleAbsPath: this.join(...paths),
      modulePkgJSONPath,
      pkgJSON,
    };
  }

  join(...paths: string[]): string {
    return nodePath.join(...paths);
  }
}

export const path = new Path();
