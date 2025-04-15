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
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Thêm dòng này để tránh warning

db = SQLAlchemy(app)
jwt = JWTManager(app)



class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)  # <-- thêm dòng này
    password = db.Column(db.String(200), nullable=False)


class History(db.Model):
    __tablename__ = 'history'  # Đặt tên bảng rõ ràng
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)  # Nội dung gốc
    summary = db.Column(db.Text, nullable=False)  # Tóm tắt nội dung
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)  # Liên kết với bảng User
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())  # Thời gian tạo
    updated_at = db.Column(db.DateTime, nullable=True, onupdate=db.func.current_timestamp())  # Thời gian cập nhật

    # Quan hệ với bảng User
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
    user_id = data.get("user_id")

    if not text.strip():
        return jsonify({'error': 'Văn bản nhập vào trống!'}), 400

    try:
        summary = summarize(text)
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

@app.route("/api/summarize-article", methods=["POST"])
def summarize_article():
    data = request.get_json()
    url = data.get("url")
    user_id = data.get("user_id")

    if not url:
        return jsonify({"error": "URL is required"}), 400

    content = extract_main_content(url)

    if not content:
        return jsonify({"error": "Không thể lấy nội dung từ liên kết"}), 500

    summary = summarize(content)
    if user_id is not None and summary is not None:  # Chỉ insert nếu user_id không phải None
            history_entry = History(
                content=content,
                summary=summary,
                user_id=user_id
            )
            db.session.add(history_entry)
            db.session.commit()

    return jsonify({
        "summary": summary,
        "full_text": content
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
    new_user = User(username=username, email=email, password=hashed_password)

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
        'username': user.username
    })   


@app.route('/history', methods=['GET'])
def get_history():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Thiếu user_id"}), 400

    histories = History.query.filter_by(user_id=user_id).order_by(History.created_at.desc()).all()
    result = [{
        "id": h.id,
        "content": h.content,
        "summary": h.summary,
        "created_at": h.created_at.isoformat()
    } for h in histories]

    return jsonify(result), 200  



@app.route('/history/<int:history_id>', methods=['DELETE'])
def delete_history(history_id):
    history = History.query.get(history_id)
    if not history:
        return jsonify({"error": "Lịch sử không tồn tại"}), 404

    db.session.delete(history)
    db.session.commit()
    return jsonify({"message": "Xoá thành công"}), 200
    
if __name__ == '__main__':
    with app.app_context():     
        db.create_all()          
    app.run(debug=True)
