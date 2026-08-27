import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
} from "@/lib/api";
import { toast } from "sonner";

const CartContext = createContext(null);

function getCartId() {
  let id = localStorage.getItem("gizmovo_cart_id");
  if (!id) {
    id = uuidv4();
    localStorage.setItem("gizmovo_cart_id", id);
  }
  return id;
}

export function CartProvider({ children }) {
  const [cartId] = useState(getCartId);
  const [cart, setCart] = useState({ items: [], subtotal: 0, count: 0 });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getCart(cartId);
      setCart(data);
    } catch (e) {
      // silent — cart is non-critical on load
    }
  }, [cartId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (product, { variant = null, quantity = 1, openDrawer = true } = {}) => {
      setAddingId(product.id);
      try {
        const data = await addCartItem(cartId, {
          product_id: product.id,
          variant,
          quantity,
        });
        setCart(data);
        toast.success(`${product.name} added to bag`);
        if (openDrawer) setDrawerOpen(true);
      } catch (e) {
        toast.error(
          e?.response?.data?.detail || "Couldn't add to bag. Please try again."
        );
      } finally {
        setAddingId(null);
      }
    },
    [cartId]
  );

  const updateQty = useCallback(
    async (itemId, quantity) => {
      setLoading(true);
      try {
        const data = await updateCartItem(cartId, itemId, quantity);
        setCart(data);
      } catch (e) {
        toast.error("Couldn't update quantity.");
      } finally {
        setLoading(false);
      }
    },
    [cartId]
  );

  const removeItem = useCallback(
    async (itemId) => {
      setLoading(true);
      try {
        const data = await removeCartItem(cartId, itemId);
        setCart(data);
      } catch (e) {
        toast.error("Couldn't remove item.");
      } finally {
        setLoading(false);
      }
    },
    [cartId]
  );

  const value = {
    cartId,
    cart,
    drawerOpen,
    setDrawerOpen,
    loading,
    addingId,
    addItem,
    updateQty,
    removeItem,
    refresh,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
