from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
import re
import uuid
from datetime import datetime, timezone

from seed_data import PRODUCTS, CATEGORIES

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Gizmovo API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

MAX_QTY = 5


def now_iso():
    return datetime.now(timezone.utc).isoformat()


# ----------------------------- Models -----------------------------
class CartItemIn(BaseModel):
    product_id: str
    variant: Optional[str] = None
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class NewsletterIn(BaseModel):
    email: EmailStr


class ContactIn(BaseModel):
    name: str = Field(min_length=2)
    email: EmailStr
    message: str = Field(min_length=2)


class CheckoutIn(BaseModel):
    cart_id: str
    email: EmailStr
    full_name: str
    phone: str
    address1: str
    address2: Optional[str] = ""
    city: str
    state: str
    pincode: str


# ----------------------------- Helpers -----------------------------
async def build_cart(cart_id: str) -> Dict[str, Any]:
    cart = await db.carts.find_one({"cart_id": cart_id}, {"_id": 0})
    if not cart:
        cart = {"cart_id": cart_id, "items": []}
    items_out = []
    subtotal = 0
    for it in cart.get("items", []):
        prod = await db.products.find_one({"id": it["product_id"]}, {"_id": 0})
        if not prod:
            continue
        line = prod["price"] * it["quantity"]
        subtotal += line
        items_out.append({
            "item_id": it["item_id"],
            "product_id": it["product_id"],
            "slug": prod["slug"],
            "name": prod["name"],
            "category": prod["category"],
            "image": prod["images"][0] if prod["images"] else None,
            "price": prod["price"],
            "compare_at_price": prod.get("compare_at_price"),
            "variant": it.get("variant"),
            "quantity": it["quantity"],
            "line_total": line,
        })
    count = sum(i["quantity"] for i in items_out)
    return {
        "cart_id": cart_id,
        "items": items_out,
        "subtotal": subtotal,
        "count": count,
        "currency": "INR",
        "free_shipping": True,
    }


# ----------------------------- Routes -----------------------------
@api_router.get("/")
async def root():
    return {"brand": "Gizmovo", "status": "ok"}


@api_router.get("/categories")
async def get_categories():
    return CATEGORIES


@api_router.get("/products")
async def get_products(
    category: Optional[str] = None,
    best_seller: Optional[bool] = None,
    badge: Optional[str] = None,
    sort: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
):
    q: Dict[str, Any] = {}
    if category and category != "all":
        q["category_slug"] = category
    if best_seller is not None:
        q["best_seller"] = best_seller
    if badge:
        q["badge"] = badge
    if search:
        safe = re.escape(search)
        q["$or"] = [
            {"name": {"$regex": safe, "$options": "i"}},
            {"tagline": {"$regex": safe, "$options": "i"}},
            {"category": {"$regex": safe, "$options": "i"}},
        ]
    products = await db.products.find(q, {"_id": 0}).to_list(limit)

    if sort == "price-asc":
        products.sort(key=lambda x: x["price"])
    elif sort == "price-desc":
        products.sort(key=lambda x: x["price"], reverse=True)
    elif sort == "name":
        products.sort(key=lambda x: x["name"])
    else:
        products.sort(key=lambda x: x.get("position", 999))
    return products


@api_router.get("/products/{slug}")
async def get_product(slug: str):
    prod = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    related = []
    seen = {slug}
    for rslug in prod.get("related", []):
        r = await db.products.find_one({"slug": rslug}, {"_id": 0})
        if r and r["slug"] not in seen:
            related.append(r)
            seen.add(r["slug"])
    if len(related) < 4:
        extra = await db.products.find(
            {"category_slug": prod["category_slug"], "slug": {"$nin": list(seen)}}, {"_id": 0}
        ).to_list(10)
        for e in extra:
            related.append(e)
            if len(related) >= 4:
                break
    prod["related_products"] = related[:4]
    return prod


@api_router.get("/search")
async def predictive_search(q: str = ""):
    if not q.strip():
        return {"products": [], "categories": []}
    safe = re.escape(q)
    products = await db.products.find(
        {"$or": [
            {"name": {"$regex": safe, "$options": "i"}},
            {"tagline": {"$regex": safe, "$options": "i"}},
            {"category": {"$regex": safe, "$options": "i"}},
        ]}, {"_id": 0}
    ).to_list(6)
    cats = [c for c in CATEGORIES if q.lower() in c["name"].lower()]
    return {"products": products, "categories": cats}


@api_router.get("/cart/{cart_id}")
async def get_cart(cart_id: str):
    return await build_cart(cart_id)


@api_router.post("/cart/{cart_id}/items")
async def add_item(cart_id: str, item: CartItemIn):
    prod = await db.products.find_one({"id": item.product_id}, {"_id": 0})
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    if not prod.get("available", True):
        raise HTTPException(status_code=400, detail="Product is out of stock")
    if item.quantity < 1:
        raise HTTPException(status_code=400, detail="Invalid quantity")

    cart = await db.carts.find_one({"cart_id": cart_id})
    if not cart:
        cart = {"cart_id": cart_id, "items": [], "created_at": now_iso()}
        await db.carts.insert_one(dict(cart))

    items = cart.get("items", [])
    existing = next(
        (i for i in items if i["product_id"] == item.product_id and i.get("variant") == item.variant),
        None,
    )
    if existing:
        if existing["quantity"] >= MAX_QTY:
            raise HTTPException(status_code=400, detail=f"You can add up to {MAX_QTY} of this item")
        existing["quantity"] = min(MAX_QTY, existing["quantity"] + item.quantity)
    else:
        items.append({
            "item_id": str(uuid.uuid4()),
            "product_id": item.product_id,
            "variant": item.variant,
            "quantity": min(MAX_QTY, item.quantity),
        })
    await db.carts.update_one({"cart_id": cart_id}, {"$set": {"items": items}})
    return await build_cart(cart_id)


@api_router.put("/cart/{cart_id}/items/{item_id}")
async def update_item(cart_id: str, item_id: str, upd: CartItemUpdate):
    cart = await db.carts.find_one({"cart_id": cart_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    items = cart.get("items", [])
    target = next((i for i in items if i["item_id"] == item_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Item not found")
    if upd.quantity <= 0:
        items = [i for i in items if i["item_id"] != item_id]
    else:
        target["quantity"] = min(MAX_QTY, max(1, upd.quantity))
    await db.carts.update_one({"cart_id": cart_id}, {"$set": {"items": items}})
    return await build_cart(cart_id)


@api_router.delete("/cart/{cart_id}/items/{item_id}")
async def remove_item(cart_id: str, item_id: str):
    cart = await db.carts.find_one({"cart_id": cart_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    items = [i for i in cart.get("items", []) if i["item_id"] != item_id]
    await db.carts.update_one({"cart_id": cart_id}, {"$set": {"items": items}})
    return await build_cart(cart_id)


@api_router.post("/newsletter")
async def newsletter(inp: NewsletterIn):
    await db.newsletter.update_one(
        {"email": inp.email},
        {"$setOnInsert": {"email": inp.email, "created_at": now_iso()}},
        upsert=True,
    )
    return {"ok": True, "message": "You're on the list."}


@api_router.post("/contact")
async def contact(inp: ContactIn):
    doc = inp.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    await db.contact_messages.insert_one(doc)
    return {"ok": True, "message": "Thanks — we'll get back to you soon."}


@api_router.get("/orders/{order_no}")
async def get_order(order_no: str):
    order = await db.orders.find_one({"order_no": order_no}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@api_router.post("/checkout")
async def checkout(inp: CheckoutIn):
    cart = await build_cart(inp.cart_id)
    if not cart["items"]:
        raise HTTPException(status_code=400, detail="Your cart is empty")
    for it in cart["items"]:
        prod = await db.products.find_one({"id": it["product_id"]}, {"_id": 0})
        if not prod or not prod.get("available", True):
            raise HTTPException(status_code=400, detail=f"{it['name']} is no longer available")
    order_no = "GZ" + datetime.now(timezone.utc).strftime("%y%m%d") + uuid.uuid4().hex[:6].upper()
    order = {
        "id": str(uuid.uuid4()),
        "order_no": order_no,
        "email": inp.email,
        "full_name": inp.full_name,
        "phone": inp.phone,
        "shipping": {
            "address1": inp.address1,
            "address2": inp.address2,
            "city": inp.city,
            "state": inp.state,
            "pincode": inp.pincode,
        },
        "items": cart["items"],
        "subtotal": cart["subtotal"],
        "total": cart["subtotal"],
        "currency": "INR",
        "status": "pending_payment",
        "created_at": now_iso(),
    }
    await db.orders.insert_one(dict(order))
    await db.carts.update_one({"cart_id": inp.cart_id}, {"$set": {"items": []}})
    order.pop("_id", None)
    return {"ok": True, "order_no": order_no, "order": order}


# ----------------------------- Startup seed -----------------------------
@app.on_event("startup")
async def seed():
    for p in PRODUCTS:
        await db.products.update_one({"slug": p["slug"]}, {"$set": p}, upsert=True)
    logger.info("Seeded %d products", len(PRODUCTS))


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
