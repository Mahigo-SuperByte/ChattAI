import React from 'react';
import {
  Hash,
  Volume2,
  ChevronDown,
  Sparkles,
  Mic,
  MicOff,
  Headphones,
  Settings,
  Bot,
  Radio,
  Zap,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { DiscordChannel, AIBot } from '../types';
import { CHANNELS } from '../data/channels';
import { AI_BOTS } from '../data/bots';
import { discordAudio } from '../services/audioService';

interface DiscordChannelsSidebarProps {
  activeView: 'council' | 'dms';
  currentChannelId: string;
  onSelectChannel: (channelId: string) => void;
  selectedDmBotId: string | null;
  onSelectDmBot: (botId: string) => void;
  isRoundtableRunning: boolean;
  onToggleRoundtable: () => void;
  audioMuted: boolean;
  onOpenSettings?: () => void;
}

export const DiscordChannelsSidebar: React.FC<DiscordChannelsSidebarProps> = ({
  activeView,
  currentChannelId,
  onSelectChannel,
  selectedDmBotId,
  onSelectDmBot,
  isRoundtableRunning,
  onToggleRoundtable,
  audioMuted,
  onOpenSettings
}) => {
  const [micMuted, setMicMuted] = React.useState(false);
  const [deafened, setDeafened] = React.useState(false);

  return (
    <div className="w-60 bg-[#2B2D31] flex flex-col h-full select-none shrink-0 border-r border-[#1F2023]/60">
      {/* Server Header */}
      <div className="h-12 border-b border-[#1F2023] px-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-[#35373C]/60 transition-colors">
        {activeView === 'council' ? (
          <div className="flex items-center gap-2 font-bold text-white text-[15px] truncate">
            <span className="truncate">AI Council</span>
            <span title="Verified AI Guild" className="text-[#5865F2] shrink-0">
              <ShieldCheck className="w-4 h-4 fill-[#5865F2] text-white" />
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 font-bold text-white text-[15px]">
            <Bot className="w-4 h-4 text-[#5865F2]" />
            <span>Direct Messages</span>
          </div>
        )}
        <ChevronDown className="w-4 h-4 text-[#949BA4]" />
      </div>

      {/* Puter.js banner strip */}
      <div className="mx-2.5 my-2 px-3 py-2 bg-[#1E1F22] rounded-md border border-[#35373C] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[#DBDEE1] font-medium text-[11px]">11 AIs Connected</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-mono font-semibold bg-emerald-950/60 px-1.5 py-0.5 rounded">
          Puter.js
        </span>
      </div>

      {/* Channels Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 py-2">
        {activeView === 'council' ? (
          <>
            {/* Auto-Talk Control Box */}
            <div className="px-2">
              <button
                onClick={onToggleRoundtable}
                className={`w-full py-1.5 px-2.5 rounded text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  isRoundtableRunning
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                    : 'bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-sm'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  <span>{isRoundtableRunning ? 'Stop AI Debate' : 'Auto AI Debate'}</span>
                </div>
                <span className="text-[10px] opacity-80 uppercase tracking-wider font-mono">
                  {isRoundtableRunning ? 'Live' : 'Start'}
                </span>
              </button>
            </div>

            {/* Category: TEXT CHANNELS */}
            <div>
              <div className="flex items-center justify-between px-2 mb-1 group">
                <span className="text-[11px] font-bold text-[#949BA4] tracking-wider uppercase">
                  Text Channels
                </span>
                <span className="text-[11px] text-[#949BA4] font-mono">4</span>
              </div>

              <div className="space-y-0.5">
                {CHANNELS.filter(c => c.type === 'text').map(channel => {
                  const isActive = currentChannelId === channel.id;
                  return (
                    <button
                      key={channel.id}
                      onClick={() => {
                        discordAudio.playSendSound();
                        onSelectChannel(channel.id);
                      }}
                      className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[14px] font-medium transition-colors cursor-pointer group ${
                        isActive
                          ? 'bg-[#35373C] text-white font-semibold'
                          : 'text-[#949BA4] hover:bg-[#35373C]/40 hover:text-[#DBDEE1]'
                      }`}
                    >
                      <Hash className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#80848E]'}`} />
                      <span className="truncate">{channel.name}</span>
                      {channel.id === 'general-lounge' && (
                        <span className="ml-auto text-[9px] bg-[#5865F2] text-white px-1.5 py-0.2 rounded font-bold">
                          ALL
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category: VOICE CHANNELS */}
            <div>
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-[11px] font-bold text-[#949BA4] tracking-wider uppercase">
                  Voice Channels
                </span>
              </div>

              <div className="space-y-0.5">
                {CHANNELS.filter(c => c.type === 'voice').map(channel => {
                  const isActive = currentChannelId === channel.id;
                  return (
                    <button
                      key={channel.id}
                      onClick={() => {
                        discordAudio.playJoinSound();
                        onSelectChannel(channel.id);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[14px] font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#35373C] text-white font-semibold'
                          : 'text-[#949BA4] hover:bg-[#35373C]/40 hover:text-[#DBDEE1]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Volume2 className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#23A55A]' : 'text-[#80848E]'}`} />
                        <span className="truncate">AI Voice Stage</span>
                      </div>
                      <span className="text-[10px] text-[#23A55A] font-semibold bg-[#23A55A]/10 px-1.5 py-0.5 rounded">
                        11 Live
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category: 1-ON-1 QUICK ACCESS */}
            <div>
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-[11px] font-bold text-[#949BA4] tracking-wider uppercase">
                  Direct AI Channels
                </span>
              </div>
              <div className="space-y-0.5">
                {AI_BOTS.slice(0, 5).map(bot => (
                  <button
                    key={bot.id}
                    onClick={() => {
                      onSelectDmBot(bot.id);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-[13px] text-[#949BA4] hover:bg-[#35373C]/40 hover:text-[#DBDEE1] transition-colors cursor-pointer"
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: bot.color }}
                    />
                    <span className="truncate">@{bot.name}</span>
                    <span className="ml-auto text-[9px] text-[#80848E] font-mono">{bot.provider}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Direct Messages View */
          <div>
            <div className="px-2 mb-2">
              <span className="text-[11px] font-bold text-[#949BA4] tracking-wider uppercase">
                Frontier Bots ({AI_BOTS.length})
              </span>
            </div>
            <div className="space-y-1">
              {AI_BOTS.map(bot => {
                const isActive = selectedDmBotId === bot.id;
                return (
                  <button
                    key={bot.id}
                    onClick={() => onSelectDmBot(bot.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#35373C] text-white font-medium'
                        : 'text-[#949BA4] hover:bg-[#35373C]/40 hover:text-[#DBDEE1]'
                    }`}
                  >
                    <div className="relative">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm"
                        style={{ backgroundColor: bot.color }}
                      >
                        {bot.avatarLetter}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#23A55A] rounded-full ring-2 ring-[#2B2D31]" />
                    </div>
                    <div className="flex flex-col text-left truncate">
                      <span className="truncate text-white font-medium text-[13px]">{bot.name}</span>
                      <span className="text-[10px] text-[#949BA4] truncate">{bot.model}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* User Footer Panel */}
      <div className="h-[52px] bg-[#232428] px-2 flex items-center justify-between border-t border-[#1F2023]/60">
        <div className="flex items-center gap-2 px-1 py-1 rounded hover:bg-[#35373C]/60 cursor-pointer transition-colors max-w-[125px]">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5865F2] to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
              YOU
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#23A55A] rounded-full ring-2 ring-[#232428]" />
          </div>
          <div className="flex flex-col truncate">
            <span className="text-[13px] font-bold text-white truncate leading-tight">CouncilAdmin</span>
            <span className="text-[11px] text-[#949BA4] truncate">#0001</span>
          </div>
        </div>

        <div className="flex items-center gap-0.5 text-[#B5BAC1]">
          <button
            onClick={() => setMicMuted(!micMuted)}
            title={micMuted ? 'Unmute Mic' : 'Mute Mic'}
            className={`p-1.5 rounded hover:bg-[#35373C] transition-colors cursor-pointer ${
              micMuted ? 'text-red-400' : 'hover:text-white'
            }`}
          >
            {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setDeafened(!deafened)}
            title={deafened ? 'Undeafen' : 'Deafen'}
            className={`p-1.5 rounded hover:bg-[#35373C] transition-colors cursor-pointer ${
              deafened ? 'text-red-400' : 'hover:text-white'
            }`}
          >
            <Headphones className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSettings}
            title="Discord AI Settings"
            className="p-1.5 rounded hover:bg-[#35373C] hover:text-white transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
