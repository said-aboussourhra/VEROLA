"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { DEFAULT_CATALOG, type Product } from "@/lib/pricing";

const CatalogCtx = createContext<Product[]>(DEFAULT_CATALOG);

/** Provided once by the root layout with the live product list from the database. */
export function CatalogProvider({ products, children }: { products: Product[]; children: ReactNode }) {
  return <CatalogCtx.Provider value={products}>{children}</CatalogCtx.Provider>;
}

/** The products currently offered on the site. */
export function useCatalog(): Product[] {
  return useContext(CatalogCtx);
}
