from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from datasets import Dataset
from sklearn.metrics import classification_report
from rouge_score import rouge_scorer
import json

# 1. Load model và tokenizer đã train xong
model_path = "wuaan0903/HAUSummarize"
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

rouge1_p, rouge1_r, rouge1_f = [], [], []
rouge2_p, rouge2_r, rouge2_f = [], [], []
rougeL_p, rougeL_r, rougeL_f = [], [], []

for pred, ref in zip(generated_summaries, test_dataset["summary"]):
    scores = scorer.score(ref, pred)

    rouge1_p.append(scores["rouge1"].precision)
    rouge1_r.append(scores["rouge1"].recall)
    rouge1_f.append(scores["rouge1"].fmeasure)

    rouge2_p.append(scores["rouge2"].precision)
    rouge2_r.append(scores["rouge2"].recall)
    rouge2_f.append(scores["rouge2"].fmeasure)

    rougeL_p.append(scores["rougeL"].precision)
    rougeL_r.append(scores["rougeL"].recall)
    rougeL_f.append(scores["rougeL"].fmeasure)


# 6. In kết quả trung bình
print("\n📊 KẾT QUẢ ĐÁNH GIÁ ROUGE:")
print("== ROUGE-1 ==")
print(f"Precision: {sum(rouge1_p)/len(rouge1_p):.4f}")
print(f"Recall:    {sum(rouge1_r)/len(rouge1_r):.4f}")
print(f"F1-Score:  {sum(rouge1_f)/len(rouge1_f):.4f}")

print("\n== ROUGE-2 ==")
print(f"Precision: {sum(rouge2_p)/len(rouge2_p):.4f}")
print(f"Recall:    {sum(rouge2_r)/len(rouge2_r):.4f}")
print(f"F1-Score:  {sum(rouge2_f)/len(rouge2_f):.4f}")

print("\n== ROUGE-L ==")
print(f"Precision: {sum(rougeL_p)/len(rougeL_p):.4f}")
print(f"Recall:    {sum(rougeL_r)/len(rougeL_r):.4f}")
print(f"F1-Score:  {sum(rougeL_f)/len(rougeL_f):.4f}")






