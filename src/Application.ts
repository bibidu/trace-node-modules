import { fs } from "./fs";
import { path } from "./path";
import { flush } from "./log";
import { Module } from "./Module";
import { process } from "./process";
import { registerModuleVersion, getModules } from "./registerModule";

interface IDepInPackageJSON {
  [key: string]: string;
}
export interface IPackageJSON {
  name: string;
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

  private setEnviroment(env: Env) {
    this.env = env;
  }
  private setBasePath(basePath: string) {
    this.basePath = basePath;
  }

  public registerModulesFromPath(pkgJSONAbsolutePath: string) {
    this.setEnviroment(Env.NODEJS);
    this.setBasePath(
      pkgJSONAbsolutePath.replace(new RegExp("/package.json$"), "")
    );

    const pkgJSON = this.resolvePkgJSON(pkgJSONAbsolutePath);
    return this.registerModules(pkgJSON);
  }

  public registerModulesFromJSON(pkgJSON: IPackageJSON) {
    this.setEnviroment(Env.BROWSER);
    this.setBasePath("~");
    return this.registerModules(pkgJSON);
  }

  private registerModules(pkgJSON: IPackageJSON) {
    for (let { name, version, ...moduleInfo } of process(
      pkgJSON,
      this.basePath
    ).filter(Boolean)) {
      const topModule = new Module(name, version, this.basePath, moduleInfo);
      const modules = topModule.getDependentModules();
      for (let module of modules) {
        registerModuleVersion(name, version, module);
      }
    }
  }

  /**
   * 获取存在不同版本的所有包
   */
  public getMultiVersionModules() {}

  // test
  public getModuleMap() {
    return getModules();
  }

  private resolvePkgJSON(absPath: string) {
    return fs.readJSONSync<IPackageJSON>(absPath);
  }

  private resolveTopModulePath(moduleName: string, moduleVersion: string) {
    return path.findModulePath(this.basePath, "node_modules", moduleName);
  }
}

export function traceFromPkgJSONPath(pkgJSONAbsolutePath: string) {
  const app = new Application();
  app.registerModulesFromPath(pkgJSONAbsolutePath);
  flush();
  return app;
}

export function traceFromPkgJSON(pkgJSON: IPackageJSON) {
  const app = new Application();
  app.registerModulesFromJSON(pkgJSON);
  return app;
}
