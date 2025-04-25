from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, Seq2SeqTrainer, Seq2SeqTrainingArguments, DataCollatorForSeq2Seq
from datasets import load_dataset, Dataset
import json
import torch

# 1. Load dữ liệu từ file JSON
with open("data/train_dataset.json", "r", encoding="utf-8") as f:
    raw_data = json.load(f)

# 2. Chuyển đổi dữ liệu thành Dataset của HuggingFace
train_data = Dataset.from_dict({
    "text": [item["text"] for item in raw_data],
    "summary": [item["summary"] for item in raw_data],
})

# 3. Load tokenizer và model từ VietAI
model_name = "VietAI/vit5-base"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# 4. Tiền xử lý dữ liệu (tokenize)
def preprocess_function(examples):
    inputs = [ex for ex in examples["text"]]
    model_inputs = tokenizer(inputs, max_length=512, truncation=True, padding="max_length")

    # Thiết lập nhãn (summary) cho training
    with tokenizer.as_target_tokenizer():
        labels = tokenizer(examples["summary"], max_length=150, truncation=True, padding="max_length")

    model_inputs["labels"] = labels["input_ids"]
    return model_inputs

tokenized_dataset = train_data.map(preprocess_function, batched=True)

# 5. Thiết lập training args
training_args = Seq2SeqTrainingArguments(
    output_dir="./text_summarization_model",
    evaluation_strategy="no",
    learning_rate=2e-5,
    per_device_train_batch_size=2,
    num_train_epochs=10,
    weight_decay=0.01,
    save_total_limit=1,
    logging_dir='./logs',
    logging_steps=10,
    save_steps=100
)



# 6. Tạo DataCollator để pad dữ liệu đầu vào
data_collator = DataCollatorForSeq2Seq(tokenizer, model=model)

# 7. Trainer để huấn luyện mô hình
trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
    tokenizer=tokenizer,
    data_collator=data_collator,
)

# 8. Tiến hành huấn luyện
trainer.train()

# 9. Lưu mô hình sau khi huấn luyện
trainer.save_model("./text_summarization_model_1")


