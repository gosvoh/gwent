import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import post from "./request.manager";
import { EffectCallback, useCallback, useEffect, useState } from "react";

// TODO change this to a better name
export async function getData<T>(
  req: NextApiRequest,
  res: NextApiResponse<T | any>,
  procedureName: string,
  ...args: string[]
) {
  const token = await getToken({ req });
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    res.end();
    return null;
  }
  const data = await post(procedureName, token.token, ...args);
  if (data[0] && data[0].ERROR) res.status(400);
  else res.status(200);
  return data;
}

export type MapOrEntries<K, V> = Map<K, V> | [K, V][];

// Public interface
export interface Actions<K, V> {
  set: (key: K, value: V) => void;
  setAll: (entries: MapOrEntries<K, V>) => void;
  remove: (key: K) => void;
  reset: Map<K, V>["clear"];
}

// We hide some setters from the returned map to disable autocompletion
type Return<K, V> = [
  Omit<Map<K, V>, "set" | "clear" | "delete">,
  Actions<K, V>
];

export function useMap<K, V>(
  initialState: MapOrEntries<K, V> = new Map()
): Return<K, V> {
  const [map, setMap] = useState(new Map(initialState));

  const actions: Actions<K, V> = {
    set: useCallback((key, value) => {
      setMap((prev) => {
        const copy = new Map(prev);
        copy.set(key, value);
        return copy;
      });
    }, []),

    setAll: useCallback((entries) => {
      setMap(() => new Map(entries));
    }, []),

    remove: useCallback((key) => {
      setMap((prev) => {
        const copy = new Map(prev);
        copy.delete(key);
        return copy;
      });
    }, []),

    reset: useCallback(() => {
      setMap(() => new Map());
    }, []),
  };

  return [map, actions];
}

export function useEffectOnce(effect: EffectCallback) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
}
