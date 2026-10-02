import React, { useState } from 'react';
import { X, Bot, ShieldCheck, Volume2, MessageSquare, Terminal, Sparkles, Check } from 'lucide-react';
import { AIBot } from '../types';
import { discordAudio } from '../services/audioService';

interface DiscordUserProfileModalProps {
  bot: AIBot;
  onClose: () => void;
  onMention: (botName: string) => void;
  onDirectMessage: (botId: string) => void;
  onUpdateSystemPrompt: (botId: string, newPrompt: string) => void;
}

export const DiscordUserProfileModal: React.FC<DiscordUserProfileModalProps> = ({
  bot,
  onClose,
  onMention,
  onDirectMessage,
  onUpdateSystemPrompt
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'prompt'>('about');
  const [editedPrompt, setEditedPrompt] = useState(bot.systemPrompt);
  const [saved, setSaved] = useState(false);

  const handleSavePrompt = () => {
    onUpdateSystemPrompt(bot.id, editedPrompt);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-[#232428] rounded-2xl overflow-hidden shadow-2xl border border-[#35363C] relative animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Banner with bot's color */}
        <div
          className="h-28 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${bot.color} 0%, #1E1F22 100%)`
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-2 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-mono text-white/90">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Puter.js Connected</span>
          </div>
        </div>

        {/* Avatar & Badges Section */}
        <div className="px-5 pt-0 pb-4 relative">
          {/* Large Avatar overlapping banner */}
          <div className="relative -mt-12 mb-3 inline-block">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl text-white shadow-xl ring-6 ring-[#232428]"
              style={{ backgroundColor: bot.color }}
            >
              {bot.avatarLetter}
            </div>
            <span
              className="absolute bottom-1 right-1 w-5 h-5 rounded-full ring-4 ring-[#232428] flex items-center justify-center"
              style={{ backgroundColor: '#23A55A' }}
              title="Online"
            />
          </div>

          {/* Name & Badges */}
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white">{bot.name}</h2>
            <span className="bg-[#5865F2] text-white text-[11px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
              BOT
            </span>
            <ShieldCheck className="w-4 h-4 text-[#5865F2]" />
          </div>

          <p className="text-xs font-mono text-[#949BA4] mb-3">{bot.model}</p>

          {/* Tab Selector */}
          <div className="flex border-b border-[#35363C] mb-3 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-2 px-3 transition-colors cursor-pointer ${
                activeTab === 'about'
                  ? 'border-b-2 border-[#5865F2] text-white'
                  : 'text-[#949BA4] hover:text-[#DBDEE1]'
              }`}
            >
              User Profile
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={`pb-2 px-3 transition-colors cursor-pointer flex items-center gap-1 ${
                activeTab === 'prompt'
                  ? 'border-b-2 border-[#5865F2] text-white'
                  : 'text-[#949BA4] hover:text-[#DBDEE1]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>System Prompt & Behavior</span>
            </button>
          </div>

          {/* Content Area */}
          {activeTab === 'about' ? (
            <div className="space-y-3.5 text-xs text-[#DBDEE1]">
              {/* About Me */}
              <div className="bg-[#1E1F22] p-3 rounded-lg border border-[#2B2D31]">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4] mb-1.5">
                  About Me
                </h4>
                <p className="text-sm leading-relaxed text-[#DBDEE1] mb-2">{bot.bio}</p>
                <div className="text-[11px] text-[#949BA4] italic border-l-2 pl-2" style={{ borderColor: bot.color }}>
                  "{bot.personality}"
                </div>
              </div>

              {/* Roles */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4] mb-1.5">
                  Roles & Attributes
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  <span
                    className="px-2.5 py-1 rounded-md text-xs font-semibold text-white flex items-center gap-1.5"
                    style={{ backgroundColor: `${bot.color}25`, border: `1px solid ${bot.color}60` }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bot.color }} />
                    {bot.roleTitle}
                  </span>
                  <span className="px-2 py-1 rounded-md text-xs bg-[#1E1F22] text-[#DBDEE1] border border-[#2B2D31]">
                    Provider: {bot.provider}
                  </span>
                  <span className="px-2 py-1 rounded-md text-xs bg-[#1E1F22] text-[#DBDEE1] border border-[#2B2D31]">
                    Puter AI Bridge
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="bg-[#1E1F22] p-3 rounded-lg border border-[#2B2D31]">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4] mb-1.5">
                  Custom AI Persona Instruction
                </h4>
                <p className="text-[11px] text-[#949BA4] mb-2">
                  Tune how {bot.name} reasons and formats messages in the council.
                </p>
                <textarea
                  value={editedPrompt}
                  onChange={e => setEditedPrompt(e.target.value)}
                  rows={5}
                  className="w-full bg-[#111214] text-white p-2.5 rounded-md font-mono text-xs border border-[#35363C] focus:outline-none focus:border-[#5865F2] resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSavePrompt}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded text-xs transition-colors cursor-pointer"
                  >
                    {saved ? <Check className="w-3.5 h-3.5" /> : null}
                    <span>{saved ? 'Updated!' : 'Save System Prompt'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#35363C]">
            <button
              onClick={() => {
                onMention(bot.name);
                onClose();
              }}
              className="py-2 px-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>@Mention</span>
            </button>

            <button
              onClick={() => {
                onDirectMessage(bot.id);
                onClose();
              }}
              className="py-2 px-2 bg-[#313338] hover:bg-[#35373C] text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>1-on-1 DM</span>
            </button>

            <button
              onClick={() => discordAudio.speakText(`Hello! I am ${bot.name}, powered by model ${bot.model}.`, bot.id)}
              className="py-2 px-2 bg-[#313338] hover:bg-[#35373C] text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voice Sample</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
