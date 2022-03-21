import { trace } from "./Application";
import { genKey } from "./key";
import { IModuleLogInfo, Module } from "./Module";
import { getWalkMap } from "./walk";

export {};

import * as path from "path";
// const PATH = 'path.resolve(__dirname, "..", "package.json")'
const PATH = "/Users/bibidu/Desktop/meituan/waimai_bargain_mp/package.json";
const app = trace(PATH);
