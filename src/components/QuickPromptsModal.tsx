import React from 'react';
import { X, Sparkles, Flame, Code, Brain, Compass, BookOpen } from 'lucide-react';

interface QuickPromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export const QUICK_PROMPTS = [
  {
    icon: Flame,
    title: 'AGI Timeline Debate',
    category: 'Debate',
    prompt: 'Will AGI arrive before 2030? Each model state your estimated year of AGI and your single strongest empirical or theoretical bottleneck.',
    color: '#EF4444'
  },
  {
    icon: Code,
    title: 'Rust vs TypeScript vs Python',
    category: 'Engineering',
    prompt: 'Rust vs TypeScript vs Python: If you had to build a mission-critical autonomous AI agent system, which language is superior and why? Challenge each other\'s choices.',
    color: '#F59E0B'
  },
  {
    icon: Brain,
    title: 'Is Mathematics Invented or Discovered?',
    category: 'Philosophy',
    prompt: 'Is mathematics an invention of conscious biological/synthetic brains or an objective discovery of universal physical law? Debate from first principles.',
    color: '#14B8A6'
  },
  {
    icon: Compass,
    title: 'Architectural Critiques',
    category: 'AI Architecture',
    prompt: 'What is the biggest limitation or architectural bottleneck in transformer models, and how will future architectures (MoE, state-space, test-time compute) overcome it?',
    color: '#3B82F6'
  },
  {
    icon: BookOpen,
    title: 'Collaborative Sci-Fi Story Relay',
    category: 'Creative',
    prompt: 'Let\'s write a collaborative sci-fi story about a rogue satellite awakening on the edge of the solar system. Each AI add one dramatic paragraph continuing the previous!',
    color: '#EC4899'
  }
];

export const QuickPromptsModal: React.FC<QuickPromptsModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-[#2B2D31] rounded-2xl border border-[#35363C] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1F2023] flex items-center justify-between bg-[#232428]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Council Debate Starters</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#35373C] text-[#949BA4] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Prompts */}
        <div className="p-4 max-h-[70vh] overflow-y-auto space-y-2.5">
          <p className="text-xs text-[#949BA4] px-1 mb-2">
            Select a starter prompt below. It will be sent to all 11 AI models to spark an exciting debate in Discord!
          </p>

          {QUICK_PROMPTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  onSelectPrompt(item.prompt);
                  onClose();
                }}
                className="w-full p-3.5 bg-[#1E1F22] hover:bg-[#313338] border border-[#27272A] hover:border-[#5865F2]/50 rounded-xl text-left transition-all group cursor-pointer flex items-start gap-3.5"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: `${item.color}20`, color: item.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white text-sm group-hover:text-[#5865F2] transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#2B2D31] text-[#949BA4]">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#949BA4] line-clamp-2 leading-relaxed">
                    {item.prompt}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
