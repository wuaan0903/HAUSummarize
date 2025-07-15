from openai import OpenAI
import json
import time
import os

# Tạo client với API base của OpenRouter
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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"
)

def summarize_text(text, model="openai/gpt-3.5-turbo"):
    prompt = f"Hãy tóm tắt nội dung bài viết sau bằng tiếng Việt, ngắn gọn, súc tích, giữ nguyên thông tin quan trọng:\n\n{text}\n\nTóm tắt:"
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "Bạn là một trợ lý giỏi tóm tắt văn bản tiếng Việt."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )

        # DEBUG tạm thời
        if not response or not hasattr(response, "choices") or not response.choices:
            print("⚠️ Lỗi: Không có 'choices' trong response hoặc response là None.")
            print(response)
            return None

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"❌ Lỗi khi gọi API: {e}")
        return None

# Đường dẫn file
input_path = "data_testing/input_articles.json"
output_path = "data_testing/test_dataset.json"

# Chạy 10 lần
for run in range(2):
    print(f"\n🚀 Lần chạy thứ {run + 1}/5...\n")

    # Đọc dữ liệu từ file JSON đầu vào
    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    output_data = []

    for i, item in enumerate(data):
        try:
            summary = summarize_text(item["text"])
            output_data.append({
                "text": item["text"],
                "summary": summary
            })
            print(f"✅ [{run + 1}] Tóm tắt xong bài viết {i+1}")
            time.sleep(1)  # Tránh bị rate-limit
        except Exception as e:
            print(f"⚠️ Lỗi ở bài {i+1} (lần {run + 1}): {e}")

    # Gộp dữ liệu mới với dữ liệu đã có (nếu có)
    if os.path.exists(output_path):
        with open(output_path, "r", encoding="utf-8") as f:
            existing_data = json.load(f)
    else:
        existing_data = []

    combined_data = existing_data + output_data

    # Ghi toàn bộ dữ liệu (cũ + mới) ra file
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(combined_data, f, ensure_ascii=False, indent=2)

    print(f"💾 Đã thêm {len(output_data)} bài viết (lần {run + 1}). Tổng cộng hiện có: {len(combined_data)} dataset.\n")
