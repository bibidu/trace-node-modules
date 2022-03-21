import { IModuleInfo } from "./path";
import { process } from "./process";
import {
  startWalk,
  endWalk,
  watchWalk,
  isWalking,
  isWalked,
  getWalk,
} from "./walk";
import { genKey } from "./key";

export interface IModuleLogInfo {
  name: string;
  version: string;
  packageSize: number;
}

export class Module {
  level: number; // 层级
  name: string; // 包名
  version: string; // 版本
  basePath: string; // 包所在的项目路径
  moduleInfo: IModuleInfo; // 模块路径相关信息
  packageSize: number = 0; // 包大小
  parent: Module;
  children: Module[] = [];
  allSubModules: Module[];

  isInRootPackageJSON: boolean = false; // 是否在 项目根目录的 package.json 中
  isDevDependency: boolean = false; // 是否是 devDependency

  setInRootPackageJSON(value: boolean) {
    this.isInRootPackageJSON = value;
  }

  setDevDependency(value: boolean) {
    let parent = this.parent;
    while (parent) {
      if (parent.isDevDependency) {
        this.isDevDependency = true;
        return;
      }
      parent = parent.parent;
    }
    this.isDevDependency = value;
  }

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

  public getAncestors(): string[] {
    const ancestors = [];

    let parent = this.parent;
    while (parent) {
      ancestors.unshift(
        genKey(parent.name, parent.version) + "/" + parent.isDevDependency
      );
      parent = parent.parent;
    }

    return ancestors;
  }

  public getDependentModules(): void {
    const key = genKey(this.name, this.version);
    // Start
    startWalk(key);

    const allSubModules = this.extractDeps(this.moduleInfo);
    this.allSubModules = allSubModules;

    // End
    endWalk(key, this);
  }

  private extractDeps(moduleInfo: IModuleInfo): Module[] {
    return process(moduleInfo.pkgJSON, this.basePath)
      .filter(Boolean)
      .reduce(
        (
          modules,
          {
            name,
            version,
            isDevDependency,
            modulePkgJSONPath,
            ...subModuleInfo
          }
        ) => {
          const key = genKey(name, version);
          if (isWalked(key)) {
            const module = getWalk(key).value;
            return modules;
          }
          if (isWalking(key)) {
            watchWalk(key, (value) => {});
            return modules;
          }

          const module = new Module(
            name,
            version,
            subModuleInfo.moduleBasePath,
            subModuleInfo
          );
          module.setParent(this);
          this.setChild(module);

          module.setDevDependency(isDevDependency);
          module.getDependentModules();

          return [...modules, module, ...module.allSubModules];
        },
        []
      );
  }

  public setParent(parent: Module) {
    this.parent = parent;
  }

  public setChild(child: Module) {
    this.children.push(child);
  }

  public getCurrentModuleInfo(): IModuleLogInfo {
    return {
      name: this.name,
      version: this.version,
      packageSize: this.packageSize,
    };
  }
}
