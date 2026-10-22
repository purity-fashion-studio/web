"use client"

import { useMemo, useSyncExternalStore } from "react"

import {
  addSelection,
  cartSelectionKey,
  parseStoredCart,
  type CartSelection,
} from "./selection"

const storageKey = "purity-cart-v1"
const eventName = "purity-cart-change"
const serverSnapshot = () => ""
function snapshot() {
  try {
    return window.localStorage.getItem(storageKey) ?? ""
  } catch {
    return ""
  }
}
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener)
  window.addEventListener(eventName, listener)
  return () => {
    window.removeEventListener("storage", listener)
    window.removeEventListener(eventName, listener)
  }
}
function save(selections: CartSelection[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(selections))
  window.dispatchEvent(new Event(eventName))
}
export function addCartSelection(selection: CartSelection) {
  save(addSelection(parseStoredCart(snapshot()), selection))
}
export function removeCartSelection(selection: CartSelection) {
  save(
    parseStoredCart(snapshot()).filter(
      (item) => cartSelectionKey(item) !== cartSelectionKey(selection)
    )
  )
}
export function useCartSelections() {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  return useMemo(() => parseStoredCart(raw), [raw])
}
