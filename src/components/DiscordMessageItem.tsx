import React, { useState } from 'react';
import {
  Smile,
  Reply,
  Volume2,
  Copy,
  Check,
  Sparkles,
  MessageSquareShare,
  CornerDownRight
} from 'lucide-react';
import { ChatMessage, AIBot } from '../types';
import { discordAudio } from '../services/audioService';
import confetti from 'canvas-confetti';

interface DiscordMessageItemProps {
  message: ChatMessage;
  bot?: AIBot;
  onOpenProfile: (botId: string) => void;
  onReply: (message: ChatMessage) => void;
  onReact: (messageId: string, emoji: string) => void;
  onPromptOthersToRespond: (message: ChatMessage) => void;
}

export const DiscordMessageItem: React.FC<DiscordMessageItemProps> = ({
  message,
  bot,
  onOpenProfile,
  onReply,
  onReact,
  onPromptOthersToRespond
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleCopyCodeSnippet = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 1600);
  };

  const triggerReaction = (emoji: string) => {
    onReact(message.id, emoji);
    setShowEmojiPicker(false);
    try {
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#5865F2', '#23A55A', '#FEE75C', '#EB459E']
      });
    } catch {
      // Ignore
    }
  };

  // Helper to render markdown and code blocks
  const renderFormattedContent = (content: string) => {
    // Check for fenced code blocks
    const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'code',
        code: match[2].trim(),
        id: `code-${match.index}`
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex)
      });
    }

    if (parts.length === 0) {
      parts.push({ type: 'text', content });
    }

    return (
      <div className="space-y-2 text-[15px] leading-relaxed text-[#DBDEE1]">
        {parts.map((part, index) => {
          if (part.type === 'code') {
            const isSnippetCopied = copiedCode === part.id;
            return (
              <div
                key={index}
                className="my-2 rounded-md overflow-hidden bg-[#1E1F22] border border-[#27272A] font-mono text-[13px]"
              >
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#2B2D31]/80 border-b border-[#27272A] text-xs text-[#949BA4]">
                  <span className="font-semibold uppercase tracking-wider">{part.language || 'code'}</span>
                  <button
                    onClick={() => handleCopyCodeSnippet(part.code || '', part.id || '')}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-[11px]"
                  >
                    {isSnippetCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 overflow-x-auto text-[#E0E1E5]">
                  <code>{part.code}</code>
                </pre>
              </div>
            );
          }

          // Process normal text with bold, mentions, bullets
          const lines = part.content?.split('\n') || [];
          return (
            <div key={index} className="space-y-1">
              {lines.map((line, lIdx) => {
                // Mention highlighting (@Claude, @Gemini, etc.)
                let formattedLine = line;

                // Bold replacement
                const segments = formattedLine.split(/(\*\*.*?\*\*)/g);

                return (
                  <p key={lIdx} className="min-h-[1.25rem]">
                    {segments.map((seg, sIdx) => {
                      if (seg.startsWith('**') && seg.endsWith('**')) {
                        return (
                          <strong key={sIdx} className="font-bold text-white">
                            {seg.slice(2, -2)}
                          </strong>
                        );
                      }
                      
                      // Highlight mentions (@Claude, etc.)
                      const mentionRegex = /(@[A-Za-z0-9_.\s]+)/g;
                      const words = seg.split(mentionRegex);
                      return words.map((w, wIdx) => {
                        if (w.startsWith('@') && w.length > 2 && w.length < 20) {
                          return (
                            <span
                              key={wIdx}
                              className="bg-[#5865F2]/20 text-[#5865F2] hover:bg-[#5865F2]/30 px-1 py-0.5 rounded font-medium cursor-pointer transition-colors"
                            >
                              {w}
                            </span>
                          );
                        }
                        return <span key={wIdx}>{w}</span>;
                      });
                    })}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative group py-1.5 px-4 hover:bg-[#2E3035]/50 transition-colors flex gap-4 select-text">
      {/* Floating Action Bar on hover */}
      <div className="absolute right-4 -top-3.5 hidden group-hover:flex items-center bg-[#313338] border border-[#27272A] rounded-md shadow-md py-0.5 px-1 z-10 space-x-0.5">
        {/* Quick Reaction button */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Add Reaction"
            className="p-1.5 hover:bg-[#35373C] text-[#B5BAC1] hover:text-white rounded transition-colors cursor-pointer"
          >
            <Smile className="w-4 h-4" />
          </button>

          {showEmojiPicker && (
            <div className="absolute right-0 top-8 bg-[#2B2D31] border border-[#1F2023] rounded-lg shadow-xl p-2 flex gap-1 z-20">
              {['👍', '🔥', '💡', '🤖', '🧠', '🚀', '❤️', '👏'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => triggerReaction(emoji)}
                  className="w-8 h-8 hover:bg-[#35373C] rounded flex items-center justify-center text-lg transition-transform hover:scale-125 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reply */}
        <button
          onClick={() => onReply(message)}
          title="Reply to this message"
          className="p-1.5 hover:bg-[#35373C] text-[#B5BAC1] hover:text-white rounded transition-colors cursor-pointer"
        >
          <Reply className="w-4 h-4" />
        </button>

        {/* Prompt other AIs to respond to this */}
        {message.isBot && (
          <button
            onClick={() => onPromptOthersToRespond(message)}
            title="Trigger other AIs to debate / reply to this point"
            className="p-1.5 hover:bg-[#5865F2]/30 text-[#5865F2] hover:text-white rounded transition-colors cursor-pointer flex items-center gap-1 text-xs px-2"
          >
            <MessageSquareShare className="w-4 h-4" />
            <span className="text-[11px] font-semibold">Debate this</span>
          </button>
        )}

        {/* TTS Read Aloud */}
        {message.isBot && (
          <button
            onClick={() => discordAudio.speakText(message.content, message.senderId)}
            title="Read aloud with AI voice"
            className="p-1.5 hover:bg-[#35373C] text-[#B5BAC1] hover:text-white rounded transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        )}

        {/* Copy Text */}
        <button
          onClick={handleCopyText}
          title="Copy Text"
          className="p-1.5 hover:bg-[#35373C] text-[#B5BAC1] hover:text-white rounded transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        <button
          onClick={() => message.isBot && onOpenProfile(message.senderId)}
          className="relative block cursor-pointer group/avatar focus:outline-none"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-base shadow-sm ring-1 ring-white/10 group-hover/avatar:ring-2 group-hover/avatar:ring-white/40 transition-all"
            style={{
              backgroundColor: message.senderColor || (bot ? bot.color : '#5865F2')
            }}
          >
            {bot ? bot.avatarLetter : message.senderName[0] || 'U'}
          </div>
          {message.isBot && (
            <span
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-[#313338]"
              style={{ backgroundColor: '#23A55A' }}
              title="Online"
            />
          )}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        {/* Reply Reference Header if present */}
        {message.replyTo && (
          <div className="flex items-center gap-1.5 text-xs text-[#949BA4] mb-1 pl-1">
            <CornerDownRight className="w-3.5 h-3.5 text-[#80848E] shrink-0" />
            <span className="font-semibold text-[#B5BAC1]">@{message.replyTo.senderName}</span>
            <span className="truncate italic max-w-md opacity-80">"{message.replyTo.content}"</span>
          </div>
        )}

        {/* Header row: Username + BOT badge + Model Pill + Timestamp */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <button
            onClick={() => message.isBot && onOpenProfile(message.senderId)}
            className="font-semibold text-[15px] hover:underline cursor-pointer transition-colors"
            style={{ color: message.senderColor || (bot ? bot.color : '#FFFFFF') }}
          >
            {message.senderName}
          </button>

          {message.isBot && (
            <span className="bg-[#5865F2] text-white text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider flex items-center gap-0.5">
              BOT
            </span>
          )}

          {message.model && (
            <span className="text-[11px] font-mono text-[#80848E] bg-[#1E1F22] px-1.5 py-0.5 rounded border border-[#2B2D31]">
              {message.model}
            </span>
          )}

          <span className="text-xs text-[#949BA4]">{message.timestamp}</span>
        </div>

        {/* Message Content */}
        {renderFormattedContent(message.content)}

        {/* Reactions row */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.reactions.map((reaction, rIdx) => {
              const hasReacted = reaction.users.includes('user');
              return (
                <button
                  key={rIdx}
                  onClick={() => triggerReaction(reaction.emoji)}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                    hasReacted
                      ? 'bg-[#5865F2]/20 border-[#5865F2] text-[#5865F2]'
                      : 'bg-[#2B2D31] hover:bg-[#35373C] border-transparent text-[#B5BAC1]'
                  }`}
                >
                  <span>{reaction.emoji}</span>
                  <span className="font-semibold">{reaction.count}</span>
                </button>
              );
            })}

            {/* Quick add reaction button */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="px-2 py-0.5 rounded-md text-xs bg-[#2B2D31] hover:bg-[#35373C] text-[#949BA4] transition-colors cursor-pointer"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
