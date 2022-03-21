import { _fs as fs } from "./fs";
import { _path as path } from "./path";
import {
  logLostModules,
  logUniqueModules,
  markDebugLogs,
  logDebugLogs,
} from "./log";
import { Module } from "./Module";
import { process } from "./process";
import { getWalkMap, getWalk } from "./walk";
import { genKey } from "./key";

interface IDepInPackageJSON {
  [key: string]: string;
}
export interface IPackageJSON {
  name: string;
  version: string;
  dependencies: IDepInPackageJSON;
  devDependencies: IDepInPackageJSON;
}
enum Env {
  NODEJS = "NODEJS",
  BROWSER = "BROWSER",
}

class Application {
  private env: Env;
  private basePath: string;
  public inRootPackageJSONModules: Module[];

  private setEnviroment(env: Env) {
    this.env = env;
  }
  private setBasePath(basePath: string) {
    this.basePath = basePath;
  }

  public registerModulesByPath(pkgJSONAbsolutePath: string) {
    this.setEnviroment(Env.NODEJS);
    this.setBasePath(
      pkgJSONAbsolutePath.replace(new RegExp("/package.json$"), "")
    );

    const pkgJSON = this.resolvePkgJSON(pkgJSONAbsolutePath);
    this.inRootPackageJSONModules = this.registerModules(pkgJSON);

    return this;
  }

  public registerModulesByJSON(pkgJSON: IPackageJSON) {
    this.setEnviroment(Env.BROWSER);
    this.setBasePath("~");
    this.inRootPackageJSONModules = this.registerModules(pkgJSON);

    return this;
  }

  // debug
  logResult() {
    console.time("Trace...");

    const keys = (map) => [...map.keys()];
    const values = (map) => [...map.values()];
    const entries = (map) => [...map.entries()];

    const modules = values(getWalkMap()).map(({ value }) => value);
    const moduleMap = new Map<string, Map<string, number>>();

    for (const { name, version } of modules) {
      if (moduleMap.has(name)) {
        const versionMap = moduleMap.get(name);
        versionMap.set(version, (versionMap.get(version) || 0) + 1);
      } else {
        const versionMap = new Map<string, number>();
        versionMap.set(version, 1);
        moduleMap.set(name, versionMap);
      }
    }
    for (let [moduleName, versionMap] of entries(moduleMap)) {
      const versions = keys(versionMap);
      if (versions.length > 1) {
        const module = getWalk(genKey(moduleName, versions[0])).value;
        const msg = `[包名] ${moduleName} [是否是开发依赖] ${
          module.isDevDependency
        } [引用链] ${module.getAncestors().join("->")} [不同版本数] ${
          versions.length
        } [版本号] ${versions.join(" | ")}`;
        markDebugLogs(msg);
      }
    }

    console.timeEnd("Trace...");

    logDebugLogs();
  }

  private registerModules(pkgJSON: IPackageJSON) {
    const validModules = process(pkgJSON, this.basePath).filter(Boolean);

    return validModules.map(
      ({ name, version, isDevDependency, ...moduleInfo }) => {
        const instance = new Module(
          name,
          version,
          moduleInfo.moduleBasePath,
          moduleInfo
        );
        instance.setInRootPackageJSON(true);
        instance.setDevDependency(isDevDependency);

        instance.getDependentModules();

        return instance;
      }
    );
  }

  /**
   * 获取存在不同版本的所有包
   */
  public getMultiVersionModules() {}

  private resolvePkgJSON(absPath: string) {
    return fs.readJSONSync<IPackageJSON>(absPath);
  }

  private resolveTopModulePath(moduleName: string, moduleVersion: string) {
    return path.findModulePath(this.basePath, `node_modules/${moduleName}`);
  }
}

export function trace(pkgJSONOrPath: string | IPackageJSON) {
  const app = new Application();
  if (typeof pkgJSONOrPath === "string") {
    app.registerModulesByPath(pkgJSONOrPath);
  } else {
    app.registerModulesByJSON(pkgJSONOrPath);
  }
  // 输出日志
  logLostModules();
  logUniqueModules();

  app.logResult();

  return app;
}
