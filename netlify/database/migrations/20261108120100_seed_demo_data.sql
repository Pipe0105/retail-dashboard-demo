-- Retail dashboard demo: synthetic seed data (deterministic, no real data)

INSERT INTO stores (name, city, region, size_factor, cost_factor) VALUES
  ('Downtown',  'Austin, TX',      'Central', 1.40, 0.980),
  ('Northgate', 'Round Rock, TX',  'North',   1.10, 1.010),
  ('Riverside', 'San Marcos, TX',  'South',   0.85, 1.060),
  ('Westfield', 'Lakeway, TX',     'West',    0.95, 0.995),
  ('Lakeside',  'Georgetown, TX',  'North',   0.75, 1.080),
  ('Hillcrest', 'Kyle, TX',        'South',   1.00, 1.030);

INSERT INTO categories (name) VALUES
  ('Produce'), ('Meat & Poultry'), ('Dairy & Eggs'), ('Bakery'),
  ('Beverages'), ('Pantry'), ('Household'), ('Personal Care');

INSERT INTO products (sku, name, category_id, unit_cost, unit_price, base_demand)
SELECT p.sku, p.name, c.id, p.unit_cost, p.unit_price, p.base_demand
FROM (VALUES
  ('PRD-001','Bananas (lb)',              'Produce',        0.32, 0.69, 95),
  ('PRD-002','Hass Avocados',             'Produce',        0.70, 1.49, 48),
  ('PRD-003','Roma Tomatoes (lb)',        'Produce',        0.85, 1.79, 40),
  ('PRD-004','Baby Spinach 5oz',          'Produce',        1.60, 3.49, 22),
  ('PRD-005','Gala Apples (lb)',          'Produce',        0.90, 1.99, 38),
  ('PRD-006','Yellow Onions 3lb',         'Produce',        1.40, 2.99, 20),
  ('MEA-001','Chicken Breast (lb)',       'Meat & Poultry', 2.60, 4.49, 34),
  ('MEA-002','Ground Beef 80/20 (lb)',    'Meat & Poultry', 3.70, 5.99, 30),
  ('MEA-003','Pork Chops (lb)',           'Meat & Poultry', 2.80, 4.79, 14),
  ('MEA-004','Ribeye Steak (lb)',         'Meat & Poultry', 9.50,14.99,  8),
  ('MEA-005','Turkey Slices 8oz',         'Meat & Poultry', 2.30, 4.29, 16),
  ('MEA-006','Bacon 12oz',                'Meat & Poultry', 3.40, 5.99, 18),
  ('DAI-001','Whole Milk 1gal',           'Dairy & Eggs',   2.40, 3.69, 60),
  ('DAI-002','Large Eggs 12ct',           'Dairy & Eggs',   2.10, 3.49, 52),
  ('DAI-003','Greek Yogurt 32oz',         'Dairy & Eggs',   3.10, 5.49, 18),
  ('DAI-004','Cheddar Block 8oz',         'Dairy & Eggs',   2.20, 3.99, 21),
  ('DAI-005','Unsalted Butter 1lb',       'Dairy & Eggs',   3.00, 4.99, 15),
  ('DAI-006','Oat Milk 64oz',             'Dairy & Eggs',   2.60, 4.79, 12),
  ('BAK-001','Sourdough Loaf',            'Bakery',         1.90, 4.99, 20),
  ('BAK-002','Whole Wheat Bread',         'Bakery',         1.30, 3.29, 28),
  ('BAK-003','Flour Tortillas 10ct',      'Bakery',         1.10, 2.79, 30),
  ('BAK-004','Blueberry Muffins 4ct',     'Bakery',         2.00, 5.49, 10),
  ('BAK-005','Bagels 6ct',                'Bakery',         1.50, 3.99, 12),
  ('BAK-006','Croissants 4ct',            'Bakery',         2.10, 5.99,  9),
  ('BEV-001','Sparkling Water 12pk',      'Beverages',      3.10, 5.99, 24),
  ('BEV-002','Orange Juice 52oz',         'Beverages',      2.50, 4.49, 20),
  ('BEV-003','Cold Brew Coffee 32oz',     'Beverages',      2.90, 5.99, 11),
  ('BEV-004','Cola 12pk',                 'Beverages',      4.10, 7.49, 26),
  ('BEV-005','Bottled Water 24pk',        'Beverages',      2.80, 4.99, 30),
  ('BEV-006','Green Tea 16oz',            'Beverages',      0.90, 2.29, 16),
  ('PAN-001','Long Grain Rice 5lb',       'Pantry',         2.70, 4.99, 17),
  ('PAN-002','Spaghetti 1lb',             'Pantry',         0.60, 1.49, 26),
  ('PAN-003','Black Beans 15oz',          'Pantry',         0.45, 1.09, 33),
  ('PAN-004','Extra Virgin Olive Oil 1L', 'Pantry',         6.20, 9.99,  9),
  ('PAN-005','Peanut Butter 16oz',        'Pantry',         1.70, 3.29, 14),
  ('PAN-006','Ground Coffee 12oz',        'Pantry',         4.60, 8.49, 15),
  ('HOU-001','Paper Towels 6 rolls',      'Household',      5.10, 8.99, 14),
  ('HOU-002','Toilet Paper 12 rolls',     'Household',      6.80,11.99, 16),
  ('HOU-003','Dish Soap 24oz',            'Household',      1.60, 3.49, 10),
  ('HOU-004','Laundry Detergent 92oz',    'Household',      7.40,12.99,  8),
  ('HOU-005','Trash Bags 40ct',           'Household',      4.20, 7.99,  9),
  ('HOU-006','All-Purpose Cleaner',       'Household',      1.90, 3.99,  7),
  ('PER-001','Toothpaste 4oz',            'Personal Care',  1.40, 3.49, 11),
  ('PER-002','Shampoo 12oz',              'Personal Care',  2.90, 6.49,  7),
  ('PER-003','Body Wash 18oz',            'Personal Care',  2.70, 5.99,  8),
  ('PER-004','Deodorant',                 'Personal Care',  2.30, 4.99,  8),
  ('PER-005','Hand Soap 7.5oz',           'Personal Care',  1.00, 2.49, 10),
  ('PER-006','Sunscreen SPF 50',          'Personal Care',  5.60,10.99,  5)
) AS p(sku, name, category, unit_cost, unit_price, base_demand)
JOIN categories c ON c.name = p.category;

-- Landed cost includes freight and shrink (~30% over list cost)
UPDATE products SET unit_cost = ROUND(unit_cost * 1.3, 2);

-- Daily sales, 2026-05-01 .. 2026-10-31.
-- Demand = base demand x store size x weekday pattern x slow growth trend
--          x seasonality (beverages & sunscreen peak in summer) x noise, with occasional promos.
INSERT INTO daily_sales (sale_date, store_id, product_id, units, revenue, cost)
SELECT
  x.d, x.store_id, x.product_id, x.units,
  ROUND(x.units * x.unit_price * CASE WHEN x.promo THEN 0.85 ELSE 1 END, 2),
  ROUND(x.units * x.unit_cost * x.cost_factor, 2)
FROM (
  SELECT
    d::date AS d, s.id AS store_id, p.id AS product_id, p.unit_price, p.unit_cost, s.cost_factor,
    (abs(hashtext(d::text || s.id || '-' || p.id || 'promo')) % 1000) < 25 AS promo,
    GREATEST(0, ROUND(
      p.base_demand * s.size_factor
      * CASE EXTRACT(ISODOW FROM d)
          WHEN 5 THEN 1.12 WHEN 6 THEN 1.35 WHEN 7 THEN 1.18
          WHEN 1 THEN 0.88 ELSE 0.94 END
      * (1 + 0.0009 * (d::date - DATE '2026-05-01'))
      * CASE
          WHEN c.name = 'Beverages' AND EXTRACT(MONTH FROM d) IN (6,7,8) THEN 1.30
          WHEN p.sku = 'PER-006' AND EXTRACT(MONTH FROM d) IN (6,7,8) THEN 2.20
          WHEN p.sku = 'PER-006' AND EXTRACT(MONTH FROM d) = 10 THEN 0.55
          ELSE 1 END
      * (0.72 + 0.56 * (abs(hashtext(d::text || '-' || s.id || '-' || p.id)) % 10000) / 10000.0)
      * CASE WHEN (abs(hashtext(d::text || s.id || '-' || p.id || 'promo')) % 1000) < 25 THEN 1.9 ELSE 1 END
    ))::int AS units
  FROM generate_series(DATE '2026-05-01', DATE '2026-10-31', INTERVAL '1 day') AS d
  CROSS JOIN stores s
  CROSS JOIN products p
  JOIN categories c ON c.id = p.category_id
) x;

-- Tickets: total units / items-per-basket (about 6.5 to 8.5)
INSERT INTO store_daily_tickets (sale_date, store_id, tickets)
SELECT sale_date, store_id,
       ROUND(SUM(units) / (6.5 + 2.0 * (abs(hashtext(sale_date::text || store_id || 'basket')) % 1000) / 1000.0))::int
FROM daily_sales
GROUP BY sale_date, store_id;

-- Inventory snapshot: on hand = average daily sales x days of cover (0.5 to 21 days).
INSERT INTO inventory (store_id, product_id, on_hand, reorder_point)
SELECT
  s.id, p.id,
  ROUND(p.base_demand * s.size_factor
        * (0.5 + 20.5 * POWER((abs(hashtext(s.id || '-' || p.id || 'stock')) % 1000) / 1000.0, 0.8)))::int,
  CEIL(p.base_demand * s.size_factor * 4)::int
FROM stores s CROSS JOIN products p;

-- Demo users. Password for both: demo1234 (bcrypt)
INSERT INTO users (email, full_name, role, store_id, password_hash) VALUES
  ('admin@lumenmarket.demo',   'Alex Morgan', 'admin',         NULL,
   '$2b$10$Ru5J/KhcS1HT2hLMIb9YtOcIaI8ErIE6i8keT8ZfOwIZuKUVLcP3.'),
  ('manager@lumenmarket.demo', 'Sam Rivera',  'store_manager', (SELECT id FROM stores WHERE name = 'Downtown'),
   '$2b$10$Ru5J/KhcS1HT2hLMIb9YtOcIaI8ErIE6i8keT8ZfOwIZuKUVLcP3.');
