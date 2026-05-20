"use client";

import { FREE_CREDITS } from "@/lib/constants";
import type { GenerationItem, GenerationRecord, GeneratorType, SavedSet } from "@/lib/types";

const CREDIT_KEY = "aifantasy:demo-credits";
const GENERATIONS_KEY = "aifantasy:generations";
const FAVORITES_KEY = "aifantasy:favorites";
const SAVED_SETS_KEY = "aifantasy:saved-sets";
const USER_KEY = "aifantasy:demo-user";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("aifantasy-storage"));
}

export function getDemoCredits() {
  if (typeof window === "undefined") return FREE_CREDITS;
  const value = window.localStorage.getItem(CREDIT_KEY);
  if (!value) {
    window.localStorage.setItem(CREDIT_KEY, String(FREE_CREDITS));
    return FREE_CREDITS;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : FREE_CREDITS;
}

export function setDemoCredits(value: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CREDIT_KEY, String(Math.max(0, value)));
  window.dispatchEvent(new CustomEvent("aifantasy-storage"));
}

export function addDemoCredits(amount: number) {
  const next = getDemoCredits() + amount;
  setDemoCredits(next);
  return next;
}

export function consumeDemoCredits(amount: number) {
  const current = getDemoCredits();
  if (current < amount) return false;
  setDemoCredits(current - amount);
  return true;
}

export function getLocalGenerations() {
  return readJson<GenerationRecord[]>(GENERATIONS_KEY, []);
}

export function saveLocalGeneration(record: GenerationRecord) {
  const records = getLocalGenerations();
  writeJson(GENERATIONS_KEY, [record, ...records].slice(0, 60));
}

export function getLocalFavorites() {
  return readJson<Array<GenerationItem & { generationType: GeneratorType }>>(
    FAVORITES_KEY,
    []
  );
}

export function toggleLocalFavorite(
  generationType: GeneratorType,
  item: GenerationItem
) {
  const favorites = getLocalFavorites();
  const exists = favorites.some((favorite) => favorite.id === item.id);
  const next = exists
    ? favorites.filter((favorite) => favorite.id !== item.id)
    : [{ ...item, isFavorite: true, generationType }, ...favorites];
  writeJson(FAVORITES_KEY, next);
  return !exists;
}

export function getLocalSavedSets() {
  return readJson<SavedSet[]>(SAVED_SETS_KEY, []);
}

export function saveLocalSet(set: SavedSet) {
  const sets = getLocalSavedSets();
  writeJson(SAVED_SETS_KEY, [set, ...sets].slice(0, 40));
}

export function getDemoUser() {
  return readJson<{ email: string; displayName: string } | null>(USER_KEY, null);
}

export function setDemoUser(email: string) {
  writeJson(USER_KEY, {
    email,
    displayName: email.split("@")[0] || "Demo Creator"
  });
}

export function clearDemoUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new CustomEvent("aifantasy-storage"));
}
