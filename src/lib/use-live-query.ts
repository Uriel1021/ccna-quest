"use client";
/**
 * `useLiveQuery` seguro para la hidratación.
 *
 * El de dexie-react-hooks devuelve a veces el valor YA EN CACHÉ de forma síncrona en el primer
 * render del navegador. Si eso ocurre mientras React hidrata el HTML del servidor (que pintó el
 * valor por defecto), aparece el error #418 "hydration mismatch" de forma intermitente.
 * Aquí, durante la hidratación se entrega siempre el valor por defecto y el real justo después.
 */
import { useSyncExternalStore } from "react";
import { useLiveQuery as useDexieLiveQuery } from "dexie-react-hooks";

const noop = () => () => {};
/** false mientras React hidrata el HTML del servidor; true en cualquier render posterior. */
export const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

export function useLiveQuery<T>(querier: () => Promise<T> | T, deps?: unknown[]): T | undefined;
export function useLiveQuery<T, D>(querier: () => Promise<T> | T, deps: unknown[], defaultResult: D): T | D;
export function useLiveQuery<T, D>(querier: () => Promise<T> | T, deps: unknown[] = [], defaultResult?: D): T | D | undefined {
  const hydrated = useHydrated();
  const value = useDexieLiveQuery(querier, deps, defaultResult as D);
  return hydrated ? value : defaultResult;
}
