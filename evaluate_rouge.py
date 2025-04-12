from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from datasets import Dataset
from sklearn.metrics import classification_report
from rouge_score import rouge_scorer
import json

# 1. Load model và tokenizer đã train xong
model_path = "./text_summarization_model_1"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSeq2SeqLM.from_pretrained(model_path)

# 2. Load file test_dataset.json
with open("data_testing/test_dataset_2.json", "r", encoding="utf-8") as f:
    raw_data = json.load(f)

test_dataset = Dataset.from_dict({
    "text": [item["text"] for item in raw_data],
    "summary": [item["summary"] for item in raw_data],
})

# 3. Tạo hàm sinh tóm tắt từ mô hình
def generate_summary(example):
    inputs = tokenizer(example["text"], return_tensors="pt", max_length=512, truncation=True)
    inputs = {k: v.to(model.device) for k, v in inputs.items()}
    summary_ids = model.generate(**inputs, max_length=150, num_beams=4)
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return summary

# 4. Sinh dự đoán
print("🔄 Đang sinh tóm tắt cho tập test...")
generated_summaries = []

for i, item in enumerate(test_dataset):
    summary = generate_summary(item)
    generated_summaries.append(summary)
    print(f"✅ Đã sinh tóm tắt cho một bài viết. {i+1}/{len(test_dataset)}")

# 5. Tính ROUGE score
print("✅ Đang tính ROUGE score...")
scorer = rouge_scorer.RougeScorer(["rouge1", "rouge2", "rougeL"], use_stemmer=True)

rouge1_list, rouge2_list, rougeL_list = [], [], []
for pred, ref in zip(generated_summaries, test_dataset["summary"]):
    scores = scorer.score(ref, pred)
    rouge1_list.append(scores["rouge1"].fmeasure)
    rouge2_list.append(scores["rouge2"].fmeasure)
    rougeL_list.append(scores["rougeL"].fmeasure)

# 6. In kết quả trung bình
print("\n📊 Kết quả đánh giá ROUGE:")
print(f"ROUGE-1: {sum(rouge1_list)/len(rouge1_list):.4f}")
print(f"ROUGE-2: {sum(rouge2_list)/len(rouge2_list):.4f}")
print(f"ROUGE-L: {sum(rougeL_list)/len(rougeL_list):.4f}")
