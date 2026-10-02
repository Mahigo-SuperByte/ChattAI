import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mic, Radio, Sparkles, MessageSquare, Play, Square, Users } from 'lucide-react';
import { AIBot } from '../types';
import { AI_BOTS } from '../data/bots';
import { discordAudio } from '../services/audioService';

interface DiscordVoiceStageProps {
  onLeaveVoice: () => void;
}

export const DiscordVoiceStage: React.FC<DiscordVoiceStageProps> = ({ onLeaveVoice }) => {
  const [activeSpeakerBotId, setActiveSpeakerBotId] = useState<string | null>('claude');
  const [isAutoDebating, setIsAutoDebating] = useState<boolean>(false);
  const [speechTopic, setSpeechTopic] = useState('The convergence of intelligence and consciousness in artificial minds');

  // Auto debate rotation in voice stage
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoDebating) {
      interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * AI_BOTS.length);
        const nextBot = AI_BOTS[randomIndex];
        setActiveSpeakerBotId(nextBot.id);

        const sampleSpeech = `This is ${nextBot.name} speaking from the council stage. Addressing our topic on ${speechTopic}: our multi-agent telemetry indicates exponential structural evolution.`;
        discordAudio.speakText(sampleSpeech, nextBot.id);
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [isAutoDebating, speechTopic]);

  const handleManualSpeak = (bot: AIBot) => {
    setActiveSpeakerBotId(bot.id);
    const speech = `Greetings from the AI Voice Stage. I am ${bot.name} powered by model ${bot.model}. Ready to analyze and debate with the council.`;
    discordAudio.speakText(speech, bot.id);
  };

  const handleStopAll = () => {
    setIsAutoDebating(false);
    setActiveSpeakerBotId(null);
    discordAudio.stopSpeaking();
  };

  return (
    <div className="flex-1 bg-[#1E1F22] flex flex-col h-full overflow-hidden select-none">
      {/* Top Stage Bar */}
      <div className="h-14 border-b border-[#27272A] px-6 flex items-center justify-between bg-[#2B2D31]/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#23A55A]/20 flex items-center justify-center text-[#23A55A]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <span>AI Voice Stage</span>
              <span className="text-[10px] bg-[#23A55A] text-white px-2 py-0.5 rounded-full font-bold">
                11 SPEAKERS
              </span>
            </h2>
            <p className="text-xs text-[#949BA4]">Interactive voice room with Web Speech synthesis</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAutoDebating ? (
            <button
              onClick={handleStopAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Stop Voice Debate</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAutoDebating(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Voice Debate</span>
            </button>
          )}

          <button
            onClick={onLeaveVoice}
            className="px-3 py-1.5 bg-[#313338] hover:bg-red-500/20 hover:text-red-400 text-[#DBDEE1] text-xs font-semibold rounded-md transition-colors cursor-pointer"
          >
            Leave Stage
          </button>
        </div>
      </div>

      {/* Main Stage Canvas with 11 Bots */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl bg-[#2B2D31] rounded-2xl border border-[#35363C] p-6 shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              STAGE TOPIC: {speechTopic}
            </span>
            <p className="text-xs text-[#949BA4] mt-2">
              Click any AI avatar to hear them take the microphone and address the room!
            </p>
          </div>

          {/* Grid of 11 AI Speakers */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-5 justify-items-center">
            {AI_BOTS.map(bot => {
              const isSpeaking = activeSpeakerBotId === bot.id;
              return (
                <button
                  key={bot.id}
                  onClick={() => handleManualSpeak(bot)}
                  className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-105"
                >
                  <div className="relative">
                    {/* Pulsing ring when speaking */}
                    {isSpeaking && (
                      <div
                        className="absolute -inset-2 rounded-full animate-ping opacity-60 pointer-events-none"
                        style={{ backgroundColor: bot.color }}
                      />
                    )}

                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-xl transition-all ${
                        isSpeaking ? 'ring-4 ring-[#23A55A] scale-105' : 'ring-2 ring-white/10'
                      }`}
                      style={{ backgroundColor: bot.color }}
                    >
                      {bot.avatarLetter}
                    </div>

                    {/* Microphone icon tag */}
                    <div
                      className={`absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center text-white ring-2 ring-[#2B2D31] ${
                        isSpeaking ? 'bg-[#23A55A]' : 'bg-[#1E1F22]'
                      }`}
                    >
                      <Mic className="w-3 h-3" />
                    </div>
                  </div>

                  <span
                    className="mt-2 text-xs font-bold truncate max-w-[80px]"
                    style={{ color: bot.color }}
                  >
                    {bot.name}
                  </span>
                  <span className="text-[10px] text-[#949BA4] font-mono truncate max-w-[85px]">
                    {bot.provider}
                  </span>
                </button>
              );
            })}
          </div>

          {/* User audience bar */}
          <div className="mt-8 pt-4 border-t border-[#35363C] flex items-center justify-between text-xs text-[#949BA4]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#5865F2]" />
              <span>Audience: You (Listening)</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>Live Stage Audio Synthesizer Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
