'use client'

import { ModelCard, MODEL_CARDS } from '@/lib/modelCards'

export default function ModelCardModal({ modelId, onClose }: { modelId: string | null; onClose: () => void }) {
  if (!modelId) return null
  const card: ModelCard | undefined = MODEL_CARDS[modelId]
  if (!card) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
          <p className="text-sm text-gray-500">No model card available for this model yet.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">Close</button>
        </div>
      </div>
    )
  }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="text-sm text-gray-700">{children}</div>
    </div>
  )

  const Chips = ({ items }: { items: string[] }) => (
    <div className="flex flex-wrap gap-1.5">
      {items.map((c, i) => (
        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c}</span>
      ))}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{card.name}</h2>
            <p className="text-sm text-gray-400">by {card.publisher} · <span className="font-mono text-xs">{card.id}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <Field label="Summary"><p className="leading-relaxed">{card.summary}</p></Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Architecture">{card.architecture}</Field>
            <Field label="Context Window">{card.contextWindow}</Field>
            <Field label="Modality">{card.modality}</Field>
            <Field label="Thinking">{card.thinking}</Field>
          </div>

          <Field label="Capabilities"><Chips items={card.capabilities} /></Field>
          <Field label="Best Use Cases"><Chips items={card.bestUseCases} /></Field>
          <Field label="Limitations"><Chips items={card.limitations} /></Field>

          <Field label="Benchmarks">{card.benchmarks}</Field>

          <Field label="API Defaults">
            <p className="text-xs font-mono text-gray-600">
              temperature: {card.apiDefaults.temperature ?? 'model default'} · top_p: {card.apiDefaults.top_p ?? 'model default'} · max_tokens: {card.apiDefaults.max_tokens ?? 'model default'}
            </p>
          </Field>

          <Field label="License / Pricing Tier">{card.pricingTier}</Field>

          <a
            href={`https://build.nvidia.com/qc69jvmznzxy/${card.slug}.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-blue-600 hover:underline"
          >
            View official model card on build.nvidia.com ↗
          </a>
        </div>
      </div>
    </div>
  )
}
