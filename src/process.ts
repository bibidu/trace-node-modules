import { add } from "./log";
import { IPackageJSON } from "./Application";
import { path, IModuleInfo } from "./path";

export function process(pkgJSON: IPackageJSON, basePath: string): any[] {
  const { dependencies = {}, devDependencies = {} } = pkgJSON;

  return Object.entries({
    ...dependencies,
    ...devDependencies,
  }).map(([name, version]) => {
    const moduleInfo = path.findModulePath(basePath, "node_modules", name);

    if (!moduleInfo) {
      add(`不存在的依赖模块 ${name}@${version}; 父依赖: ${pkgJSON.name}`);
      return null;
    }

    return {
      ...moduleInfo,
      name,
      version,
    };
  });
}
