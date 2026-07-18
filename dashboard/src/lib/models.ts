export interface ModelParams {
  max_tokens: number
  temperature: number
  top_p: number
  top_k?: number
  frequency_penalty?: number
  presence_penalty?: number
  repetition_penalty?: number
  seed?: number
  extra_body?: Record<string, any>
  chat_template_kwargs?: Record<string, any>
}

export interface ModelInfo {
  id: string
  name: string
  category: 'reasoning' | 'balanced' | 'fast' | 'vision'
  provider: string
  capabilities: string[]
  params: ModelParams
  supports_thinking?: boolean
  recommended_for?: string
}

export const MODEL_REGISTRY: ModelInfo[] = [
  {
    id: 'deepseek-ai/deepseek-v4-flash',
    name: 'DeepSeek V4 Flash',
    category: 'reasoning',
    provider: 'DeepSeek',
    capabilities: ['planning', 'reasoning', 'thinking', 'analysis'],
    params: { max_tokens: 16384, temperature: 1, top_p: 0.95, extra_body: { chat_template_kwargs: { thinking: true, reasoning_effort: 'high' } } },
    supports_thinking: true,
    recommended_for: 'planning'
  },
  {
    id: 'deepseek-ai/deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
    category: 'reasoning',
    provider: 'DeepSeek',
    capabilities: ['planning', 'reasoning', 'analysis'],
    params: { max_tokens: 16384, temperature: 1, top_p: 0.95, extra_body: { chat_template_kwargs: { thinking: false } } },
    supports_thinking: true,
    recommended_for: 'planning'
  },
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b',
    name: 'Nemotron 3 Ultra 550B',
    category: 'reasoning',
    provider: 'NVIDIA',
    capabilities: ['planning', 'reasoning', 'thinking', 'analysis'],
    params: { max_tokens: 16384, temperature: 1, top_p: 0.95, extra_body: { chat_template_kwargs: { enable_thinking: true }, reasoning_budget: 16384 } },
    supports_thinking: true,
    recommended_for: 'deep_analysis'
  },
  {
    id: 'nvidia/nemotron-3-super-120b-a12b',
    name: 'Nemotron 3 Super 120B',
    category: 'reasoning',
    provider: 'NVIDIA',
    capabilities: ['planning', 'reasoning', 'thinking'],
    params: { max_tokens: 16384, temperature: 1, top_p: 0.95, extra_body: { chat_template_kwargs: { enable_thinking: true }, reasoning_budget: 16384 } },
    supports_thinking: true
  },
  {
    id: 'nvidia/nemotron-3-nano-30b-a3b',
    name: 'Nemotron 3 Nano 30B',
    category: 'reasoning',
    provider: 'NVIDIA',
    capabilities: ['reasoning', 'thinking'],
    params: { max_tokens: 16384, temperature: 1, top_p: 1, extra_body: { reasoning_budget: 16384 } },
    supports_thinking: true,
    recommended_for: 'fast_reasoning'
  },
  {
    id: 'google/gemma-4-31b-it',
    name: 'Gemma 4 31B IT',
    category: 'reasoning',
    provider: 'Google',
    capabilities: ['planning', 'reasoning', 'thinking'],
    params: { max_tokens: 16384, temperature: 1, top_p: 0.95, chat_template_kwargs: { enable_thinking: true } },
    supports_thinking: true
  },
  {
    id: 'stepfun-ai/step-3.7-flash',
    name: 'Step 3.7 Flash',
    category: 'reasoning',
    provider: 'StepFun',
    capabilities: ['planning', 'reasoning'],
    params: { max_tokens: 16384, temperature: 1, top_p: 0.95, seed: 42 }
  },
  {
    id: 'stepfun-ai/step-3.5-flash',
    name: 'Step 3.5 Flash',
    category: 'reasoning',
    provider: 'StepFun',
    capabilities: ['planning', 'reasoning'],
    params: { max_tokens: 16384, temperature: 1, top_p: 0.9 }
  },
  {
    id: 'nvidia/llama-3.3-nemotron-super-49b-v1.5',
    name: 'Llama 3.3 Nemotron Super 49B',
    category: 'balanced',
    provider: 'NVIDIA',
    capabilities: ['planning', 'analysis', 'summarization'],
    params: { max_tokens: 65536, temperature: 0.6, top_p: 0.95, frequency_penalty: 0, presence_penalty: 0 },
    recommended_for: 'summarization'
  },
  {
    id: 'meta/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    category: 'balanced',
    provider: 'Meta',
    capabilities: ['planning', 'analysis', 'summarization'],
    params: { max_tokens: 1024, temperature: 0.2, top_p: 0.7 },
    recommended_for: 'planning'
  },
  {
    id: 'meta/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    category: 'balanced',
    provider: 'Meta',
    capabilities: ['planning', 'analysis', 'summarization'],
    params: { max_tokens: 1024, temperature: 0.2, top_p: 0.7 }
  },
  {
    id: 'moonshotai/kimi-k2.6',
    name: 'Kimi K2.6',
    category: 'balanced',
    provider: 'Moonshot',
    capabilities: ['planning', 'analysis'],
    params: { max_tokens: 16384, temperature: 1, top_p: 1, seed: 0 }
  },
  {
    id: 'minimaxai/minimax-m3',
    name: 'MiniMax M3',
    category: 'balanced',
    provider: 'MiniMax',
    capabilities: ['planning', 'analysis', 'summarization'],
    params: { max_tokens: 8192, temperature: 1, top_p: 0.95 },
    recommended_for: 'general'
  },
  {
    id: 'minimaxai/minimax-m2.7',
    name: 'MiniMax M2.7',
    category: 'balanced',
    provider: 'MiniMax',
    capabilities: ['planning', 'summarization'],
    params: { max_tokens: 8192, temperature: 1, top_p: 0.95 }
  },
  {
    id: 'qwen/qwen3.5-122b-a10b',
    name: 'Qwen 3.5 122B',
    category: 'balanced',
    provider: 'Qwen',
    capabilities: ['planning', 'analysis', 'summarization'],
    params: { max_tokens: 16384, temperature: 0.6, top_p: 0.95 },
    recommended_for: 'cheap_planning'
  },
  {
    id: 'qwen/qwen3.5-397b-a17b',
    name: 'Qwen 3.5 397B',
    category: 'balanced',
    provider: 'Qwen',
    capabilities: ['planning', 'analysis', 'summarization'],
    params: { max_tokens: 16384, temperature: 0.6, top_p: 0.95, top_k: 20, presence_penalty: 0, repetition_penalty: 1 },
    recommended_for: 'high_quality'
  },
  {
    id: 'qwen/qwen3-next-80b-a3b-instruct',
    name: 'Qwen 3 Next 80B',
    category: 'balanced',
    provider: 'Qwen',
    capabilities: ['planning', 'summarization'],
    params: { max_tokens: 4096, temperature: 0.6, top_p: 0.7 }
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B',
    category: 'balanced',
    provider: 'OpenAI',
    capabilities: ['planning', 'analysis'],
    params: { max_tokens: 4096, temperature: 1, top_p: 1 }
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT-OSS 120B',
    category: 'balanced',
    provider: 'OpenAI',
    capabilities: ['planning', 'analysis', 'reasoning'],
    params: { max_tokens: 4096, temperature: 1, top_p: 1 }
  },
  {
    id: 'poolside/laguna-xs-2.1',
    name: 'Laguna XS 2.1',
    category: 'balanced',
    provider: 'Poolside',
    capabilities: ['planning', 'analysis'],
    params: { max_tokens: 8192, temperature: 1, top_p: 0.95 }
  },
  {
    id: 'z-ai/glm-5.2',
    name: 'GLM 5.2',
    category: 'balanced',
    provider: 'Z-AI',
    capabilities: ['planning', 'analysis'],
    params: { max_tokens: 16384, temperature: 1, top_p: 1, seed: 42 }
  },
  {
    id: 'meta/llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B',
    category: 'fast',
    provider: 'Meta',
    capabilities: ['planning', 'summarization'],
    params: { max_tokens: 1024, temperature: 0.2, top_p: 0.7 },
    recommended_for: 'fast_planning'
  },
  {
    id: 'meta/llama-3.2-1b-instruct',
    name: 'Llama 3.2 1B',
    category: 'fast',
    provider: 'Meta',
    capabilities: ['simple_tasks'],
    params: { max_tokens: 1024, temperature: 0.2, top_p: 0.7 }
  },
  {
    id: 'meta/llama-3.2-3b-instruct',
    name: 'Llama 3.2 3B',
    category: 'fast',
    provider: 'Meta',
    capabilities: ['simple_tasks', 'summarization'],
    params: { max_tokens: 1024, temperature: 0.2, top_p: 0.7 }
  },
  {
    id: 'google/gemma-3n-e4b-it',
    name: 'Gemma 3N E4B',
    category: 'fast',
    provider: 'Google',
    capabilities: ['simple_tasks', 'summarization'],
    params: { max_tokens: 512, temperature: 0.2, top_p: 0.7, frequency_penalty: 0, presence_penalty: 0 }
  },
  {
    id: 'meta/llama-3.2-11b-vision-instruct',
    name: 'Llama 3.2 11B Vision',
    category: 'vision',
    provider: 'Meta',
    capabilities: ['vision', 'analysis'],
    params: { max_tokens: 512, temperature: 1, top_p: 1, frequency_penalty: 0, presence_penalty: 0 }
  }
]

export function getModel(modelId: string): ModelInfo {
  return MODEL_REGISTRY.find(m => m.id === modelId) || MODEL_REGISTRY[0]
}

export function getModelsByCategory(category?: string): ModelInfo[] {
  if (category) return MODEL_REGISTRY.filter(m => m.category === category)
  return MODEL_REGISTRY
}

export function getModelParams(modelId: string): Record<string, any> {
  const model = getModel(modelId)
  const base: Record<string, any> = {
    model: modelId,
    temperature: model.params.temperature ?? 0.3,
    top_p: model.params.top_p ?? 0.95,
    max_tokens: model.params.max_tokens ?? 1024
  }
  if (model.params.extra_body) base.extra_body = model.params.extra_body
  const extraKeys = ['seed', 'frequency_penalty', 'presence_penalty', 'repetition_penalty', 'top_k', 'chat_template_kwargs'] as const
  for (const k of extraKeys) {
    if (model.params[k] !== undefined) base[k] = model.params[k]
  }
  return base
}
