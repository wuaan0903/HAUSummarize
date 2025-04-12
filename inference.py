from transformers import T5ForConditionalGeneration, T5Tokenizer
import torch

MODEL_DIR = "./text_summarization_model_1"

# Load model và tokenizer
print("[INFO] Đang tải mô hình và tokenizer...")
tokenizer = T5Tokenizer.from_pretrained(MODEL_DIR)
model = T5ForConditionalGeneration.from_pretrained(MODEL_DIR)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
print(f"[INFO] Đã load model trên thiết bị: {device}")

def summarize(text, max_input_length=1024, max_output_length=300):
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
        num_beams=4,
        early_stopping=True
    )

    print("[INFO] Đang giải mã kết quả...")
    summary = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    return summary

if __name__ == "__main__":
    print("=== TÓM TẮT VĂN BẢN ===")
    input_text = input("Nhập văn bản cần tóm tắt:\n")
    if input_text.strip() == "":
        print("[LỖI] Văn bản nhập vào đang trống.")
    else:
        summary = summarize(input_text)
        print("\n--- Tóm tắt ---")
        print(summary)
