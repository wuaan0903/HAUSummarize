from flask import Flask, request, jsonify
from transformers import T5ForConditionalGeneration, T5Tokenizer
import torch
from flask_cors import CORS
from bs4 import BeautifulSoup
import requests
from urllib.parse import urlparse
MODEL_DIR = "wuaan0903/HAUSummarize"

# Khởi tạo Flask app
app = Flask(__name__)
CORS(app)  # Cho phép React truy cập API này

# Load model và tokenizer
print("[INFO] Đang tải mô hình và tokenizer...")
tokenizer = T5Tokenizer.from_pretrained(MODEL_DIR)
model = T5ForConditionalGeneration.from_pretrained(MODEL_DIR)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
print(f"[INFO] Đã load model trên thiết bị: {device}")

# Hàm tóm tắt
def summarize(text, max_input_length=1024, max_output_length=300):
    print("[INFO] Đang kiểm tra độ dài đầu vào...")

    # Tokenize tạm để đếm số token của input
    input_tokens = tokenizer.encode(text, truncation=False)
    if len(input_tokens) > max_input_length:
        print(f"[WARNING] Đầu vào vượt quá {max_input_length} token! Không thực hiện tóm tắt.")
        return None
    print("[INFO] Đang mã hóa đầu vào...")
    input_ids = tokenizer.encode(
        text,
        return_tensors="pt",
        max_length=max_input_length,
        truncation=True
    ).to(device)

    print("[INFO] Đang sinh tóm tắt...")
    output_ids = model.generate(
        input_ids=input_ids,
        
        max_length=max_output_length,
        num_beams=5,
        early_stopping=True
    )

    print("[INFO] Đang giải mã kết quả...")
    summary = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    print(f"[INFO] Chiều dài đầu vào: {len(input_ids[0])}")
    print(f"[INFO] Số token sinh ra: {len(output_ids[0])}")

    return summary


def extract_main_content(url):
    try:
        response = requests.get(url, timeout=10)
        response.encoding = response.apparent_encoding
        soup = BeautifulSoup(response.text, 'html.parser')

        # Lấy domain từ URL
        domain = urlparse(url).netloc

        # Chọn selector phù hợp theo domain
        if "fit-hau.edu.vn" in domain:
            article = soup.select_one("div.post--content")
        elif "hau.edu.vn" in domain:
            article = soup.select_one("div.post_content")
        else:
            article = None

        if not article:
            return None

        text = article.get_text(separator="\n", strip=True)
        return text

    except Exception as e:
        print(f"Error: {e}")
        return None

# Route API
@app.route('/api/summarize', methods=['POST'])
def api_summarize():
    data = request.get_json()
    text = data.get('text', '')
    if not text.strip():
        return jsonify({'error': 'Văn bản nhập vào trống!'}), 400

    try:
        summary = summarize(text)
        return jsonify({'summary': summary})
    except Exception as e:
        print("[LỖI]:", str(e))
        return jsonify({'error': 'Đã có lỗi xảy ra trong quá trình tóm tắt.'}), 500

@app.route("/api/summarize-article", methods=["POST"])
def summarize_article():
    data = request.get_json()
    url = data.get("url")

    if not url:
        return jsonify({"error": "URL is required"}), 400

    content = extract_main_content(url)

    if not content:
        return jsonify({"error": "Không thể lấy nội dung từ liên kết"}), 500

    summary = summarize(content)

    return jsonify({
        "summary": summary,
        "full_text": content
    })
if __name__ == '__main__':
    app.run(debug=True, port=5000)



