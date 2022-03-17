import { Module } from "./Module";

const moduleMap = new Map<string, Module>();

const getKey = (moduleName: string, version: string) =>
  `${moduleName}@${version}`;
export function registerModuleVersion(
  moduleName: string,
  version: string,
  module: Module
) {
  const key = getKey(moduleName, version);
  if (moduleName.includes('@rollup/plugin-node-resolve')) {
    // if (moduleName === '@rollup/pluginutils') {
    console.log(`key ${key} version ${version}`, !!moduleMap.get(key))
  }
  if (!moduleMap.get(key)) {
    moduleMap.set(key, module);
    return true;
  }
  return false;
}

export function getModulePrecisely(moduleName: string, version: string) {
  return moduleMap.get(getKey(moduleName, version));
}

export function getModuleByName(moduleName: string) {
  const module = [...moduleMap.keys()].find((key) =>
    key.startsWith(`${moduleMap}@`)
  );
  return module ? moduleMap.get(module) : null;
}

export function getModules() {
  return [...moduleMap.values()].map((module) => module.getModuleInfo());
}
