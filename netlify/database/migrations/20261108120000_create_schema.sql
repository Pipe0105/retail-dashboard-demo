-- Retail dashboard demo: schema
-- Fictional grocery chain "Lumen Market". All data is synthetic.

CREATE TABLE stores (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  city        TEXT NOT NULL,
  region      TEXT NOT NULL,
  size_factor NUMERIC(4,2) NOT NULL, -- relative store size, drives demand
  cost_factor NUMERIC(4,3) NOT NULL  -- local freight/shrink, makes margins differ by store
);

CREATE TABLE categories (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  sku         TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  unit_cost   NUMERIC(10,2) NOT NULL,
  unit_price  NUMERIC(10,2) NOT NULL,
  base_demand NUMERIC(6,2) NOT NULL  -- avg units/day in a size-1.0 store
);

-- One row per store, product and day (pre-aggregated, as a POS export would be)
CREATE TABLE daily_sales (
  sale_date  DATE NOT NULL,
  store_id   INTEGER NOT NULL REFERENCES stores(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  units      INTEGER NOT NULL,
  revenue    NUMERIC(12,2) NOT NULL,
  cost       NUMERIC(12,2) NOT NULL,
  PRIMARY KEY (sale_date, store_id, product_id)
);
CREATE INDEX daily_sales_store_date_idx ON daily_sales (store_id, sale_date);

-- Number of tickets (customer transactions) per store and day
CREATE TABLE store_daily_tickets (
  sale_date DATE NOT NULL,
  store_id  INTEGER NOT NULL REFERENCES stores(id),
  tickets   INTEGER NOT NULL,
  PRIMARY KEY (sale_date, store_id)
);

CREATE TABLE inventory (
  store_id      INTEGER NOT NULL REFERENCES stores(id),
  product_id    INTEGER NOT NULL REFERENCES products(id),
  on_hand       INTEGER NOT NULL,
  reorder_point INTEGER NOT NULL,
  PRIMARY KEY (store_id, product_id)
);

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'store_manager')),
  store_id      INTEGER REFERENCES stores(id),
  password_hash TEXT NOT NULL,
  CHECK (role = 'admin' OR store_id IS NOT NULL)
);
