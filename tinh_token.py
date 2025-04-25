from transformers import AutoTokenizer
import json

# 1. Load tokenizer từ mô hình ViT5
tokenizer = AutoTokenizer.from_pretrained("VietAI/vit5-base")

# 2. Đọc file JSON chứa dữ liệu
with open("data/train_dataset1.json", "r", encoding="utf-8") as f:
    dataset = json.load(f)

# 3. Tính và in số tokens cho từng đoạn văn bản 'text'
for idx, item in enumerate(dataset):
    text = item["text"]
    summary = item["summary"]
    token_ids = tokenizer.encode(text, truncation=False)
    token_count = len(token_ids)
    print(f"Văn bản {idx+1} có {token_count} tokens.")
    print(f"Tóm tắt {idx+1} có {len(tokenizer.encode(summary, truncation=False))} tokens.")
