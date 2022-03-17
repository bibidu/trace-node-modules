import { fs } from "./fs";

const logs = [];

export function add(value) {
  logs.push(value);
}

export function flush() {
  fs.writeFileSync(".logs", logs.join("\n"));
}
