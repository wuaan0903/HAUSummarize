import requests
from bs4 import BeautifulSoup
import json
import time

BASE_URL = "https://hau.edu.vn"
START_PAGE = 1
END_PAGE = 10  # Đổi số trang nếu muốn crawl nhiều hơn

output = []

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

def get_article_links(page_num):
    url = f"{BASE_URL}/tin-tuc_c01/?page={page_num}" if page_num > 1 else f"{BASE_URL}/tin-tuc_c01/"
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, 'html.parser')
    links = []
    for a in soup.select('div.caption a'):
        href = a.get('href')
        full_url = BASE_URL + href
        if full_url not in links:
            links.append(full_url)
    return links

def get_article_content(article_url):
    try:
        res = requests.get(article_url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.text, "html.parser")

        # Trích xuất thông tin theo cấu trúc mới
        content = soup.select_one("div.post_content")


        return {"text": content.get_text(separator="\n", strip=True) if content else ""} if content else None

    except Exception as e:
        print(f"Lỗi khi lấy bài viết {article_url}: {e}")
        return None


def crawl_articles():
    for page in range(START_PAGE, END_PAGE + 1):
        print(f"Đang crawl trang {page}...")
        article_links = get_article_links(page)
        print(f"  → Tìm thấy {len(article_links)} bài viết trên trang {page}")
        for link in article_links:
            # print(f"  → {link}")
            text = get_article_content(link)
            if text:
                output.append( text)
            time.sleep(1)  # tránh bị block IP

    with open("data_testing/input_articles.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=4)

    print(f"✅ Đã lưu {len(output)} bài viết vào file input_articles1.json")

if __name__ == "__main__":
    crawl_articles()

