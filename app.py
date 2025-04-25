import re
from flask import Flask, request, jsonify
from transformers import T5ForConditionalGeneration, T5Tokenizer
import torch
from flask_cors import CORS
from bs4 import BeautifulSoup
import requests
from urllib.parse import urlparse
from datetime import timedelta
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
import os

MODEL_DIR = "wuaan0903/HAUSummarize"

app = Flask(__name__)
CORS(app)

# Cấu hình
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mydatabase.db'
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
jwt = JWTManager(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    coin = db.Column(db.Integer, default=500)

class History(db.Model):
    __tablename__ = 'history'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    summary = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, nullable=True, onupdate=db.func.current_timestamp())
    user = db.relationship('User', backref='histories')

    def __repr__(self):
        return f'<History id={self.id} user_id={self.user_id}>'

with app.app_context():
    db.create_all()

# Load model và tokenizer
print("[INFO] Đang tải mô hình và tokenizer...")
tokenizer = T5Tokenizer.from_pretrained(MODEL_DIR)
model = T5ForConditionalGeneration.from_pretrained(MODEL_DIR)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
print(f"[INFO] Đã load model trên thiết bị: {device}")

# Hàm tóm tắt
def summarize(text, user_id=None, max_input_length=1024, summary_type='main'):
    print("[INFO] Đang kiểm tra độ dài đầu vào...")
    input_tokens = tokenizer.encode(text, truncation=False)
    if len(input_tokens) > max_input_length:
        if not user_id:
            print("[WARNING] Không có user_id để kiểm tra coin!")
            return None, "Cần đăng nhập để tóm tắt văn bản dài"
        user = User.query.get(user_id)
        if not user or user.coin < 1:
            print("[WARNING] Không đủ coin để tóm tắt!")
            return None, "Không đủ coin để tóm tắt văn bản dài"
        user.coin -= 1
        db.session.commit()
        print(f"[INFO] Đã trừ 1 coin, coin còn lại: {user.coin}")

    # Cấu hình tham số tóm tắt dựa trên summary_type
    if summary_type == 'short':  # Tóm tắt vắn tắt
        max_output_length = 100
        num_beams = 3
    elif summary_type == 'detailed':  # Tóm tắt chi tiết
        max_output_length = 500
        num_beams = 7
    else:  # Tóm tắt ý chính (mặc định)
        max_output_length = 300
        num_beams = 5

    input_ids = tokenizer.encode(
        text,
        return_tensors="pt",
        max_length=max_input_length,
        truncation=True
    ).to(device)

    print("[INFO] Đang sinh tóm tắt...")
    output_ids = model.generate(
        input_ids=input_ids,
         # min_length=150,    
        max_length=max_output_length,
        num_beams=5,
        early_stopping=True,
        do_sample=True,
        top_k=50,
        top_p=0.95,
        num_return_sequences=1
    )

    print("[INFO] Đang giải mã kết quả...")
    summary = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    print(f"[INFO] Chiều dài đầu vào: {len(input_ids[0])}")
    print(f"[INFO] Số token sinh ra: {len(output_ids[0])}")

    return summary


def split_text_smart(text, max_input_tokens=2024):
    sentences = re.split(r'(?<=[.!?…])\s+', text.strip())
    chunks = []
    current_chunk = ""
    current_tokens = 0

    for sentence in sentences:
        sentence = sentence.strip()
        sentence_tokens = len(tokenizer.encode(sentence, truncation=False))

        # Nếu thêm câu này vượt quá giới hạn -> đẩy current_chunk vào chunks
        if current_tokens + sentence_tokens > max_input_tokens:
            chunks.append(current_chunk.strip())
            current_chunk = sentence
            current_tokens = sentence_tokens
        else:
            current_chunk += " " + sentence
            current_tokens += sentence_tokens

    # Thêm đoạn cuối cùng còn lại
    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    # In ra để kiểm tra
    for i, chunk in enumerate(chunks, 1):
        print(f"\n[SMART DEBUG] Đoạn {i} ({len(tokenizer.encode(chunk))} tokens):\n{chunk}")

    return chunks

def split_text_to_chunks(text, max_tokens_per_chunk=400):
    words = text.split()
    chunks = []
    current_chunk = []
    current_len = 0

    for word in words:
        token_len = len(tokenizer.encode(word, add_special_tokens=False))
        if current_len + token_len > max_tokens_per_chunk:
            chunks.append(" ".join(current_chunk))
            current_chunk = [word]
            current_len = token_len
        else:
            current_chunk.append(word)
            current_len += token_len

    if current_chunk:
        chunks.append(" ".join(current_chunk))
    
    return chunks



def summarize_long_text(text):
    # Ước lượng số token sơ bộ dựa vào số từ
    token_estimate = len(text.split())

    if token_estimate < 600:
        print("[INFO] Văn bản ngắn, không cần chia nhỏ.")
        return summarize(text)  # Tóm tắt trực tiếp nếu văn bản ngắn

    # Nếu dài hơn, chia thành các đoạn nhỏ
    chunks = split_text_smart(text, max_input_tokens=400)
    print(f"[INFO] Tổng số đoạn chia nhỏ: {len(chunks)}")

    all_summaries = []
    for i, chunk in enumerate(chunks):
        print(f"[INFO] Tóm tắt đoạn {i+1}/{len(chunks)}...")
        summary = summarize(chunk)
        all_summaries.append(summary)

    # Gộp lại thành bản tóm tắt cuối cùng
    final_summary = " ".join(all_summaries)
    return final_summary


def summarize_medium_text(text):
    # Ước lượng số token đơn giản theo số từ (bạn có thể thay bằng tokenizer nếu cần chính xác hơn)
    token_estimate = len(text.split())

    if token_estimate < 400:
        print("[INFO] Văn bản ngắn, không cần chia nhỏ.")
        return summarize(text)  # Tóm tắt trực tiếp nếu văn bản ngắn

    # Nếu dài thì chia nhỏ
    chunks = split_text_smart(text, max_input_tokens=600)
    print(f"[INFO] Tổng số đoạn chia nhỏ: {len(chunks)}")

    all_summaries = []
    for i, chunk in enumerate(chunks):
        print(f"[INFO] Tóm tắt đoạn {i+1}/{len(chunks)}...")
        summary = summarize(chunk)
        all_summaries.append(summary)

    # Gộp lại thành bản tóm tắt cuối cùng
    final_summary = " ".join(all_summaries)
    return final_summary




def extract_main_content(url):
    try:
        response = requests.get(url, timeout=10)
        response.encoding = response.apparent_encoding
        soup = BeautifulSoup(response.text, 'html.parser')
        domain = urlparse(url).netloc

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
    user_id = data.get("user_id")
    summary_type = data.get("summary_type", "short")

    if not text.strip():
        return jsonify({'error': 'Văn bản nhập vào trống!'}), 400

    try:
                # Gọi hàm tương ứng theo loại tóm tắt
        if summary_type == "short":
            summary = summarize(text)
        elif summary_type == "medium":
            summary = summarize_medium_text(text)
        elif summary_type == "detailed":
            summary = summarize_long_text(text)
        else:
            return jsonify({'error': 'Loại tóm tắt không hợp lệ.'}), 400
        if user_id is not None:  # Chỉ insert nếu user_id không phải None
            history_entry = History(     
                content=text,
                summary=summary,
                user_id=user_id
            )
            db.session.add(history_entry)
            db.session.commit()

        return jsonify({'summary': summary})
    except Exception as e:
        print("[LỖI]:", str(e))
        return jsonify({'error': 'Đã có lỗi xảy ra trong quá trình tóm tắt.'}), 500

@app.route('/api/summarize-article', methods=['POST'])
def summarize_article():
    data = request.get_json()
    url = data.get("url")
    user_id = data.get("user_id")
    summary_type = data.get("summary_type", "short")

    if not url:
        return jsonify({'error': 'URL is required'}), 400

    content = extract_main_content(url)
    if not content:
        return jsonify({'error': 'Không thể lấy nội dung từ liên kết'}), 500

    
        # Gọi hàm tương ứng theo loại tóm tắt
    if summary_type == "short":
        summary = summarize(content)
    elif summary_type == "medium":
        summary = summarize_medium_text(content)
    elif summary_type == "detailed":
        summary = summarize_long_text(content)
    else:
        return jsonify({'error': 'Loại tóm tắt không hợp lệ.'}), 400
    if user_id is not None and summary is not None:  # Chỉ insert nếu user_id không phải None
            history_entry = History(
                content=content,
                summary=summary,
                user_id=user_id
            )
            db.session.add(history_entry)
            db.session.commit()

    return jsonify({
        'summary': summary,
        'full_text': content
    })

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'Vui lòng điền đầy đủ thông tin'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Tên tài khoản đã tồn tại'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email đã được sử dụng'}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, email=email, password=hashed_password, coin=500)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Đăng ký thành công'})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Sai tài khoản hoặc mật khẩu'}), 401

    token = create_access_token(identity=user.id)
    return jsonify({
        'access_token': token,
        'userId': user.id,
        'username': user.username,
        'coin': user.coin
    })

@app.route('/history', methods=['GET'])
def get_history():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'Thiếu user_id'}), 400

    histories = History.query.filter_by(user_id=user_id).order_by(History.created_at.desc()).all()
    result = [{
        'id': h.id,
        'content': h.content,
        'summary': h.summary,
        'created_at': h.created_at.isoformat()
    } for h in histories]

    return jsonify(result), 200

@app.route('/history/<int:history_id>', methods=['DELETE'])
def delete_history(history_id):
    history = History.query.get(history_id)
    if not history:
        return jsonify({'error': 'Lịch sử không tồn tại'}), 404

    db.session.delete(history)
    db.session.commit()
    return jsonify({'message': 'Xoá thành công'}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)