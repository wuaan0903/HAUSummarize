import re
from flask import Flask, request, jsonify
from sqlalchemy import func
from transformers import T5ForConditionalGeneration, T5Tokenizer
import torch
from flask_cors import CORS
from bs4 import BeautifulSoup
import requests
from urllib.parse import urlparse
from datetime import date, datetime, timedelta
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
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
    
class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(20), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

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
def summarize(text, max_input_length=2024, max_output_length=300):
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
    # min_length=128,
    max_length=512,           # cho phép dài hơn
    num_beams=5,
    early_stopping=True,
    repetition_penalty=2.0,
    no_repeat_ngram_size=3
)


    print("[INFO] Đang giải mã kết quả...")
    summary = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    print(f"[INFO] Chiều dài đầu vào: {len(input_ids[0])}")
    print(f"[INFO] Số token sinh ra: {len(output_ids[0])}")

    return summary

# Hàm tóm tắt cải tiến
def summarize_v2(text, max_input_length=2024, max_output_length=512, mode="structured"):
    print("[INFO] Đang kiểm tra độ dài đầu vào...")

    # Thêm chỉ dẫn tùy theo mode
    if mode == "structured":
        instruction = (
            "Tóm tắt văn bản dưới dạng danh sách các ý chính, có tiêu đề ngắn gọn, trình bày rõ ràng:\n"
        )
        full_text = instruction + text
    else:
        full_text = text

    # Tokenize tạm để đếm số token
    input_tokens = tokenizer.encode(full_text, truncation=False)
    if len(input_tokens) > max_input_length:
        print(f"[WARNING] Đầu vào vượt quá {max_input_length} token! Không thực hiện tóm tắt.")
        return None

    print("[INFO] Đang mã hóa đầu vào...")
    input_ids = tokenizer.encode(
        full_text,
        return_tensors="pt",
        max_length=max_input_length,
        truncation=True
    ).to(device)

    print("[INFO] Đang sinh tóm tắt...")
    output_ids = model.generate(
        input_ids=input_ids,
        max_length=max_output_length,
        num_beams=5,
        early_stopping=True,
        repetition_penalty=2.0,
        no_repeat_ngram_size=3,
        length_penalty=1.0,    # giúp câu dài vừa đủ, không cụt lủn
        temperature=1.0,       # độ sáng tạo vừa phải
        top_p=0.9              # lấy những token xác suất cao nhất
    )

    print("[INFO] Đang giải mã kết quả...")
    summary = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    print(f"[INFO] Chiều dài đầu vào: {len(input_ids[0])}")
    print(f"[INFO] Số token sinh ra: {len(output_ids[0])}")

    return summary


def split_text_smart(text, max_input_tokens=2024, n_chunks=None):
    sentences = re.split(r'(?<=[.!?…])\s+', text.strip())
    all_tokens = [tokenizer.encode(sentence, truncation=False) for sentence in sentences]
    total_tokens = sum(len(tokens) for tokens in all_tokens)

    # Nếu chưa truyền n_chunks, tự tính theo max_input_tokens
    if n_chunks is None:
        n_chunks = (total_tokens // max_input_tokens) + 1

    avg_tokens = total_tokens / n_chunks  # Trung bình tokens mỗi đoạn

    chunks = []
    current_chunk = ""
    current_tokens = 0

    for sentence, tokens in zip(sentences, all_tokens):
        sentence_token_len = len(tokens)
        if current_tokens + sentence_token_len > avg_tokens and len(chunks) < n_chunks - 1:
            # Nếu đã đủ gần avg_tokens và chưa đủ số lượng đoạn
            chunks.append(current_chunk.strip())
            current_chunk = sentence
            current_tokens = sentence_token_len
        else:
            current_chunk += " " + sentence
            current_tokens += sentence_token_len

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    # Nếu số lượng đoạn chưa đủ do câu quá dài => merge đoạn cuối
    while len(chunks) > n_chunks:
        chunks[-2] += ' ' + chunks[-1]
        chunks.pop()

    # Debug in ra
    for i, chunk in enumerate(chunks, 1):
        print(f"\n[SMART DEBUG] Đoạn {i} ({len(tokenizer.encode(chunk))} tokens):\n{chunk}")

    return chunks




def summarize_long_text(text):
    # Ước lượng số token sơ bộ dựa vào số từ
    token_estimate = len(text.split())

    if token_estimate < 600:
        print("[INFO] Văn bản ngắn, không cần chia nhỏ.")
        return summarize(text)  # Tóm tắt trực tiếp nếu văn bản ngắn

    # Nếu dài hơn, chia thành các đoạn nhỏ
    chunks = split_text_smart(text, max_input_tokens=400,n_chunks=3)
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
    # Ước lượng số token đơn giản theo số từ 
    token_estimate = len(text.split())

    if token_estimate < 400:
        print("[INFO] Văn bản ngắn, không cần chia nhỏ.")
        return summarize_v2(text,mode="structured")  # Tóm tắt trực tiếp nếu văn bản ngắn

    # Nếu dài thì chia nhỏ
    chunks = split_text_smart(text, max_input_tokens=600,n_chunks=2)
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
        
        # Xóa nội dung tất cả các thẻ <span> bên trong article
        for span in article.find_all("span"):
            span.decompose()  # loại bỏ cả thẻ lẫn nội dung

        text = article.get_text(separator="\n", strip=True)
        return text

    except Exception as e:
        print(f"Error: {e}")
        return None
    


def calculate_coin_required(word_count, summary_type):
    if summary_type == 'short':
        if word_count <= 300:
            return 0
        elif word_count <= 1000:
            return 1
        else:
            return 2
    elif summary_type == 'medium':
        if word_count <= 300:
            return 1
        elif word_count <= 1000:
            return 2
        else:
            return 3
    elif summary_type == 'detailed':
        if word_count <= 300:
            return 2
        elif word_count <= 1000:
            return 3
        else:
            return 5
    return 0

# Route API
@app.route('/api/summarize', methods=['POST'])
def api_summarize():
    data = request.get_json()
    text = data.get('text', '')
    user_id = data.get('user_id')
    summary_type = data.get("summary_type", "short")

    if not text.strip():
        return jsonify({'error': 'Văn bản nhập vào trống!'}), 400

    word_count = len(text.strip().split())
    coin_required = calculate_coin_required(word_count, summary_type)

    try:
        # Nếu có user thì kiểm tra số xu và trừ
        if user_id:
            user = User.query.get(user_id)
            if not user:
                return jsonify({'error': 'Không tìm thấy người dùng'}), 404

            if user.coin < coin_required:
                return jsonify({'error': f'Bạn cần {coin_required} xu để tóm tắt, nhưng chỉ có {user.coin} xu.'}), 400

            # Trừ xu nếu cần
            if coin_required > 0:
                user.coin -= coin_required
                transaction = Transaction(
                    user_id=user_id,
                    amount=-coin_required,
                    type='summarize',
                    
                )
                db.session.add(transaction)

        # Tóm tắt nội dung
        if summary_type == "short":
            summary = summarize(text)
        elif summary_type == "medium":
            summary = summarize_medium_text(text)
        elif summary_type == "detailed":
            summary = summarize_long_text(text)
        else:
            return jsonify({'error': 'Loại tóm tắt không hợp lệ.'}), 400

        # Lưu lịch sử
        if user_id:
            history_entry = History(
                content=text,
                summary=summary,
                user_id=user_id
            )
            db.session.add(history_entry)

        db.session.commit()

        return jsonify({
            'summary': summary,
            'full_text': text,
            'coin_used': coin_required,
            'remaining_coin': user.coin if user_id else None
        })

    except Exception as e:
        print("[LỖI]:", str(e))
        return jsonify({'error': 'Đã có lỗi xảy ra trong quá trình tóm tắt.'}), 500
    
@app.route('/api/summarize-article', methods=['POST'])
def summarize_article():
    data = request.get_json()
    url = data.get('url')
    user_id = data.get('user_id')
    summary_type = data.get("summary_type", "short")

    if not url:
        return jsonify({"error": "URL is required"}), 400

    content = extract_main_content(url)

    if not content:
        return jsonify({"error": "Không thể lấy nội dung từ liên kết"}), 500

    
        # Gọi hàm tương ứng theo loại tóm tắt
    if summary_type == "short":
        summary = summarize(content)
    elif summary_type == "medium":
        summary = summarize_medium_text(content)
    elif summary_type == "detailed":
        summary = summarize_long_text(content)
    else:
        return jsonify({'error': 'Loại tóm tắt không hợp lệ.'}), 400

    if user_id:
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
    
    
@app.route('/api/users', methods=['GET'])

def get_users():
    # current_user_id = get_jwt_identity()
    # current_user = User.query.get(current_user_id)

    # # Chỉ cho phép admin (hoặc thêm điều kiện phù hợp nếu cần)
    # if current_user.username != 'admin':
    #     return jsonify({'error': 'Bạn không có quyền truy cập danh sách người dùng'}), 403

    users = User.query.all()
    user_list = []

    for user in users:
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'coin': user.coin
        }
        user_list.append(user_data)

    return jsonify({'users': user_list}), 200    


@app.route('/api/users/<int:user_id>/recharge', methods=['POST'])
def recharge(user_id):
    data = request.get_json()
    amount = data.get('amount', 0)

    if amount <= 0:
        return jsonify({'error': 'Số xu nạp phải lớn hơn 0'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Không tìm thấy người dùng'}), 404

    user.coin += amount
    
     # Ghi lại giao dịch
    transaction = Transaction(
        user_id=user_id,
        type='recharge',
        amount=amount
    )
    db.session.add(transaction)
    db.session.commit()

    return jsonify({'message': 'Nạp xu thành công', 'coin': user.coin}), 200

@app.route('/api/users/<int:user_id>/transactions', methods=['GET'])
def get_user_transactions(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Không tìm thấy người dùng'}), 404

    transactions = Transaction.query.filter_by(user_id=user_id).order_by(Transaction.timestamp.desc()).all()
    
    transaction_list = [
        {
            'id': t.id,
            'type': t.type,
            'amount': t.amount,
            'timestamp': t.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        }
        for t in transactions
    ]

    return jsonify({'transactions': transaction_list})


# API: Lấy tất cả giao dịch nạp xu
@app.route('/api/transactions/recharges', methods=['GET'])
def get_all_recharges():
    try:
        recharges = Transaction.query.filter_by(type='recharge').order_by(Transaction.timestamp.desc()).all()
        result = []
        for txn in recharges:
            result.append({
                'id': txn.id,
                'user_id': txn.user_id,
                'name': User.query.get(txn.user_id).username if txn.user_id else None,
                'amount': txn.amount,
                'type': txn.type,
                'timestamp': txn.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            })
        return jsonify({'transactions': result}), 200
    except Exception as e:
        print("[LỖI]:", str(e))
        return jsonify({'error': 'Không thể truy vấn dữ liệu'}), 500


@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    try:
        # Tổng số người dùng
        total_users = User.query.count()

        # Tổng số lượt tóm tắt trong ngày
        today = date.today()
        total_summaries_today = History.query.filter(
            db.func.date(History.created_at) == today
        ).count()

        # Tổng số xu đã nạp vào hệ thống (chỉ tính giao dịch recharge)
        total_recharged_coins = db.session.query(
            db.func.coalesce(db.func.sum(Transaction.amount), 0)
        ).filter(Transaction.type == 'recharge').scalar()

        # Tổng thu nhập (VNĐ) từ số xu đã nạp
        total_income_vnd = total_recharged_coins * 10000

        return jsonify({
            'total_users': total_users,
            'summaries_today': total_summaries_today,
            'total_recharged_coins': total_recharged_coins,
            'total_income_vnd': total_income_vnd
        })
    except Exception as e:
        print("Lỗi thống kê:", str(e))
        return jsonify({'error': 'Lỗi khi lấy dữ liệu thống kê'}), 500


@app.route('/api/summary-stats-7days', methods=['GET'])
def summary_stats_7days():
    today = datetime.utcnow().date()
    seven_days_ago = today - timedelta(days=6)

    result = (
        db.session.query(
            func.date(History.created_at).label('date'),
            func.count().label('count')
        )
        .filter(History.created_at >= seven_days_ago)
        .group_by(func.date(History.created_at))
        .order_by(func.date(History.created_at))
        .all()
    )

    stats = []
    for i in range(7):
        date = seven_days_ago + timedelta(days=i)
        date_str = date.strftime('%Y-%m-%d')
        count = next((count for r_date, count in result if r_date == date_str), 0)
        stats.append({'date': date_str, 'count': count})

    return jsonify({'data': stats})

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