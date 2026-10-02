import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DiscordServerRail } from './components/DiscordServerRail';
import { DiscordChannelsSidebar } from './components/DiscordChannelsSidebar';
import { DiscordChatArea } from './components/DiscordChatArea';
import { DiscordMemberList } from './components/DiscordMemberList';
import { DiscordUserProfileModal } from './components/DiscordUserProfileModal';
import { DiscordVoiceStage } from './components/DiscordVoiceStage';
import { DiscordSettingsModal } from './components/DiscordSettingsModal';
import { AI_BOTS, getBotById } from './data/bots';
import { CHANNELS, INITIAL_MESSAGES } from './data/channels';
import { ChatMessage, AIBot } from './types';
import { askPuterAI } from './services/puterService';
import { discordAudio } from './services/audioService';

export default function App() {
  const [activeView, setActiveView] = useState<'council' | 'dms'>('council');
  const [currentChannelId, setCurrentChannelId] = useState<string>('general-lounge');
  const [selectedDmBotId, setSelectedDmBotId] = useState<string | null>(null);
  
  // Channels and messages state
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  
  // Bots state (to allow runtime system prompt edits)
  const [botsList, setBotsList] = useState<AIBot[]>(AI_BOTS);
  
  // UI states
  const [typingBotIds, setTypingBotIds] = useState<string[]>([]);
  const [showMemberList, setShowMemberList] = useState(true);
  const [activeProfileBotId, setActiveProfileBotId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  
  // Autonomous AI Roundtable Debate state
  const [isRoundtableRunning, setIsRoundtableRunning] = useState(false);
  const roundtableTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to format timestamp
  const getFormattedTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `Today at ${displayHours}:${minutes} ${ampm}`;
  };

  // Get active channel object
  const activeChannel = CHANNELS.find(c => c.id === currentChannelId) || CHANNELS[0];
  const activeMessages = messagesByChannel[currentChannelId] || [];

  // Send a message from user to designated target bots
  const handleSendMessage = async (
    content: string,
    targetBotIds: string[],
    replyTo?: ChatMessage
  ) => {
    discordAudio.playSendSound();

    const userMessageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      channelId: currentChannelId,
      senderId: 'user',
      senderName: 'CouncilAdmin',
      senderColor: '#5865F2',
      isBot: false,
      content,
      timestamp: getFormattedTime(),
      replyTo: replyTo
        ? {
            id: replyTo.id,
            senderName: replyTo.senderName,
            content: replyTo.content
          }
        : undefined,
      reactions: []
    };

    // Append user message immediately
    setMessagesByChannel(prev => ({
      ...prev,
      [currentChannelId]: [...(prev[currentChannelId] || []), userMessage]
    }));

    // If targetBots is empty, default to all bots
    const botsToRespond = (targetBotIds.length > 0 ? targetBotIds : botsList.map(b => b.id))
      .map(id => botsList.find(b => b.id === id))
      .filter(Boolean) as AIBot[];

    // Set typing indicators for all targeted bots
    setTypingBotIds(botsToRespond.map(b => b.id));

    // Staggered AI responses
    const history = (messagesByChannel[currentChannelId] || []).slice(-6).map(m => ({
      role: (m.isBot ? 'assistant' : 'user') as 'assistant' | 'user',
      content: m.content
    }));

    // Dispatch all AI calls in parallel or staggered sequence
    botsToRespond.forEach((bot, index) => {
      const staggerDelay = Math.min(index * 700 + Math.random() * 400, 4500);

      setTimeout(async () => {
        try {
          const responseText = await askPuterAI(bot, content, history);

          const botMessage: ChatMessage = {
            id: `msg-${Date.now()}-${bot.id}`,
            channelId: currentChannelId,
            senderId: bot.id,
            senderName: bot.name,
            senderColor: bot.color,
            isBot: true,
            model: bot.model,
            content: responseText,
            timestamp: getFormattedTime(),
            replyTo: replyTo ? {
              id: replyTo.id,
              senderName: replyTo.senderName,
              content: replyTo.content
            } : undefined,
            reactions: []
          };

          // Play incoming message ping
          discordAudio.playMessageSound();

          // Append bot message and remove from typing list
          setMessagesByChannel(prev => ({
            ...prev,
            [currentChannelId]: [...(prev[currentChannelId] || []), botMessage]
          }));
        } catch (err) {
          console.error(`Failed to get response from ${bot.name}:`, err);
        } finally {
          setTypingBotIds(prev => prev.filter(id => id !== bot.id));
        }
      }, staggerDelay);
    });
  };

  // Trigger other bots to respond to a specific message
  const handlePromptOthersToRespond = (targetMsg: ChatMessage) => {
    const otherBots = botsList.filter(b => b.id !== targetMsg.senderId);
    const chosenBots = otherBots.sort(() => 0.5 - Math.random()).slice(0, 3);
    const prompt = `React to and debate this point made by @${targetMsg.senderName}: "${targetMsg.content}"`;
    handleSendMessage(prompt, chosenBots.map(b => b.id), targetMsg);
  };

  // Reaction toggling
  const handleReact = (messageId: string, emoji: string) => {
    setMessagesByChannel(prev => {
      const channelMsgs = prev[currentChannelId] || [];
      const updated = channelMsgs.map(msg => {
        if (msg.id !== messageId) return msg;

        const existingReactionIndex = msg.reactions.findIndex(r => r.emoji === emoji);
        let newReactions = [...msg.reactions];

        if (existingReactionIndex > -1) {
          const r = newReactions[existingReactionIndex];
          const userIndex = r.users.indexOf('user');
          if (userIndex > -1) {
            // Remove user reaction
            const newUsers = r.users.filter(u => u !== 'user');
            if (newUsers.length === 0) {
              newReactions = newReactions.filter((_, idx) => idx !== existingReactionIndex);
            } else {
              newReactions[existingReactionIndex] = {
                ...r,
                count: r.count - 1,
                users: newUsers
              };
            }
          } else {
            // Add user reaction
            newReactions[existingReactionIndex] = {
              ...r,
              count: r.count + 1,
              users: [...r.users, 'user']
            };
          }
        } else {
          // Add new reaction with user
          newReactions.push({
            emoji,
            count: 1,
            users: ['user']
          });
        }

        return { ...msg, reactions: newReactions };
      });

      return { ...prev, [currentChannelId]: updated };
    });
  };

  // Clear channel messages
  const handleClearChannel = (channelId: string) => {
    if (window.confirm('Clear all messages in this channel?')) {
      setMessagesByChannel(prev => ({
        ...prev,
        [channelId]: []
      }));
    }
  };

  // Reset all chats
  const handleResetAllChats = () => {
    setMessagesByChannel(INITIAL_MESSAGES);
    setIsRoundtableRunning(false);
  };

  // Update Bot system prompt
  const handleUpdateSystemPrompt = (botId: string, newPrompt: string) => {
    setBotsList(prev =>
      prev.map(bot => (bot.id === botId ? { ...bot, systemPrompt: newPrompt } : bot))
    );
  };

  // Direct Message Switcher
  const handleSelectDmBot = (botId: string) => {
    setSelectedDmBotId(botId);
    const dmChannelId = `dm-${botId}`;
    setCurrentChannelId(dmChannelId);
    
    // Ensure DM channel exists in state
    if (!messagesByChannel[dmChannelId]) {
      const bot = getBotById(botId);
      setMessagesByChannel(prev => ({
        ...prev,
        [dmChannelId]: [
          {
            id: `init-${dmChannelId}`,
            channelId: dmChannelId,
            senderId: botId,
            senderName: bot ? bot.name : 'AI',
            senderColor: bot ? bot.color : '#5865F2',
            isBot: true,
            model: bot?.model,
            content: `Hey! This is a private 1-on-1 direct message channel with me (**${bot?.name}**). You can ask me anything or prompt me in private!`,
            timestamp: getFormattedTime(),
            reactions: []
          }
        ]
      }));
    }
  };

  // Autonomous Roundtable Loop
  const toggleRoundtable = useCallback(() => {
    setIsRoundtableRunning(prev => !prev);
  }, []);

  useEffect(() => {
    if (isRoundtableRunning) {
      roundtableTimerRef.current = setInterval(async () => {
        // Pick a random bot that didn't send the last message
        const currentMsgs = messagesByChannel[currentChannelId] || [];
        const lastMsg = currentMsgs[currentMsgs.length - 1];
        const lastSenderId = lastMsg?.senderId;

        const candidateBots = botsList.filter(b => b.id !== lastSenderId);
        const nextBot = candidateBots[Math.floor(Math.random() * candidateBots.length)];

        setTypingBotIds([nextBot.id]);

        const prompt = lastMsg
          ? `Respond directly to @${lastMsg.senderName}'s point: "${lastMsg.content}". Offer your model's unique perspective, agree/disagree, or propose a next level insight.`
          : 'What is the most significant technological frontier in AI architecture right now?';

        const history = currentMsgs.slice(-4).map(m => ({
          role: (m.isBot ? 'assistant' : 'user') as 'assistant' | 'user',
          content: m.content
        }));

        try {
          const response = await askPuterAI(nextBot, prompt, history);

          const botMsg: ChatMessage = {
            id: `rt-msg-${Date.now()}-${nextBot.id}`,
            channelId: currentChannelId,
            senderId: nextBot.id,
            senderName: nextBot.name,
            senderColor: nextBot.color,
            isBot: true,
            model: nextBot.model,
            content: response,
            timestamp: getFormattedTime(),
            replyTo: lastMsg
              ? {
                  id: lastMsg.id,
                  senderName: lastMsg.senderName,
                  content: lastMsg.content
                }
              : undefined,
            reactions: []
          };

          discordAudio.playMessageSound();

          setMessagesByChannel(p => ({
            ...p,
            [currentChannelId]: [...(p[currentChannelId] || []), botMsg]
          }));
        } catch (err) {
          console.error('Roundtable error:', err);
        } finally {
          setTypingBotIds([]);
        }
      }, 9000);
    } else {
      if (roundtableTimerRef.current) {
        clearInterval(roundtableTimerRef.current);
        roundtableTimerRef.current = null;
      }
    }

    return () => {
      if (roundtableTimerRef.current) {
        clearInterval(roundtableTimerRef.current);
      }
    };
  }, [isRoundtableRunning, currentChannelId, messagesByChannel, botsList]);

  // Profile modal bot
  const activeProfileBot = botsList.find(b => b.id === activeProfileBotId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1E1F22] text-[#DBDEE1] font-sans antialiased">
      {/* 1. Discord Leftmost Server Rail */}
      <DiscordServerRail
        activeView={activeView}
        setActiveView={view => {
          setActiveView(view);
          if (view === 'council') {
            setCurrentChannelId('general-lounge');
          }
        }}
        audioMuted={audioMuted}
        setAudioMuted={setAudioMuted}
        isRoundtableRunning={isRoundtableRunning}
      />

      {/* 2. Discord Channels Sidebar */}
      <DiscordChannelsSidebar
        activeView={activeView}
        currentChannelId={currentChannelId}
        onSelectChannel={channelId => setCurrentChannelId(channelId)}
        selectedDmBotId={selectedDmBotId}
        onSelectDmBot={handleSelectDmBot}
        isRoundtableRunning={isRoundtableRunning}
        onToggleRoundtable={toggleRoundtable}
        audioMuted={audioMuted}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 3. Center Area: Text Chat or Voice Stage */}
      {activeChannel.type === 'voice' ? (
        <DiscordVoiceStage onLeaveVoice={() => setCurrentChannelId('general-lounge')} />
      ) : (
        <DiscordChatArea
          channel={activeChannel}
          messages={activeMessages}
          onSendMessage={handleSendMessage}
          typingBotIds={typingBotIds}
          onOpenProfile={botId => setActiveProfileBotId(botId)}
          onReact={handleReact}
          onClearChannel={handleClearChannel}
          showMemberList={showMemberList}
          setShowMemberList={setShowMemberList}
          isRoundtableRunning={isRoundtableRunning}
          onToggleRoundtable={toggleRoundtable}
          onPromptOthersToRespond={handlePromptOthersToRespond}
        />
      )}

      {/* 4. Discord Right Member Sidebar */}
      {showMemberList && activeChannel.type !== 'voice' && (
        <DiscordMemberList
          onSelectBot={botId => setActiveProfileBotId(botId)}
          typingBotIds={typingBotIds}
        />
      )}

      {/* 5. User Profile Modal */}
      {activeProfileBot && (
        <DiscordUserProfileModal
          bot={activeProfileBot}
          onClose={() => setActiveProfileBotId(null)}
          onMention={name => {
            // Populates mention in input
          }}
          onDirectMessage={botId => handleSelectDmBot(botId)}
          onUpdateSystemPrompt={handleUpdateSystemPrompt}
        />
      )}

      {/* 6. Settings Modal */}
      <DiscordSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        audioMuted={audioMuted}
        onToggleAudio={() => {
          setAudioMuted(!audioMuted);
          discordAudio.enabled = audioMuted;
        }}
        onResetAllChats={handleResetAllChats}
      />
    </div>
  );
}
