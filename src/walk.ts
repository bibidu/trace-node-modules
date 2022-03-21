import { Module } from "./Module";

enum WalkState {
  WALKING,
  WALKED,
}
interface IWalkPayload<T> {
  status: WalkState;
  value: T;
  listeners: ((value: T) => void)[];
}

type IWalkModulePayload = IWalkPayload<Module>;
const walkMap = new Map<string, IWalkModulePayload>();

export const createWalk = (
  status,
  value = null,
  listeners = []
): IWalkModulePayload => ({
  status,
  value,
  listeners,
});
export const getWalk = (key): IWalkModulePayload => walkMap.get(key);

export function startWalk(key) {
  walkMap.set(key, createWalk(WalkState.WALKING));
}
export function endWalk(key, value) {
  const original = getWalk(key);
  original.listeners.forEach((cb) => cb(value));

  walkMap.set(key, createWalk(WalkState.WALKED, value, []));
}
export function watchWalk(
  key: string,
  listener: IWalkModulePayload["listeners"][number]
) {
  const original = getWalk(key);
  if (original) {
    walkMap.set(key, {
      ...original,
      listeners: [...original.listeners, listener],
    });
  } else {
    console.log(`Run startWalk before watchWalk!`);
  }
}

export const isWalking = (key) =>
  getWalk(key) && getWalk(key).status === WalkState.WALKING;
export const isWalked = (key) =>
  getWalk(key) && getWalk(key).status === WalkState.WALKED;

export const getWalkMap = () => walkMap;
