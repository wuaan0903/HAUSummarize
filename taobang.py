import sqlite3
import os
db_path = os.path.join("instance", "mydatabase.db")
# Kết nối đến file mydatabase.db trong thư mục dự án
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Thêm cột 'type' nếu chưa có
try:
    cursor.execute("ALTER TABLE history ADD COLUMN type TEXT")
except sqlite3.OperationalError:
    print("Cột 'type' đã tồn tại.")

# Thêm cột 'input' nếu chưa có
try:
    cursor.execute("ALTER TABLE history ADD COLUMN input TEXT")
except sqlite3.OperationalError:
    print("Cột 'input' đã tồn tại.")

conn.commit()
conn.close()