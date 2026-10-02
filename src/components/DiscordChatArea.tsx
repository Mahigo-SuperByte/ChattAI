import React, { useState, useRef, useEffect } from 'react';
import {
  Hash,
  Bell,
  Pin,
  Users,
  Search,
  PlusCircle,
  Sparkles,
  Send,
  X,
  Radio,
  Trash2,
  CheckSquare,
  Square,
  Flame,
  Volume2
} from 'lucide-react';
import { ChatMessage, DiscordChannel, AIBot } from '../types';
import { AI_BOTS, getBotById } from '../data/bots';
import { DiscordMessageItem } from './DiscordMessageItem';
import { QuickPromptsModal } from './QuickPromptsModal';
import { discordAudio } from '../services/audioService';

interface DiscordChatAreaProps {
  channel: DiscordChannel;
  messages: ChatMessage[];
  onSendMessage: (content: string, targetBotIds: string[], replyTo?: ChatMessage) => void;
  typingBotIds: string[];
  onOpenProfile: (botId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onClearChannel: (channelId: string) => void;
  showMemberList: boolean;
  setShowMemberList: (show: boolean) => void;
  isRoundtableRunning: boolean;
  onToggleRoundtable: () => void;
  onPromptOthersToRespond: (message: ChatMessage) => void;
}

export const DiscordChatArea: React.FC<DiscordChatAreaProps> = ({
  channel,
  messages,
  onSendMessage,
  typingBotIds,
  onOpenProfile,
  onReact,
  onClearChannel,
  showMemberList,
  setShowMemberList,
  isRoundtableRunning,
  onToggleRoundtable,
  onPromptOthersToRespond
}) => {
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [selectedBotIds, setSelectedBotIds] = useState<string[]>(AI_BOTS.map(b => b.id)); // Default: ALL AIs
  const [sendToAll, setSendToAll] = useState(true);
  const [showQuickPrompts, setShowQuickPrompts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingBotIds]);

  // Handle toggling "Send to All"
  const handleToggleSendToAll = () => {
    if (sendToAll) {
      // Switch to single or empty
      setSendToAll(false);
      setSelectedBotIds(['claude']); // default to first bot if unchecked
    } else {
      setSendToAll(true);
      setSelectedBotIds(AI_BOTS.map(b => b.id));
    }
  };

  const handleToggleBot = (botId: string) => {
    if (sendToAll) {
      setSendToAll(false);
      setSelectedBotIds([botId]);
      return;
    }

    if (selectedBotIds.includes(botId)) {
      const next = selectedBotIds.filter(id => id !== botId);
      setSelectedBotIds(next.length === 0 ? ['claude'] : next);
      setSendToAll(false);
    } else {
      const next = [...selectedBotIds, botId];
      setSelectedBotIds(next);
      if (next.length === AI_BOTS.length) {
        setSendToAll(true);
      }
    }
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;

    // Check if input contains an explicit @mention
    let targets = sendToAll ? AI_BOTS.map(b => b.id) : selectedBotIds;
    
    // If user explicitly mentions @Claude or @gemini, include that bot
    AI_BOTS.forEach(bot => {
      if (text.toLowerCase().includes(`@${bot.name.toLowerCase()}`)) {
        if (!targets.includes(bot.id)) {
          targets = [...targets, bot.id];
        }
      }
    });

    onSendMessage(text, targets, replyingTo || undefined);
    setInputText('');
    setReplyingTo(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Reply handler from child message
  const handleSetReply = (msg: ChatMessage) => {
    setReplyingTo(msg);
    // If replying to a specific bot, preselect that bot or leave send to all
    if (msg.isBot) {
      setInputText(`@${msg.senderName} `);
    }
    textareaRef.current?.focus();
  };

  // Filter messages by search if searching
  const filteredMessages = searchQuery.trim()
    ? messages.filter(
        m =>
          m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  // Typing indicator text
  const getTypingText = () => {
    if (typingBotIds.length === 0) return null;
    const names = typingBotIds
      .map(id => getBotById(id)?.name)
      .filter(Boolean) as string[];

    if (names.length === 1) {
      return `${names[0]} is typing...`;
    } else if (names.length === 2) {
      return `${names[0]} and ${names[1]} are typing...`;
    } else if (names.length > 2) {
      return `${names[0]}, ${names[1]}, and ${names.length - 2} others are typing...`;
    }
    return 'Several AIs are typing...';
  };

  return (
    <div className="flex-1 bg-[#313338] flex flex-col h-full overflow-hidden select-none relative">
      {/* Top Channel Header Bar */}
      <div className="h-12 border-b border-[#1F2023] px-4 flex items-center justify-between shadow-xs bg-[#313338] shrink-0 z-10">
        <div className="flex items-center gap-2 min-w-0">
          <Hash className="w-6 h-6 text-[#80848E] shrink-0" />
          <h3 className="font-bold text-white text-[15px] truncate">{channel.name}</h3>
          <span className="hidden sm:inline-block w-[1px] h-4 bg-[#3F4147] mx-1" />
          <p className="hidden md:inline-block text-xs text-[#949BA4] truncate max-w-sm">
            {channel.topic}
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5 text-[#B5BAC1]">
          {/* Quick Debate Starter */}
          <button
            onClick={() => setShowQuickPrompts(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#35373C] hover:bg-[#5865F2] hover:text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
            title="Debate Prompts"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Debate Prompts</span>
          </button>

          {/* Auto-Talk Round Table Button */}
          <button
            onClick={onToggleRoundtable}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              isRoundtableRunning
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-[#35373C] hover:bg-[#3F4147] text-white'
            }`}
            title="Toggle autonomous AI debate"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isRoundtableRunning ? 'Debating' : 'Auto-Talk'}</span>
          </button>

          {/* Search Bar */}
          <div className="relative hidden lg:flex items-center">
            <input
              type="text"
              placeholder="Search chat..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#1E1F22] text-xs text-white placeholder-[#80848E] px-2.5 py-1 rounded pr-6 w-36 focus:w-48 transition-all border border-transparent focus:border-[#5865F2] focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-[#80848E] absolute right-2 pointer-events-none" />
          </div>

          {/* Clear Channel Messages */}
          <button
            onClick={() => onClearChannel(channel.id)}
            title="Clear Chat History"
            className="p-1.5 rounded hover:bg-[#35373C] hover:text-white transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Toggle Member List */}
          <button
            onClick={() => setShowMemberList(!showMemberList)}
            title={showMemberList ? 'Hide Member List' : 'Show Member List'}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              showMemberList ? 'bg-[#35373C] text-white' : 'hover:bg-[#35373C] text-[#B5BAC1]'
            }`}
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col justify-between py-4">
        <div className="space-y-3">
          {/* Welcome Banner at channel top */}
          <div className="px-4 pt-4 pb-2">
            <div className="w-14 h-14 rounded-full bg-[#35373C] flex items-center justify-center mb-2">
              <Hash className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Welcome to #{channel.name}!</h2>
            <p className="text-xs text-[#949BA4] mt-1 max-w-xl">
              This is the start of the #{channel.name} channel. Claude, Gemini, ChatGPT, Llama, Grok, Deepseek, Qwen, Kimi, Mistral, Deep Cogito, and Z.ai are all connected and ready to converse via Puter.js!
            </p>
            <div className="w-full h-[1px] bg-[#35363C] my-4" />
          </div>

          {/* Message List */}
          {filteredMessages.map(message => {
            const bot = message.isBot ? getBotById(message.senderId) : undefined;
            return (
              <DiscordMessageItem
                key={message.id}
                message={message}
                bot={bot}
                onOpenProfile={onOpenProfile}
                onReply={handleSetReply}
                onReact={onReact}
                onPromptOthersToRespond={onPromptOthersToRespond}
              />
            );
          })}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Typing Indicator Bar */}
      <div className="h-6 px-4 flex items-center gap-2 text-xs text-[#949BA4] select-none shrink-0">
        {typingBotIds.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#949BA4] rounded-full typing-dot-1" />
              <span className="w-1.5 h-1.5 bg-[#949BA4] rounded-full typing-dot-2" />
              <span className="w-1.5 h-1.5 bg-[#949BA4] rounded-full typing-dot-3" />
            </div>
            <span className="font-semibold text-white/90">{getTypingText()}</span>
          </div>
        )}
      </div>

      {/* Rich Message Input Area */}
      <div className="px-4 pb-4 shrink-0">
        {/* Reply Bar if user clicked reply */}
        {replyingTo && (
          <div className="bg-[#2B2D31] rounded-t-lg px-3 py-1.5 border-t border-x border-[#3F4147] flex items-center justify-between text-xs text-[#B5BAC1]">
            <div className="flex items-center gap-2 truncate">
              <span>Replying to</span>
              <span className="font-bold text-white">@{replyingTo.senderName}</span>
              <span className="italic truncate max-w-sm opacity-70">"{replyingTo.content.slice(0, 60)}..."</span>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-[#949BA4] hover:text-white cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* AI Target Selector Bar - EXPLICIT USER REQUIREMENT */}
        <div
          className={`bg-[#2B2D31] px-3 py-1.5 border-[#3F4147] flex items-center justify-between gap-2 overflow-x-auto text-xs ${
            replyingTo ? 'border-x' : 'rounded-t-lg border-t border-x'
          }`}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            {/* SEND TO ALL AI BUTTON */}
            <button
              onClick={handleToggleSendToAll}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs transition-all cursor-pointer shadow-sm ${
                sendToAll
                  ? 'bg-gradient-to-r from-[#5865F2] to-indigo-600 text-white ring-2 ring-[#5865F2]/40'
                  : 'bg-[#1E1F22] hover:bg-[#35373C] text-[#949BA4]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Send to All 11 AIs</span>
              <span className="bg-white/20 px-1 py-0.2 rounded text-[10px]">
                {sendToAll ? 'ACTIVE' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Individual Bot Chips */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {AI_BOTS.map(bot => {
              const isSelected = sendToAll || selectedBotIds.includes(bot.id);
              return (
                <button
                  key={bot.id}
                  onClick={() => handleToggleBot(bot.id)}
                  title={`${bot.name} (${bot.model})`}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#1E1F22] text-white shadow-xs'
                      : 'opacity-40 hover:opacity-80 bg-[#1E1F22]/50 text-[#80848E]'
                  }`}
                  style={{
                    borderColor: isSelected ? bot.color : 'transparent',
                    borderWidth: '1px'
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: bot.color }}
                  />
                  <span>{bot.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Area Box */}
        <div
          className={`bg-[#383A40] border-[#3F4147] flex items-center gap-2 p-2.5 ${
            replyingTo ? 'rounded-b-lg border-b border-x' : 'rounded-b-lg border-b border-x'
          }`}
        >
          {/* Quick Prompts trigger */}
          <button
            onClick={() => setShowQuickPrompts(true)}
            title="Debate Topics & Prompts"
            className="w-8 h-8 rounded-full bg-[#4E5058] hover:bg-[#5865F2] text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Text input */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={e => {
              setInputText(e.target.value);
              // auto resize
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              sendToAll
                ? `Message #${channel.name} (Sends to all 11 AIs)...`
                : `Message #${channel.name} (${selectedBotIds.length} AIs selected)...`
            }
            className="flex-1 bg-transparent text-white placeholder-[#80848E] text-[15px] focus:outline-none resize-none max-h-36 leading-normal"
          />

          {/* Right Action: Send */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            title="Send to AI Council"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              inputText.trim()
                ? 'bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-md'
                : 'bg-[#2B2D31] text-[#80848E] cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Prompts Modal */}
      <QuickPromptsModal
        isOpen={showQuickPrompts}
        onClose={() => setShowQuickPrompts(false)}
        onSelectPrompt={p => {
          setInputText(p);
          textareaRef.current?.focus();
        }}
      />
    </div>
  );
};
