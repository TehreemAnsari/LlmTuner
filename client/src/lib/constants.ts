export const BASE_MODELS = [
  {
    value: "gpt-3.5-turbo",
    label: "GPT-3.5 Turbo",
    description: "Fast and efficient model for most use cases. Great for text generation and conversation.",
    capabilities: ["Text Generation", "Q&A", "Summarization"],
    cost: "Low",
    speed: "Fast"
  },
  {
    value: "gpt-4",
    label: "GPT-4",
    description: "Most capable model with superior reasoning and understanding. Best for complex tasks.",
    capabilities: ["Advanced Reasoning", "Code Generation", "Complex Analysis"],
    cost: "High",
    speed: "Medium"
  },
  {
    value: "llama-2-7b",
    label: "Llama 2 7B",
    description: "Open-source model with good performance and lower cost. Suitable for many applications.",
    capabilities: ["Text Generation", "Classification", "Summarization"],
    cost: "Low",
    speed: "Fast"
  },
  {
    value: "llama-2-13b",
    label: "Llama 2 13B",
    description: "Larger Llama model with improved capabilities. Better reasoning than 7B variant.",
    capabilities: ["Advanced Text Generation", "Complex Reasoning", "Code Generation"],
    cost: "Medium",
    speed: "Medium"
  },
  {
    value: "mistral-7b",
    label: "Mistral 7B",
    description: "Efficient open-source model with strong performance. Good balance of speed and quality.",
    capabilities: ["Text Generation", "Code Generation", "Instruction Following"],
    cost: "Low",
    speed: "Fast"
  },
  {
    value: "claude-instant",
    label: "Claude Instant",
    description: "Fast and helpful assistant model. Good for conversational applications.",
    capabilities: ["Conversation", "Q&A", "Text Analysis"],
    cost: "Medium",
    speed: "Fast"
  },
  {
    value: "palm-2",
    label: "PaLM 2",
    description: "Google's advanced language model with strong reasoning capabilities.",
    capabilities: ["Reasoning", "Code Generation", "Multilingual"],
    cost: "Medium",
    speed: "Medium"
  }
];

export const TASK_TYPES = [
  {
    value: "text-generation",
    label: "Text Generation",
    description: "Generate coherent and contextually relevant text"
  },
  {
    value: "classification",
    label: "Classification",
    description: "Categorize text into predefined classes"
  },
  {
    value: "question-answering",
    label: "Question Answering",
    description: "Answer questions based on context"
  },
  {
    value: "summarization",
    label: "Summarization",
    description: "Create concise summaries of long text"
  },
  {
    value: "translation",
    label: "Translation",
    description: "Translate text between languages"
  },
  {
    value: "code-generation",
    label: "Code Generation",
    description: "Generate and complete code snippets"
  }
];

export const SAMPLE_DATASETS = [
  {
    name: "Customer Support",
    description: "Common customer service queries and responses",
    size: "2.3MB",
    samples: 1500
  },
  {
    name: "Code Generation",
    description: "Programming tasks and solutions",
    size: "5.7MB",
    samples: 3200
  },
  {
    name: "Text Classification",
    description: "Labeled text data for classification tasks",
    size: "1.8MB",
    samples: 2100
  }
];

export const HYPERPARAMETER_TEMPLATES = {
  "text-generation": {
    learningRate: 3e-4,
    batchSize: 8,
    epochs: 3,
    warmupSteps: 500,
    weightDecay: 0.01,
    maxLength: 2048
  },
  "classification": {
    learningRate: 5e-4,
    batchSize: 16,
    epochs: 5,
    warmupSteps: 100,
    weightDecay: 0.01,
    maxLength: 512
  },
  "question-answering": {
    learningRate: 2e-4,
    batchSize: 12,
    epochs: 3,
    warmupSteps: 200,
    weightDecay: 0.01,
    maxLength: 1024
  },
  "summarization": {
    learningRate: 3e-4,
    batchSize: 8,
    epochs: 4,
    warmupSteps: 300,
    weightDecay: 0.01,
    maxLength: 2048
  },
  "translation": {
    learningRate: 4e-4,
    batchSize: 16,
    epochs: 5,
    warmupSteps: 400,
    weightDecay: 0.01,
    maxLength: 1024
  },
  "code-generation": {
    learningRate: 2e-4,
    batchSize: 4,
    epochs: 3,
    warmupSteps: 600,
    weightDecay: 0.01,
    maxLength: 4096
  }
};
