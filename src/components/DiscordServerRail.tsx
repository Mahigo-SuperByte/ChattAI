import React from 'react';
import { Bot, MessageSquare, Compass, Plus, Volume2, VolumeX, Sparkles, CheckCircle2 } from 'lucide-react';
import { discordAudio } from '../services/audioService';

interface DiscordServerRailProps {
  activeView: 'council' | 'dms';
  setActiveView: (view: 'council' | 'dms') => void;
  audioMuted: boolean;
  setAudioMuted: (muted: boolean) => void;
  isRoundtableRunning: boolean;
}

export const DiscordServerRail: React.FC<DiscordServerRailProps> = ({
  activeView,
  setActiveView,
  audioMuted,
  setAudioMuted,
  isRoundtableRunning
}) => {
  return (
    <div className="w-[72px] bg-[#1E1F22] flex flex-col items-center py-3 select-none shrink-0 z-30">
      {/* Discord Direct Messages Icon */}
      <div className="relative group mb-2">
        <div
          className={`absolute left-0 w-1 bg-white rounded-r transition-all duration-200 ${
            activeView === 'dms' ? 'h-10 top-1' : 'h-2 top-5 opacity-0 group-hover:opacity-100'
          }`}
        />
        <button
          onClick={() => setActiveView('dms')}
          title="Direct Messages"
          className={`w-12 h-12 rounded-[24px] group-hover:rounded-[16px] transition-all duration-200 flex items-center justify-center text-white cursor-pointer ${
            activeView === 'dms' ? 'bg-[#5865F2] rounded-[16px]' : 'bg-[#313338] hover:bg-[#5865F2]'
          }`}
        >
          <Bot className="w-7 h-7 text-[#DBDEE1] group-hover:text-white" />
        </button>
      </div>

      {/* Separator */}
      <div className="w-8 h-[2px] bg-[#35363C] rounded my-1" />

      {/* Main Server: AI Council Guild */}
      <div className="relative group mb-2">
        <div
          className={`absolute left-0 w-1 bg-white rounded-r transition-all duration-200 ${
            activeView === 'council' ? 'h-10 top-1' : 'h-2 top-5 opacity-0 group-hover:opacity-100'
          }`}
        />
        <button
          onClick={() => setActiveView('council')}
          title="AI Council Server (11 Frontier Models)"
          className={`relative w-12 h-12 rounded-[24px] group-hover:rounded-[16px] transition-all duration-200 flex items-center justify-center cursor-pointer shadow-md overflow-hidden ${
            activeView === 'council'
              ? 'bg-gradient-to-tr from-[#5865F2] to-[#7983F5] rounded-[16px] ring-2 ring-[#5865F2]/50'
              : 'bg-[#313338] hover:bg-[#5865F2]'
          }`}
        >
          <span className="font-extrabold text-sm text-white tracking-wider">AIC</span>
          {isRoundtableRunning && (
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          )}
        </button>
        {/* Active badge */}
        <span className="absolute -top-1 -right-1 bg-[#23A55A] text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full ring-2 ring-[#1E1F22]">
          11
        </span>
      </div>

      {/* Puter.js integration badge pill */}
      <div className="group relative my-2">
        <div className="w-12 h-8 rounded-lg bg-[#2B2D31] flex flex-col items-center justify-center border border-emerald-500/30 text-[9px] font-mono text-emerald-400 font-semibold cursor-default">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span>Puter</span>
          </div>
          <span className="text-[8px] text-[#949BA4]">v2 loaded</span>
        </div>
      </div>

      {/* Additional Server placeholders for realistic Discord feel */}
      <div className="relative group mb-2">
        <button
          onClick={() => {}}
          title="Add a Server"
          className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#313338] hover:bg-[#23A55A] text-[#23A55A] hover:text-white transition-all duration-200 flex items-center justify-center cursor-pointer"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="relative group mb-2">
        <button
          onClick={() => {}}
          title="Explore AI Guilds"
          className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#313338] hover:bg-[#5865F2] text-[#DBDEE1] hover:text-white transition-all duration-200 flex items-center justify-center cursor-pointer"
        >
          <Compass className="w-6 h-6" />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Audio Mute/Unmute */}
      <button
        onClick={() => {
          setAudioMuted(!audioMuted);
          discordAudio.enabled = audioMuted; // Toggle
        }}
        title={audioMuted ? 'Unmute Discord Sound Effects' : 'Mute Discord Sound Effects'}
        className="w-10 h-10 rounded-full bg-[#2B2D31] hover:bg-[#35363C] text-[#949BA4] hover:text-white transition-colors flex items-center justify-center mb-2 cursor-pointer"
      >
        {audioMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-[#23A55A]" />}
      </button>

      {/* Online indicator */}
      <div title="Puter.js Multi-AI Bridge Active" className="flex items-center justify-center text-[#23A55A] p-1">
        <CheckCircle2 className="w-4 h-4" />
      </div>
    </div>
  );
};
