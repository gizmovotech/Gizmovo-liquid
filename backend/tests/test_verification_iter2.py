"""Iteration-2 verification tests: out-of-stock, order deep link, search hardening, upsell source."""
import os
import uuid

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL is missing")
BASE_URL = base_url.rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="module")
def trek(s):
    r = s.get(f"{API}/products/trek-air-pump", timeout=30)
    assert r.status_code == 200, r.text
    return r.json()


# ---------------- Out of stock ----------------
class TestOutOfStock:
    def test_trek_air_pump_unavailable(self, trek):
        assert trek["available"] is False
        assert trek["slug"] == "trek-air-pump"

    def test_only_trek_is_unavailable(self, s):
        prods = s.get(f"{API}/products", timeout=30).json()
        unavailable = [p["slug"] for p in prods if p.get("available") is False]
        assert unavailable == ["trek-air-pump"], unavailable

    def test_add_out_of_stock_returns_400(self, s, trek):
        cart_id = f"TEST_oos_{uuid.uuid4().hex[:8]}"
        r = s.post(f"{API}/cart/{cart_id}/items", json={"product_id": trek["id"], "quantity": 1}, timeout=30)
        assert r.status_code == 400, f"{r.status_code} {r.text}"
        assert "stock" in r.json().get("detail", "").lower()
        # cart must stay empty
        cart = s.get(f"{API}/cart/{cart_id}", timeout=30).json()
        assert cart["items"] == []
        assert cart["count"] == 0

    def test_out_of_stock_not_in_best_sellers(self, s):
        best = s.get(f"{API}/products", params={"best_seller": "true"}, timeout=30).json()
        assert all(p.get("available") is not False for p in best)


# ---------------- Search hardening ----------------
@pytest.mark.parametrize("term", ["(", "[", "*", "+", "\\", "?", "a)b", "^$", "earbuds"])
def test_search_metacharacters_no_500(s, term):
    r = s.get(f"{API}/search", params={"q": term}, timeout=30)
    assert r.status_code == 200, f"{term!r} -> {r.status_code} {r.text[:200]}"
    body = r.json()
    assert isinstance(body["products"], list)
    assert isinstance(body["categories"], list)


def test_search_earbuds_returns_results(s):
    r = s.get(f"{API}/search", params={"q": "earbuds"}, timeout=30)
    assert r.status_code == 200
    assert len(r.json()["products"]) > 0


@pytest.mark.parametrize("term", ["(", "["])
def test_products_search_metacharacters_no_500(s, term):
    r = s.get(f"{API}/products", params={"search": term}, timeout=30)
    assert r.status_code == 200, r.text
    assert r.json() == []


# ---------------- Categories (nav dropdown source) ----------------
def test_categories_returns_five(s):
    cats = s.get(f"{API}/categories", timeout=30).json()
    assert len(cats) == 5
    slugs = [c["slug"] for c in cats]
    assert slugs == ["desk", "audio", "home", "everyday-carry", "travel"], slugs
    for c in cats:
        prods = s.get(f"{API}/products", params={"category": c["slug"]}, timeout=30).json()
        assert len(prods) > 0, c["slug"]
        assert all(p["category_slug"] == c["slug"] for p in prods)


# ---------------- Checkout + order deep link ----------------
class TestCheckoutAndOrderLookup:
    def test_checkout_then_order_lookup(self, s):
        cart_id = f"TEST_ord_{uuid.uuid4().hex[:8]}"
        prods = s.get(f"{API}/products", timeout=30).json()
        p = next(x for x in prods if x.get("available") is not False)
        r = s.post(f"{API}/cart/{cart_id}/items", json={"product_id": p["id"], "quantity": 2}, timeout=30)
        assert r.status_code == 200, r.text

        payload = {
            "cart_id": cart_id, "email": "TEST_qa2@example.com", "full_name": "TEST QA Two",
            "phone": "9876500000", "address1": "12 Test Lane", "address2": "",
            "city": "Mumbai", "state": "Maharashtra", "pincode": "400001",
        }
        co = s.post(f"{API}/checkout", json=payload, timeout=30)
        assert co.status_code == 200, co.text
        body = co.json()
        order_no = body["order_no"]
        assert order_no.startswith("GZ")
        assert body["order"]["status"] == "pending_payment"
        assert body["order"]["total"] == p["price"] * 2

        # deep link fetch
        g = s.get(f"{API}/orders/{order_no}", timeout=30)
        assert g.status_code == 200, g.text
        order = g.json()
        assert "_id" not in order
        assert order["order_no"] == order_no
        assert order["subtotal"] == p["price"] * 2
        assert order["shipping"]["city"] == "Mumbai"
        assert len(order["items"]) == 1

        # cart cleared
        cart = s.get(f"{API}/cart/{cart_id}", timeout=30).json()
        assert cart["items"] == [] and cart["count"] == 0

    def test_order_lookup_unknown_404(self, s):
        assert s.get(f"{API}/orders/GZDOESNOTEXIST", timeout=30).status_code == 404


# ---------------- Max qty ----------------
def test_max_qty_cap_5(s):
    cart_id = f"TEST_qty_{uuid.uuid4().hex[:8]}"
    prods = s.get(f"{API}/products", timeout=30).json()
    p = next(x for x in prods if x.get("available") is not False)
    r = s.post(f"{API}/cart/{cart_id}/items", json={"product_id": p["id"], "quantity": 99}, timeout=30)
    assert r.status_code == 200
    assert r.json()["items"][0]["quantity"] == 5
    item_id = r.json()["items"][0]["item_id"]
    u = s.put(f"{API}/cart/{cart_id}/items/{item_id}", json={"quantity": 50}, timeout=30)
    assert u.status_code == 200
    assert u.json()["items"][0]["quantity"] == 5
    # adding more when already at 5 -> 400
    r2 = s.post(f"{API}/cart/{cart_id}/items", json={"product_id": p["id"], "quantity": 1}, timeout=30)
    assert r2.status_code == 400


# ---------------- Contact validation ----------------
@pytest.mark.parametrize("payload", [
    {"name": "", "email": "TEST_c@example.com", "message": "hello there"},
    {"name": "QA", "email": "TEST_c@example.com", "message": ""},
    {"name": "Q", "email": "TEST_c@example.com", "message": "a"},
])
def test_contact_rejects_blank(s, payload):
    assert s.post(f"{API}/contact", json=payload, timeout=30).status_code == 422


def test_contact_valid(s):
    r = s.post(f"{API}/contact", json={
        "name": "TEST QA", "email": "TEST_qa2@example.com", "message": "Verification run message."
    }, timeout=30)
    assert r.status_code == 200
    assert r.json()["ok"] is True


# ---------------- Cleanup ----------------
def test_zz_cleanup_iter2():
    from pymongo import MongoClient
    mongo_url = dotenv_values("/app/backend/.env").get("MONGO_URL")
    db_name = dotenv_values("/app/backend/.env").get("DB_NAME")
    if not mongo_url or not db_name:
        pytest.skip("no mongo config")
    c = MongoClient(mongo_url)
    d = c[db_name]
    d.carts.delete_many({"cart_id": {"$regex": "^TEST_"}})
    d.orders.delete_many({"email": {"$regex": "^TEST_"}})
    d.contact_messages.delete_many({"email": {"$regex": "^TEST_"}})
    c.close()
