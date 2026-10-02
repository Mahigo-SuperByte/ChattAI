import React from 'react';
import { X, Volume2, Zap, Shield, Sparkles, Check, RefreshCw, Trash2 } from 'lucide-react';
import { AI_BOTS } from '../data/bots';
import { discordAudio } from '../services/audioService';

interface DiscordSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioMuted: boolean;
  onToggleAudio: () => void;
  onResetAllChats: () => void;
}

export const DiscordSettingsModal: React.FC<DiscordSettingsModalProps> = ({
  isOpen,
  onClose,
  audioMuted,
  onToggleAudio,
  onResetAllChats
}) => {
  if (!isOpen) return null;

  const isPuterLoaded = typeof window !== 'undefined' && Boolean(window.puter?.ai?.chat);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl bg-[#2B2D31] rounded-2xl border border-[#35363C] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1F2023] flex items-center justify-between bg-[#232428]">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#5865F2]" />
            <h3 className="font-bold text-white text-base">Discord AI Council Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#35373C] text-[#949BA4] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-sm">
          {/* Puter.js Status */}
          <div className="bg-[#1E1F22] p-4 rounded-xl border border-[#35363C]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-white">Puter.js v2 SDK Connection</span>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold flex items-center gap-1.5 ${
                  isPuterLoaded
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPuterLoaded ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                {isPuterLoaded ? 'Puter.js Connected' : 'Guest Fallback Active'}
              </span>
            </div>
            <p className="text-xs text-[#949BA4] leading-relaxed">
              All 11 frontier models query <code className="text-amber-300">window.puter.ai.chat(messages, &#123; model &#125;)</code>.
              When loaded, calls dispatch through Puter's decentralized AI proxy.
            </p>
          </div>

          {/* Sound Preferences */}
          <div className="flex items-center justify-between p-4 bg-[#1E1F22] rounded-xl border border-[#35363C]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#35373C] flex items-center justify-center text-white">
                <Volume2 className="w-5 h-5 text-[#5865F2]" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Discord Sound Effects</h4>
                <p className="text-xs text-[#949BA4]">Web Audio synthesized message pings and chimes</p>
              </div>
            </div>
            <button
              onClick={onToggleAudio}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                !audioMuted
                  ? 'bg-[#23A55A] text-white hover:bg-emerald-600'
                  : 'bg-[#35373C] text-[#949BA4] hover:text-white'
              }`}
            >
              {!audioMuted ? 'Enabled' : 'Muted'}
            </button>
          </div>

          {/* Connected AI Bot Registry */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#949BA4] mb-3">
              Active Models Registry ({AI_BOTS.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AI_BOTS.map(bot => (
                <div
                  key={bot.id}
                  className="p-2.5 rounded-lg bg-[#1E1F22] border border-[#2B2D31] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: bot.color }}
                    />
                    <div className="truncate">
                      <span className="font-bold text-white text-xs block truncate">{bot.name}</span>
                      <span className="text-[10px] text-[#80848E] font-mono block truncate">
                        {bot.model}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#949BA4] font-mono uppercase bg-[#2B2D31] px-1.5 py-0.5 rounded shrink-0">
                    {bot.provider}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reset / Clear All Messages */}
          <div className="pt-2 border-t border-[#35363C] flex items-center justify-between">
            <span className="text-xs text-[#949BA4]">Reset all channel conversations to initial state</span>
            <button
              onClick={() => {
                if (window.confirm('Reset all chats to initial welcome messages?')) {
                  onResetAllChats();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset All Channels</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
