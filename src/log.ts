import { _fs as fs } from "./fs";
import { getWalkMap } from "./walk";

const lostModules = []; // 缺失模块

export function markLostModules(value) {
  lostModules.push(value);
}

export function logLostModules() {
  fs.writeFileSync(".lost-modules.json", JSON.stringify(lostModules, null, 2));
}

export function logUniqueModules() {
  fs.writeFileSync(
    ".unique-modules.json",
    JSON.stringify(
      [...getWalkMap().entries()].map(([_, f]) => f.value.getCurrentModuleInfo()),
      null,
      2
    )
  );
}

const debugLogs = [];
export function markDebugLogs(value) {
  debugLogs.push(value);
}
export function logDebugLogs() {
  fs.writeFileSync(".result.json", JSON.stringify(debugLogs, null, 2));
}
