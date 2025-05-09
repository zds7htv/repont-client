#!/bin/bash

# === Beállítások ===
LOG_DIR="./benchmark_logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/api_benchmark_$TIMESTAMP.log"
N=20

URLS=(
  # Lokális
  "http://localhost/api/events?from=2025-01-01T00:00:00&to=2025-12-31T23:59:59&machine_id=all&product_id=1&limit=100"
  "http://localhost/api/events?from=2025-01-01T00:00:00&to=2025-12-31T23:59:59&machine_id=all&product_id=1&limit=120000"
  "http://localhost/api/events?from=2025-01-01T00:00:00&to=2025-12-31T23:59:59&machine_id=all&product_id=1"

  # Domain
  "https://repont.danvir.hu/api/events?from=2025-01-01T00:00:00&to=2025-12-31T23:59:59&machine_id=all&product_id=1&limit=100"
  "https://repont.danvir.hu/api/events?from=2025-01-01T00:00:00&to=2025-12-31T23:59:59&machine_id=all&product_id=1&limit=120000"
  "https://repont.danvir.hu/api/events?from=2025-01-01T00:00:00&to=2025-12-31T23:59:59&machine_id=all&product_id=1"
)

# === Előkészítés ===
mkdir -p "$LOG_DIR"
echo "=== API benchmark — $(date) ===" > "$LOG_FILE"
echo "Lekérdezésenként $N ismétlés" >> "$LOG_FILE"
echo >> "$LOG_FILE"

# === Tesztelés ===
for url in "${URLS[@]}"; do
  echo "Teszt URL: $url" >> "$LOG_FILE"
  for i in $(seq 1 "$N"); do
    time=$(curl -o /dev/null -s -w "%{time_total}\n" "$url")
    echo "$time" >> "$LOG_FILE"
  done
  echo >> "$LOG_FILE"
done

echo "Teszt befejezve. Log: $LOG_FILE"
