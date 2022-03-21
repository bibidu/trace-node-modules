import { markLostModules } from "./log";
import { IPackageJSON } from "./Application";
import { _path as path, IModuleInfo } from "./path";

export function process(pkgJSON: IPackageJSON, basePath: string): any[] {
  const { dependencies = {}, devDependencies = {} } = pkgJSON;

  return Object.entries({
    ...dependencies,
    ...devDependencies,
  }).map(([name, version]) => {
    const moduleInfo = path.findModulePath(basePath, `node_modules/${name}`);

    if (!moduleInfo) {
      const isDependency = Boolean(name in dependencies);
      if (isDependency) {
        markLostModules(`[模块名] "${name}@${version}"
父依赖: ${pkgJSON.name}@${pkgJSON.version}`);
      }
      return null;
    }

    return {
      ...moduleInfo,
      name,
      version,
      isDevDependency: !(name in dependencies),
    };
  });
}
