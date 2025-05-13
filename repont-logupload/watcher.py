import os
import json
import time
import shutil
import mysql.connector
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from config import DB_CONFIG

# Konfigurációk
WATCH_FOLDER = "/var/www/repont-client/repont-logupload/update/temp"
PRODUCTS_FOLDER = "/var/www/repont-client/repont-logupload/update/products"
RECYCLING_FOLDER = "/var/www/repont-client/repont-logupload/update/recycling"

EXPECTED_PRODUCTS_KEYS = {"type_number", "product_name"}
EXPECTED_RECYCLING_KEYS = {
    "machine_id", "product", "event_type", "event_date", "created_at", "updated_at"
}

def generate_filename(target_dir: str) -> str:
    count = len([f for f in os.listdir(target_dir) if f.endswith(".log")]) + 1
    timestamp = datetime.now().strftime("%Y%m%dT%H%M%S")
    return f"{count:04d}_{timestamp}.log"

def insert_products(data):
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    for item in data:
        cursor.execute(
            "INSERT INTO products (type_number, product_name) VALUES (%s, %s)",
            (item["type_number"], item["product_name"])
        )
    conn.commit()
    conn.close()

def insert_recycling(data):
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    for item in data:
        cursor.execute(
            "INSERT INTO recycling (machine_id, product, event_type, event_date, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s)",
            (
                item["machine_id"],
                item["product"],
                item["event_type"],
                item["event_date"],
                item["created_at"],
                item["updated_at"]
            )
        )
    conn.commit()
    conn.close()

class LogHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith(".log"):
            print(f"Új fájl: {event.src_path}")
            try:
                with open(event.src_path, 'r') as file:
                    content = json.load(file)

                if not isinstance(content, list):
                    raise ValueError("A JSON nem tömb.")

                keys = set(content[0].keys())

                if keys == EXPECTED_PRODUCTS_KEYS:
                    insert_products(content)
                    dest_folder = PRODUCTS_FOLDER
                elif keys == EXPECTED_RECYCLING_KEYS:
                    insert_recycling(content)
                    dest_folder = RECYCLING_FOLDER
                else:
                    print("Hibás JSON struktúra, kihagyva:", event.src_path)
                    return

                filename = generate_filename(dest_folder)
                shutil.move(event.src_path, os.path.join(dest_folder, filename))
                print("Feldolgozva és áthelyezve:", filename)

            except Exception as e:
                print(f"Hiba a fájl feldolgozása közben: {event.src_path} – {e}")

# Figyelő elindítása
if __name__ == "__main__":
    event_handler = LogHandler()
    observer = Observer()
    observer.schedule(event_handler, path=WATCH_FOLDER, recursive=False)
    observer.start()
    print("Watcher elindult...")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
