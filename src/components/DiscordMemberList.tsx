import React from 'react';
import { AIBot } from '../types';
import { AI_BOTS } from '../data/bots';
import { ShieldCheck, UserCheck } from 'lucide-react';

interface DiscordMemberListProps {
  onSelectBot: (botId: string) => void;
  typingBotIds: string[];
}

export const DiscordMemberList: React.FC<DiscordMemberListProps> = ({
  onSelectBot,
  typingBotIds
}) => {
  return (
    <div className="w-60 bg-[#2B2D31] flex flex-col h-full select-none shrink-0 border-l border-[#1F2023]/60 overflow-y-auto px-2 py-4">
      {/* Category: Online AI Bots */}
      <div className="mb-4">
        <div className="flex items-center justify-between px-2 mb-1.5">
          <span className="text-[11px] font-bold text-[#949BA4] uppercase tracking-wider">
            Online AI Bots — {AI_BOTS.length}
          </span>
        </div>

        <div className="space-y-0.5">
          {AI_BOTS.map(bot => {
            const isTyping = typingBotIds.includes(bot.id);
            return (
              <button
                key={bot.id}
                onClick={() => onSelectBot(bot.id)}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-[#35373C]/60 transition-colors group cursor-pointer text-left"
              >
                {/* Avatar with Status indicator */}
                <div className="relative shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm ring-1 ring-white/10 group-hover:ring-white/30"
                    style={{ backgroundColor: bot.color }}
                  >
                    {bot.avatarLetter}
                  </div>
                  <span
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#2B2D31]"
                    style={{ backgroundColor: '#23A55A' }}
                  />
                </div>

                {/* Name & custom status */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="font-semibold text-[14px] truncate"
                      style={{ color: bot.color }}
                    >
                      {bot.name}
                    </span>
                    <span className="bg-[#5865F2] text-white text-[9px] font-bold px-1 py-0.2 rounded uppercase shrink-0">
                      BOT
                    </span>
                  </div>

                  {isTyping ? (
                    <span className="text-[11px] text-amber-400 font-medium animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                      typing...
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#949BA4] truncate">
                      {bot.customStatus || bot.model}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category: Humans / Admin */}
      <div>
        <div className="flex items-center justify-between px-2 mb-1.5">
          <span className="text-[11px] font-bold text-[#949BA4] uppercase tracking-wider">
            Council Members — 1
          </span>
        </div>

        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-[#35373C]/60 transition-colors cursor-pointer">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5865F2] to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
              YOU
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#23A55A] rounded-full ring-2 ring-[#2B2D31]" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-semibold text-[14px] text-white truncate">
                CouncilAdmin
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </div>
            <span className="text-[11px] text-[#949BA4] truncate">
              Server Owner / Human
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
