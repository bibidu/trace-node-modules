import { IModuleInfo, path } from "./path";
import { process } from "./process";

export class Module {
  level: number; // 层级
  name: string; // 包名
  version: string; // 版本
  basePath: string; // 包所在的项目路径
  moduleInfo: IModuleInfo; // 模块路径相关信息
  packageSize: number = 0; // 包大小
  parent: Module;
  
  constructor(
    name: string,
    version: string,
    basePath: string,
    moduleInfo: IModuleInfo
  ) {
    this.name = name;
    this.version = version;
    this.basePath = basePath;
    this.moduleInfo = moduleInfo;
  }

  getDependentModules(): Module[] {
    const ancestorModules = this.extractDeps(this.moduleInfo);
    return ancestorModules;
  }

  private extractDeps(moduleInfo: IModuleInfo) {
    return process(moduleInfo.pkgJSON, this.basePath)
      .filter(Boolean)
      .reduce((modules, { name, version, ...subModuleInfo }) => {
        const module = new Module(
          name,
          version,
          subModuleInfo.moduleAbsPath,
          subModuleInfo
        );
        module.setParent(this)
        return [...modules, module, ...module.getDependentModules()];
      }, []);
  }

  public setParent(parent: Module) {
    this.parent = parent
  }

  public getModuleInfo(): any {
    return {
      name: this.name,
      version: this.version,
      parent: this.parent.name,
      parentVersion: this.parent.version,
      packageSize: this.packageSize,
    };
  }
}
