#!/usr/bin/env python3
"""
GPT-2 Fine-tuning Script with Dataset Logging
Created at application startup for LLM Tuner Platform
"""

import sys
import argparse
import json


def read_data(file_content, file_type):
    """Process uploaded file content into training dataset"""
    print(f"Processing file content of type: {file_type}")
    print(f"Content length: {len(file_content)} characters")

    texts = []

    if file_type == '.json':
        try:
            data = json.loads(file_content)
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict):
                        text = item.get('text') or item.get(
                            'content') or item.get(
                                'description') or json.dumps(item)
                        if text and text.strip():
                            texts.append(text.strip())
                    else:
                        texts.append(str(item))
            else:
                texts.append(str(data))
        except json.JSONDecodeError:
            texts = [
                line.strip() for line in file_content.split('\n')
                if line.strip()
            ]

    elif file_type == '.csv':
        lines = file_content.split('\n')
        if len(lines) > 1:
            for line in lines[1:]:
                line = line.strip()
                if line:
                    texts.append(line)

    elif file_type == '.jsonl':
        for line in file_content.split('\n'):
            line = line.strip()
            if line:
                try:
                    data = json.loads(line)
                    text = data.get('text') or data.get(
                        'content') or json.dumps(data)
                    if text and text.strip():
                        texts.append(text.strip())
                except json.JSONDecodeError:
                    texts.append(line)

    else:  # .txt and unknown types
        texts = [
            line.strip() for line in file_content.split('\n')
            if line.strip() and len(line.strip()) > 10
        ]

    print(f"Prepared {len(texts)} text samples for training")
    # if texts:
    #     print("\n=== First 5 Dataset Samples ===")
    #     for i, text in enumerate(texts[:5]):
    #         print(f"Sample {i+1}: {text[:150]}...")
    #     print("===============================\n")

    return {"text": texts}


# def train_model(dataset_dict, hyperparams = None):
#     from datasets import Dataset
#     from transformers import AutoTokenizer, GPT2LMHeadModel
#     from transformers.trainer import Trainer
#     from transformers.training_args import TrainingArguments
#     from transformers.data.data_collator import DataCollatorForLanguageModeling

#     # Convert to Hugging Face Dataset
#     dataset = Dataset.from_dict(dataset_dict)
#     print("\n=== 🔍 First 5 Dataset Samples ===")
#     for i in range(min(5, len(dataset))):
#         print(f"Sample {i+1}: {dataset[i]}")
#     print("===============================\n")

#     print("✅ Converted to Hugging Face dataset")

#     print(f"📊 Hyperparameters loaded------>: {hyperparams}")
#     # Load tokenizer and model
#     tokenizer = AutoTokenizer.from_pretrained("gpt2")
#     tokenizer.pad_token = tokenizer.eos_token
#     model = GPT2LMHeadModel.from_pretrained("gpt2")
#     print("✅ Model and tokenizer loaded")

#     # Tokenize
#     def tokenize(example):
#         return tokenizer(
#             example["text"],
#             truncation=True,
#             padding="max_length",
#             max_length=128
#         )

#     tokenized = dataset.map(tokenize, batched=True, remove_columns=["text"])
#     print("✅ Tokenization complete")

#     # Data collator
#     data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

#     # Training config
#     training_args = TrainingArguments(
#         output_dir="./gpt2_finetuned_output",
#         per_device_train_batch_size=4,
#         num_train_epochs=1,
#         save_steps=5,
#         logging_steps=2,
#         report_to="none"
#     )
#     print("✅ TrainingArguments ready")

#     # Trainer setup
#     trainer = Trainer(
#         model=model,
#         args=training_args,
#         data_collator=data_collator,
#         train_dataset=tokenized.select(range(min(10000, len(tokenized))))
#     )
#     print("✅ Trainer created")

#     # Train
#     trainer.train()
#     print("✅ Training complete")

#     # Save model
#     model.save_pretrained("gpt2_finetuned")
#     tokenizer.save_pretrained("gpt2_finetuned")

#     return "🎉 Model trained successfully!"

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GPT-2 Fine-tuning Script")
    parser.add_argument("--file_name",
                        required=True,
                        help="Name of the uploaded file")
    parser.add_argument("--file_type",
                        required=True,
                        help="Type of the uploaded file (.txt, .json, etc.)")
    parser.add_argument("--content_file",
                        help="Path to file containing the uploaded content")
    parser.add_argument(
        "--file_content",
        help="Content of the uploaded file (alternative to content_file)")
    parser.add_argument("--hyperparameters",
                        help="JSON string of hyperparameters")

    args = parser.parse_args()

    # print("=== 🚀 GPT-2 Fine-tuning with Uploaded Data ===")
    # print(f"📄 File: {args.file_name}")
    # print(f"📁 Type: {args.file_type}")

    file_content = ""
    if args.content_file:
        try:
            with open(args.content_file, 'r', encoding='utf-8') as f:
                file_content = f.read()
            # print(f"✅ Read content from {args.content_file}")
        except Exception as e:
            print(f"❌ Error reading content file: {e}")
            sys.exit(1)
    elif args.file_content:
        file_content = args.file_content
    else:
        print("❌ No content provided (use --content_file or --file_content)")
        sys.exit(1)

    dataset_dict = read_data(file_content, args.file_type)

    # Parse hyperparams and show dataset when training starts
    if args.hyperparameters:
        try:
            hyperparams = json.loads(args.hyperparameters)
            print(f"📊 Hyperparameters loaded------>: {hyperparams}")

            # Show dataset samples right after hyperparameters are loaded
            if 'texts' in dataset_dict and dataset_dict['texts']:
                print("\n=== Dataset Samples After Hyperparameters Loaded ===")
                for i, text in enumerate(dataset_dict['texts'][:5], 1):
                    preview = text[:150] + "..." if len(text) > 150 else text
                    print(f"Sample {i}: {preview}")
                print("===================================================\n")
        except:
            print("⚠️ Could not parse hyperparameters")

    #print(train_model(dataset_dict, hyperparams))
