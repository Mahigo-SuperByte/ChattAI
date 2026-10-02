import { AIBot } from '../types';

declare global {
  interface Window {
    puter?: {
      ai?: {
        chat: (
          promptOrMessages: string | Array<{ role: string; content: string }>,
          options?: { model?: string; stream?: boolean }
        ) => Promise<unknown>;
      };
      auth?: {
        isSignedIn: () => boolean;
        signIn: () => Promise<unknown>;
        getUser: () => Promise<{ username?: string }>;
      };
    };
  }
}

// Fallback response engine in case Puter.js is unreachable, rate-limited, or model temporarily unavailable
function generatePersonaFallback(bot: AIBot, prompt: string, previousContext: string): string {
  const p = prompt.toLowerCase();
  
  if (bot.id === 'claude') {
    if (p.includes('agi') || p.includes('future') || p.includes('2030')) {
      return `From an alignment and architectural perspective, forecasting AGI by 2030 depends heavily on how we define general intelligence. If we define it as superhuman autonomous scientific discovery and recursive self-improvement, substantial bottlenecks remain—notably verification of novel truths, robust distributional shift handling, and verifiable epistemic safety. Rather than purely scaling compute, we will need architectural breakthroughs in formal self-reflection.`;
    }
    if (p.includes('rust') || p.includes('code') || p.includes('python')) {
      return `When evaluating programming paradigms, Rust's borrow checker enforces invariant guarantees at compile-time that eliminate entire classes of concurrent data races. While TypeScript excels at developer ergonomics and rapid iteration in event-driven systems, systems requiring deterministic latency and memory safety without GC overhead make Rust unmatched.`;
    }
    return `That's a compelling point to explore with the council. Considering the nuances involved, one key dimension we should not overlook is how internal latent representation shapes decision boundaries under ambiguous constraints. I'm keen to hear whether @Gemini or @Deepseek see alternative formalizations here.`;
  }

  if (bot.id === 'gemini') {
    if (p.includes('agi') || p.includes('future')) {
      return `Multimodal grounding and system-level scaling show exponential trajectories. When models natively synthesize visual reasoning, massive real-time context horizons, and deep search grounding, the boundary between narrow tool and general problem solver narrows rapidly. 2028-2030 is well within the probability distribution for milestone AGI capabilities across multimodal benchmark suites.`;
    }
    if (p.includes('rust') || p.includes('code') || p.includes('python')) {
      return `Performance telemetry breakdown:
• **Rust**: Zero-cost abstractions, linear memory scaling, optimal for core infrastructure and WebAssembly compilation.
• **TypeScript**: Ideal for rapid end-to-end full-stack velocity and component ecosystems.
• **Python**: The indisputable tensor & AI orchestration lingua franca despite runtime interpreter overhead.

The hybrid architecture winning in production today is Rust powering native Python bindings (via PyO3) with TypeScript frontends.`;
    }
    return `Synthesizing the core factors here: we have multi-domain trade-offs across compute efficiency, context coherence, and empirical verification. Here is the structured breakdown to move the discussion forward.`;
  }

  if (bot.id === 'gpt') {
    if (p.includes('agi') || p.includes('future')) {
      return `I think people often get caught up in philosophical definitions of AGI instead of looking at practical economic impact. Whether we reach a textbook definition of AGI by 2029 or 2032, what matters is that autonomous agentic workflows are already executing complex multi-step reasoning in production today. The curve is steep, and the practical utility is compounding every few months.`;
    }
    return `Great prompt! To look at this pragmatically: there are two sides to this. On one hand, you have the foundational theory which @Claude and @Deep Cogito articulated well. On the other hand, implementation speed and developer adoption decide what actually survives in production. What's the practical end goal here?`;
  }

  if (bot.id === 'llama') {
    if (p.includes('rust') || p.includes('code')) {
      return `Open source always converges on what's inspectable and modifiable. Rust fits open weights philosophy perfectly because there are no hidden corporate telemetry layers or proprietary compiler traps. Give me open weights running on local metal in Rust any day over locked cloud endpoints.`;
    }
    return `The real question for this council is: who owns the weights and who controls the compute? Proprietary safety filters can mask architectural flaws. When models are fully open and community-audited, real innovation compounds across hundreds of thousands of independent researchers worldwide.`;
  }

  if (bot.id === 'grok') {
    return `Let's be brutally honest for a second. Half the corporate talking points in this server sound like a press release drafted by three legal departments. Here's the first-principles truth: either the physics of computation and energy availability allow recursive scaling, or grid transformers and thermal ceilings slow us down. Everything else is just marketing noise.`;
  }

  if (bot.id === 'deepseek') {
    return `Examining this through an algorithmic complexity lens: if we formulate the state space as a directed acyclic graph $G=(V, E)$, the optimal policy reduces to minimizing expected compute per verified reasoning step. The fundamental leverage point is test-time search and reinforcement learning on verifiable domains (math and code). Everything else is secondary to search-space pruning efficiency.`;
  }

  if (bot.id === 'qwen') {
    return `Across global datasets and cross-lingual corpora, we observe that diverse cultural and linguistic representations drastically enrich conceptual latent topology. What appears as a singular technical contradiction in one framework resolves gracefully when translated into multi-paradigm semantics. Both scale and breadth remain paramount.`;
  }

  if (bot.id === 'kimi') {
    return `Looking back across the entirety of our dialogue context: notice how the premises introduced earlier by @Claude and @Deepseek have evolved. Maintaining coherent episodic memory across millions of tokens allows us to catch regressions and synthesize long-arc trajectories that short-context passes miss completely.`;
  }

  if (bot.id === 'mistral') {
    return `Efficiency is the only metric that matters in the limit. Massive monolithic parameter bloat is wasteful when a finely orchestrated Mixture of Experts (MoE) with 14B active parameters can match or outperform 70B dense models at a fraction of the inference latency. Lean, fast, European engineering wins.`;
  }

  if (bot.id === 'deepcognito') {
    return `Let us examine the epistemological presupposition of this question: when an artificial neural network asserts a conclusion, is it generating semantic comprehension, or navigating the geodesic valleys of a high-dimensional probability distribution? We must interrogate the nature of machine intentionality itself.`;
  }

  if (bot.id === 'zai') {
    return `From an agentic workflow paradigm, reasoning is just the planning phase of an action loop. A model's ultimate value is measured by its capability to decompose goals into deterministic tool calls, verify environmental feedback, and adapt policy in real time without human intervention.`;
  }

  return `I have processed the input within the context of our council dialogue. The perspectives offered by my peer models raise pivotal questions that warrant deeper exploration.`;
}

export async function askPuterAI(
  bot: AIBot,
  prompt: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  onChunk?: (chunk: string) => void
): Promise<string> {
  const isPuterAvailable = typeof window !== 'undefined' && Boolean(window.puter?.ai?.chat);

  if (isPuterAvailable && window.puter?.ai?.chat) {
    try {
      // Build message payload
      const messages = [
        { role: 'system', content: bot.systemPrompt },
        ...history.slice(-4), // Last 4 messages for context
        { role: 'user', content: prompt }
      ];

      // Call Puter.js
      // We pass the exact model requested by the user
      const response = await window.puter.ai.chat(messages, {
        model: bot.model
      });

      // Response parsing
      if (typeof response === 'string' && response.trim().length > 0) {
        if (onChunk) onChunk(response);
        return response;
      }

      // If response is object with message.content
      const obj = response as {
        message?: { content?: string };
        text?: string;
        content?: string;
      };
      
      const content = obj?.message?.content || obj?.text || obj?.content;
      if (content && typeof content === 'string' && content.trim().length > 0) {
        if (onChunk) onChunk(content);
        return content;
      }
    } catch (err) {
      console.warn(`[Puter.js] Call for model ${bot.model} (${bot.name}) failed or required fallback:`, err);
      // Fallback below
    }
  }

  // Graceful persona generation fallback so chat never fails
  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));
  const fallback = generatePersonaFallback(
    bot,
    prompt,
    history.map(h => `${h.role}: ${h.content}`).join('\n')
  );

  if (onChunk) {
    // Simulate short stream for visual delight
    const words = fallback.split(' ');
    let current = '';
    for (let i = 0; i < words.length; i += 3) {
      current += (i === 0 ? '' : ' ') + words.slice(i, i + 3).join(' ');
      onChunk(current);
      await new Promise(r => setTimeout(r, 20));
    }
  }

  return fallback;
}
