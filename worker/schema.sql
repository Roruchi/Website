CREATE TABLE IF NOT EXISTS counters (
  type TEXT NOT NULL,
  item_key TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (type, item_key)
);

CREATE TABLE IF NOT EXISTS interactions (
  type TEXT NOT NULL,
  item_key TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  period TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (type, item_key, visitor_hash, period)
);

CREATE TRIGGER IF NOT EXISTS increment_counter_after_interaction
AFTER INSERT ON interactions
BEGIN
  INSERT INTO counters (type, item_key, count)
  VALUES (NEW.type, NEW.item_key, 1)
  ON CONFLICT(type, item_key)
  DO UPDATE SET count = count + 1;
END;
