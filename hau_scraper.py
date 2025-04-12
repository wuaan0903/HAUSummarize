import requests
from bs4 import BeautifulSoup

url = "https://hau.edu.vn/Truong-Dai-hoc-Kien-truc-Ha-Noi-cong-bo-Quyet-dinh-cong-nhan-va-trao-giay-chung-nhan-kiem-dinh-chat-luong-04-chuong-trinh-dao-tao-trinh-do-dai-hoc_n4204.html"
response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")

# Trích xuất thông tin theo cấu trúc mới
title = soup.select_one("article.thumbnail-news-view > h1")
date = soup.select_one("div.block_timer")
content = soup.select_one("div.post_content")

# Xử lý dữ liệu
article_data = {
    "title": title.text.strip() if title else "",
    "date": date.text.strip() if date else "",
    "content": content.get_text(separator="\n", strip=True) if content else ""
}

# In kết quả
for key, value in article_data.items():
    print(f"{key.upper()}:\n{value}\n{'='*80}")
