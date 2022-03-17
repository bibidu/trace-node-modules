import { traceFromPkgJSONPath, traceFromPkgJSON } from "./Application";

export {};

const path = require("path");
// const app = traceFromPkgJSONPath(path.resolve(__dirname, "..", "package.json"));
const app = traceFromPkgJSONPath(
  "/Users/bibidu/Desktop/meituan/waimai_bargain_mp/package.json"
);

const modules = app.getModuleMap();
console.log(modules.filter(module => module.name === '@rollup/pluginutils'));
for (let { name, version, packageSize } of modules) {
  // console.log("[Module]", `${name}@${version} ${packageSize}`);
}
