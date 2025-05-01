import sqlite3
import os
db_path = os.path.join("instance", "mydatabase.db")
# Kết nối đến file mydatabase.db trong thư mục dự án
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Tạo bảng transactions nếu chưa tồn tại
cursor.execute("""
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    amount INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
)
""")

# Lưu và đóng kết nối
conn.commit()
conn.close()

print("Đã tạo bảng transactions thành công.")
