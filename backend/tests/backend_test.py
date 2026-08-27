"""Gizmovo storefront backend API tests."""
import os
import uuid

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ----------------------------- Catalog -----------------------------
class TestCatalog:
    def test_root(self, s):
        r = s.get(f"{API}/", timeout=30)
        assert r.status_code == 200
        assert r.json()["brand"] == "Gizmovo"

    def test_products_seeded(self, s):
        r = s.get(f"{API}/products", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 13, f"expected 13 products, got {len(data)}"
        p = data[0]
        for k in ("id", "slug", "name", "price", "images", "category", "category_slug"):
            assert k in p
        assert "_id" not in p
        assert isinstance(p["price"], int)
        # default sort by position
        positions = [x.get("position") for x in data]
        assert positions == sorted(positions)

    def test_categories(self, s):
        r = s.get(f"{API}/categories", timeout=30)
        assert r.status_code == 200
        cats = r.json()
        assert len(cats) == 5
        assert {c["slug"] for c in cats} == {"desk", "audio", "home", "everyday-carry", "travel"}

    @pytest.mark.parametrize("cat", ["desk", "audio", "home", "everyday-carry", "travel"])
    def test_filter_category(self, s, cat):
        r = s.get(f"{API}/products", params={"category": cat}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) > 0
        assert all(p["category_slug"] == cat for p in data)

    def test_filter_category_all(self, s):
        r = s.get(f"{API}/products", params={"category": "all"}, timeout=30)
        assert r.status_code == 200
        assert len(r.json()) == 13

    def test_filter_best_seller(self, s):
        r = s.get(f"{API}/products", params={"best_seller": "true"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 6
        assert all(p["best_seller"] is True for p in data)

    def test_filter_badge_new_drop(self, s):
        r = s.get(f"{API}/products", params={"badge": "New Drop"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 3
        assert all(p["badge"] == "New Drop" for p in data)

    def test_sort_price_asc_desc_name(self, s):
        asc = s.get(f"{API}/products", params={"sort": "price-asc"}, timeout=30).json()
        assert [p["price"] for p in asc] == sorted(p["price"] for p in asc)
        desc = s.get(f"{API}/products", params={"sort": "price-desc"}, timeout=30).json()
        assert [p["price"] for p in desc] == sorted((p["price"] for p in desc), reverse=True)
        byname = s.get(f"{API}/products", params={"sort": "name"}, timeout=30).json()
        assert [p["name"] for p in byname] == sorted(p["name"] for p in byname)

    def test_search_param(self, s):
        r = s.get(f"{API}/products", params={"search": "charger"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 2
        assert all("charger" in (p["name"] + p["tagline"] + p["category"]).lower() for p in data)

    def test_limit(self, s):
        r = s.get(f"{API}/products", params={"limit": 3}, timeout=30)
        assert r.status_code == 200
        assert len(r.json()) == 3

    def test_product_detail_with_related(self, s):
        r = s.get(f"{API}/products/aura-wireless-charger", timeout=30)
        assert r.status_code == 200
        p = r.json()
        assert p["slug"] == "aura-wireless-charger"
        assert p["price"] == 1499
        assert p["compare_at_price"] == 1999
        assert len(p["variants"]) == 1
        assert "related_products" in p
        assert 1 <= len(p["related_products"]) <= 4
        assert all(rp["slug"] != p["slug"] for rp in p["related_products"])
        slugs = [rp["slug"] for rp in p["related_products"]]
        assert len(slugs) == len(set(slugs)), "duplicate related products"

    def test_all_products_have_detail_page(self, s):
        for p in s.get(f"{API}/products", timeout=30).json():
            r = s.get(f"{API}/products/{p['slug']}", timeout=30)
            assert r.status_code == 200, p["slug"]
            assert len(r.json()["related_products"]) >= 1, f"no related for {p['slug']}"

    def test_product_404(self, s):
        r = s.get(f"{API}/products/does-not-exist", timeout=30)
        assert r.status_code == 404
        assert "detail" in r.json()


# ----------------------------- Predictive search -----------------------------
class TestSearch:
    def test_search_charger(self, s):
        r = s.get(f"{API}/search", params={"q": "charger"}, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert len(d["products"]) >= 2
        assert isinstance(d["categories"], list)

    def test_search_category_match(self, s):
        r = s.get(f"{API}/search", params={"q": "audio"}, timeout=30)
        d = r.json()
        assert any(c["slug"] == "audio" for c in d["categories"])
        assert len(d["products"]) >= 1

    def test_search_empty_query(self, s):
        r = s.get(f"{API}/search", params={"q": ""}, timeout=30)
        assert r.status_code == 200
        assert r.json() == {"products": [], "categories": []}

    def test_search_no_match(self, s):
        r = s.get(f"{API}/search", params={"q": "zzzqqqxyz"}, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["products"] == [] and d["categories"] == []

    def test_search_max_6(self, s):
        r = s.get(f"{API}/search", params={"q": "e"}, timeout=30)
        assert r.status_code == 200
        assert len(r.json()["products"]) <= 6

    def test_search_regex_special_chars_no_500(self, s):
        # unescaped user input passed straight into $regex
        for bad in ["(", "[", "*", "+", "\\"]:
            r = s.get(f"{API}/search", params={"q": bad}, timeout=30)
            assert r.status_code < 500, f"500 on q={bad!r}: {r.text[:200]}"

    def test_products_search_regex_special_chars_no_500(self, s):
        for bad in ["(", "[", "*"]:
            r = s.get(f"{API}/products", params={"search": bad}, timeout=30)
            assert r.status_code < 500, f"500 on search={bad!r}: {r.text[:200]}"


# ----------------------------- Cart -----------------------------
class TestCart:
    @pytest.fixture(scope="class")
    def prods(self, s):
        return s.get(f"{API}/products", timeout=30).json()

    def test_get_empty_cart(self, s):
        cid = f"TEST_{uuid.uuid4()}"
        r = s.get(f"{API}/cart/{cid}", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d == {"cart_id": cid, "items": [], "subtotal": 0, "count": 0,
                     "currency": "INR", "free_shipping": True}

    def test_add_item_and_persist(self, s, prods):
        cid = f"TEST_{uuid.uuid4()}"
        p = prods[0]
        r = s.post(f"{API}/cart/{cid}/items",
                   json={"product_id": p["id"], "variant": "Charcoal", "quantity": 2}, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["count"] == 2
        assert d["subtotal"] == p["price"] * 2
        it = d["items"][0]
        assert it["product_id"] == p["id"]
        assert it["variant"] == "Charcoal"
        assert it["line_total"] == p["price"] * 2
        assert it["image"] and it["name"] == p["name"]
        # GET to verify persistence
        g = s.get(f"{API}/cart/{cid}", timeout=30).json()
        assert g["count"] == 2 and g["subtotal"] == p["price"] * 2

    def test_same_product_different_variant_separate_lines(self, s, prods):
        cid = f"TEST_{uuid.uuid4()}"
        p = prods[0]
        s.post(f"{API}/cart/{cid}/items", json={"product_id": p["id"], "variant": "Charcoal", "quantity": 1}, timeout=30)
        r = s.post(f"{API}/cart/{cid}/items", json={"product_id": p["id"], "variant": "Beige", "quantity": 1}, timeout=30)
        assert r.status_code == 200
        assert len(r.json()["items"]) == 2

    def test_max_qty_cap(self, s, prods):
        cid = f"TEST_{uuid.uuid4()}"
        p = prods[1]
        r = s.post(f"{API}/cart/{cid}/items", json={"product_id": p["id"], "quantity": 99}, timeout=30)
        assert r.status_code == 200
        assert r.json()["count"] == 5, "initial add should cap at MAX_QTY=5"
        # adding again when already at max -> 400
        r2 = s.post(f"{API}/cart/{cid}/items", json={"product_id": p["id"], "quantity": 1}, timeout=30)
        assert r2.status_code == 400
        assert "5" in r2.json()["detail"]

    def test_add_invalid_quantity(self, s, prods):
        cid = f"TEST_{uuid.uuid4()}"
        r = s.post(f"{API}/cart/{cid}/items", json={"product_id": prods[0]["id"], "quantity": 0}, timeout=30)
        assert r.status_code == 400

    def test_add_unknown_product_404(self, s):
        cid = f"TEST_{uuid.uuid4()}"
        r = s.post(f"{API}/cart/{cid}/items", json={"product_id": "nope", "quantity": 1}, timeout=30)
        assert r.status_code == 404

    def test_update_quantity(self, s, prods):
        cid = f"TEST_{uuid.uuid4()}"
        p = prods[2]
        d = s.post(f"{API}/cart/{cid}/items", json={"product_id": p["id"], "quantity": 1}, timeout=30).json()
        item_id = d["items"][0]["item_id"]
        r = s.put(f"{API}/cart/{cid}/items/{item_id}", json={"quantity": 3}, timeout=30)
        assert r.status_code == 200
        assert r.json()["count"] == 3
        assert s.get(f"{API}/cart/{cid}", timeout=30).json()["subtotal"] == p["price"] * 3
        # cap
        r = s.put(f"{API}/cart/{cid}/items/{item_id}", json={"quantity": 50}, timeout=30)
        assert r.json()["count"] == 5
        # 0 removes
        r = s.put(f"{API}/cart/{cid}/items/{item_id}", json={"quantity": 0}, timeout=30)
        assert r.json()["items"] == []

    def test_update_unknown_item_404(self, s, prods):
        cid = f"TEST_{uuid.uuid4()}"
        s.post(f"{API}/cart/{cid}/items", json={"product_id": prods[0]["id"], "quantity": 1}, timeout=30)
        r = s.put(f"{API}/cart/{cid}/items/{uuid.uuid4()}", json={"quantity": 2}, timeout=30)
        assert r.status_code == 404

    def test_update_unknown_cart_404(self, s):
        r = s.put(f"{API}/cart/TEST_{uuid.uuid4()}/items/{uuid.uuid4()}", json={"quantity": 2}, timeout=30)
        assert r.status_code == 404

    def test_remove_item(self, s, prods):
        cid = f"TEST_{uuid.uuid4()}"
        d = s.post(f"{API}/cart/{cid}/items", json={"product_id": prods[3]["id"], "quantity": 2}, timeout=30).json()
        item_id = d["items"][0]["item_id"]
        r = s.delete(f"{API}/cart/{cid}/items/{item_id}", timeout=30)
        assert r.status_code == 200
        assert r.json()["count"] == 0
        assert s.get(f"{API}/cart/{cid}", timeout=30).json()["items"] == []

    def test_remove_unknown_cart_404(self, s):
        r = s.delete(f"{API}/cart/TEST_{uuid.uuid4()}/items/{uuid.uuid4()}", timeout=30)
        assert r.status_code == 404


# ----------------------------- Newsletter / Contact -----------------------------
class TestForms:
    def test_newsletter_and_idempotency(self, s):
        email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
        r1 = s.post(f"{API}/newsletter", json={"email": email}, timeout=30)
        assert r1.status_code == 200 and r1.json()["ok"] is True
        r2 = s.post(f"{API}/newsletter", json={"email": email}, timeout=30)
        assert r2.status_code == 200 and r2.json()["ok"] is True

    def test_newsletter_invalid_email(self, s):
        r = s.post(f"{API}/newsletter", json={"email": "notanemail"}, timeout=30)
        assert r.status_code == 422

    def test_contact_stores(self, s):
        r = s.post(f"{API}/contact", json={
            "name": "TEST_QA", "email": "TEST_qa@example.com", "message": "hello from qa"
        }, timeout=30)
        assert r.status_code == 200
        assert r.json()["ok"] is True

    def test_contact_missing_fields(self, s):
        r = s.post(f"{API}/contact", json={"name": "TEST_QA"}, timeout=30)
        assert r.status_code == 422

    def test_contact_empty_strings_rejected(self, s):
        """Blank name/message should be rejected (no min_length on model)."""
        r = s.post(f"{API}/contact", json={"name": "", "email": "TEST_qa@example.com", "message": ""}, timeout=30)
        assert r.status_code == 422, "empty name/message accepted — missing min_length validation"


# ----------------------------- Checkout -----------------------------
SHIP = {
    "email": "TEST_buyer@example.com", "full_name": "TEST Buyer", "phone": "9876543210",
    "address1": "12 QA Lane", "address2": "", "city": "Mumbai", "state": "Maharashtra",
    "pincode": "400001",
}


class TestCheckout:
    def test_checkout_empty_cart_400(self, s):
        r = s.post(f"{API}/checkout", json={"cart_id": f"TEST_{uuid.uuid4()}", **SHIP}, timeout=30)
        assert r.status_code == 400
        assert "empty" in r.json()["detail"].lower()

    def test_checkout_success_clears_cart(self, s):
        prods = s.get(f"{API}/products", timeout=30).json()
        cid = f"TEST_{uuid.uuid4()}"
        p = prods[0]
        add = s.post(f"{API}/cart/{cid}/items", json={"product_id": p["id"], "quantity": 2}, timeout=30).json()
        subtotal = add["subtotal"]

        r = s.post(f"{API}/checkout", json={"cart_id": cid, **SHIP}, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["ok"] is True
        assert d["order_no"].startswith("GZ") and len(d["order_no"]) == 14
        o = d["order"]
        assert "_id" not in o
        assert o["status"] == "pending_payment"
        assert o["currency"] == "INR"
        assert o["subtotal"] == subtotal and o["total"] == subtotal
        assert len(o["items"]) == 1 and o["items"][0]["quantity"] == 2
        assert o["shipping"]["pincode"] == "400001"
        assert o["email"] == SHIP["email"]

        # cart cleared
        cart = s.get(f"{API}/cart/{cid}", timeout=30).json()
        assert cart["items"] == [] and cart["count"] == 0 and cart["subtotal"] == 0

    def test_checkout_invalid_payload_422(self, s):
        r = s.post(f"{API}/checkout", json={"cart_id": "x", "email": "bad"}, timeout=30)
        assert r.status_code == 422

    def test_order_lookup_endpoint_exists(self, s):
        """Confirmation page /order/{orderNo} relies on router state only.
        A GET order endpoint is needed for refresh/direct-link support."""
        prods = s.get(f"{API}/products", timeout=30).json()
        cid = f"TEST_{uuid.uuid4()}"
        s.post(f"{API}/cart/{cid}/items", json={"product_id": prods[0]["id"], "quantity": 1}, timeout=30)
        order_no = s.post(f"{API}/checkout", json={"cart_id": cid, **SHIP}, timeout=30).json()["order_no"]
        r = s.get(f"{API}/orders/{order_no}", timeout=30)
        assert r.status_code == 200, "no GET /api/orders/{order_no} — confirmation page breaks on refresh"


# ----------------------------- Assets -----------------------------
class TestAssets:
    def test_all_product_images_reachable(self, s):
        broken = []
        prods = s.get(f"{API}/products", timeout=30).json()
        for p in prods:
            for url in p["images"]:
                try:
                    r = requests.get(url, timeout=20, stream=True)
                    if r.status_code != 200:
                        broken.append((p["slug"], url, r.status_code))
                except Exception as e:
                    broken.append((p["slug"], url, str(e)))
        assert not broken, f"broken product images: {broken}"

    def test_all_category_images_reachable(self, s):
        broken = []
        for c in s.get(f"{API}/categories", timeout=30).json():
            r = requests.get(c["image"], timeout=20, stream=True)
            if r.status_code != 200:
                broken.append((c["slug"], c["image"], r.status_code))
        assert not broken, f"broken category images: {broken}"


# ----------------------------- Cleanup -----------------------------
def test_zz_cleanup():
    """Remove TEST_ data created by this run."""
    try:
        from pymongo import MongoClient
        be = dotenv_values("/app/backend/.env")
        mc = MongoClient(be["MONGO_URL"])
        dbx = mc[be["DB_NAME"]]
        dbx.carts.delete_many({"cart_id": {"$regex": "^TEST_"}})
        dbx.orders.delete_many({"full_name": "TEST Buyer"})
        dbx.contact_messages.delete_many({"name": "TEST_QA"})
        dbx.newsletter.delete_many({"email": {"$regex": "^TEST_"}})
        mc.close()
    except Exception as e:
        pytest.skip(f"cleanup skipped: {e}")
