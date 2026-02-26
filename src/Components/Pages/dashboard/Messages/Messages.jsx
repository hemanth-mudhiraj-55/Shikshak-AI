import React, { useState, useEffect } from 'react';
import { Search, Send, MessageSquare, Paperclip, MoreVertical, Image, Smile, Phone, Video, Info, ChevronLeft } from 'lucide-react';
import './Messages.css';

const Messages = ({ collapsed }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Check for system dark mode preference
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);

    const handler = (e) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handler);
    
    return () => darkModeMediaQuery.removeEventListener('change', handler);
  }, []);

  // Apply dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Mock data for conversations
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=4f46e5&color=fff',
      lastMessage: 'Can you check the homework assignment?',
      timestamp: '10:30 AM',
      unread: 3,
      online: true,
      messages: [
        { id: 1, sender: 'them', content: 'Hi, I had a question about today\'s lesson', time: '10:15 AM' },
        { id: 2, sender: 'me', content: 'Sure, what would you like to know?', time: '10:18 AM' },
        { id: 3, sender: 'them', content: 'Can you check the homework assignment?', time: '10:30 AM' },
      ]
    },
    {
      id: 2,
      name: 'Michael Chen',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=10b981&color=fff',
      lastMessage: 'Thank you for your help!',
      timestamp: 'Yesterday',
      unread: 0,
      online: false,
      messages: [
        { id: 1, sender: 'them', content: 'I understood the math problem now', time: 'Yesterday' },
        { id: 2, sender: 'me', content: 'Great job! Keep up the good work', time: 'Yesterday' },
        { id: 3, sender: 'them', content: 'Thank you for your help!', time: 'Yesterday' },
      ]
    },
    {
      id: 3,
      name: 'Emily Williams',
      avatar: 'https://ui-avatars.com/api/?name=Emily+Williams&background=8b5cf6&color=fff',
      lastMessage: 'When is the next parent-teacher meeting?',
      timestamp: 'Yesterday',
      unread: 1,
      online: true,
      messages: [
        { id: 1, sender: 'them', content: 'When is the next parent-teacher meeting?', time: 'Yesterday' },
      ]
    },
    {
      id: 4,
      name: 'David Brown',
      avatar: 'https://ui-avatars.com/api/?name=David+Brown&background=f59e0b&color=fff',
      lastMessage: 'I\'ve uploaded the project files',
      timestamp: '2 days ago',
      unread: 0,
      online: false,
      messages: [
        { id: 1, sender: 'them', content: 'I\'ve uploaded the project files', time: '2 days ago' },
      ]
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      avatar: 'https://ui-avatars.com/api/?name=Lisa+Anderson&background=ef4444&color=fff',
      lastMessage: 'See you in class tomorrow',
      timestamp: '3 days ago',
      unread: 0,
      online: false,
      messages: [
        { id: 1, sender: 'me', content: 'Thanks for the update', time: '3 days ago' },
        { id: 2, sender: 'them', content: 'See you in class tomorrow', time: '3 days ago' },
      ]
    }
  ]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChat) return;

    const newMessage = {
      id: selectedChat.messages.length + 1,
      sender: 'me',
      content: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update the selected chat's messages
    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedChat.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: messageInput,
          timestamp: 'Now'
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setSelectedChat({
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage],
      lastMessage: messageInput,
      timestamp: 'Now'
    });
    setMessageInput('');
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setShowMobileChat(true);
    
    // Mark messages as read
    if (chat.unread > 0) {
      const updatedConversations = conversations.map(conv => 
        conv.id === chat.id ? { ...conv, unread: 0 } : conv
      );
      setConversations(updatedConversations);
    }
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  return (
    <div className={`messages-container ${collapsed ? 'messages-container-collapsed' : ''}`}>
      <div className="messages-wrapper">
        {/* Conversations List */}
        <div className={`conversations-list ${showMobileChat ? 'conversations-list-hidden' : ''}`}>
          <div className="conversations-header">
            <h2 className="conversations-title">Messages</h2>
            <div className="conversations-search">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search conversations..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="conversations-content">
            {filteredConversations.length > 0 ? (
              filteredConversations.map(chat => (
                <div
                  key={chat.id}
                  className={`conversation-item ${selectedChat?.id === chat.id ? 'conversation-item-active' : ''}`}
                  onClick={() => handleChatSelect(chat)}
                >
                  <div className="conversation-avatar-wrapper">
                    <img src={chat.avatar} alt={chat.name} className="conversation-avatar" />
                    {chat.online && <span className="online-indicator"></span>}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <h3 className="conversation-name">{chat.name}</h3>
                      <span className="conversation-time">{chat.timestamp}</span>
                    </div>
                    <div className="conversation-preview">
                      <p className="conversation-last-message">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <span className="unread-badge">{chat.unread}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-conversations">
                <p className="no-conversations-text">No conversations found</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`chat-area ${!showMobileChat ? 'chat-area-hidden' : ''}`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <button className="back-button" onClick={handleBackToList} aria-label="Back to conversations">
                  <ChevronLeft size={24} />
                </button>
                <div className="chat-header-info">
                  <img src={selectedChat.avatar} alt={selectedChat.name} className="chat-avatar" />
                  <div className="chat-user-info">
                    <h3 className="chat-name">{selectedChat.name}</h3>
                    <span className="chat-status">{selectedChat.online ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="chat-action-button" aria-label="Voice call">
                    <Phone size={20} />
                  </button>
                  <button className="chat-action-button" aria-label="Video call">
                    <Video size={20} />
                  </button>
                  <button className="chat-action-button" aria-label="Chat info">
                    <Info size={20} />
                  </button>
                  <button className="chat-action-button" aria-label="More options">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-list">
                {selectedChat.messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`message-wrapper ${message.sender === 'me' ? 'message-wrapper-own' : ''}`}
                  >
                    {message.sender !== 'me' && (
                      <img src={selectedChat.avatar} alt={selectedChat.name} className="message-avatar" />
                    )}
                    <div className={`message ${message.sender === 'me' ? 'message-own' : 'message-other'}`}>
                      <p className="message-content">{message.content}</p>
                      <span className="message-time">{message.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form className="message-input-container" onSubmit={handleSendMessage}>
                <button type="button" className="input-action-button" aria-label="Attach file">
                  <Paperclip size={20} />
                </button>
                <button type="button" className="input-action-button" aria-label="Attach image">
                  <Image size={20} />
                </button>
                <input
                  type="text"
                  className="message-input"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <button type="button" className="input-action-button" aria-label="Add emoji">
                  <Smile size={20} />
                </button>
                <button 
                  type="submit" 
                  className="send-button" 
                  disabled={!messageInput.trim()}
                  aria-label="Send message"
                >
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-content">
                <MessageSquare size={64} className="no-chat-icon" />
                <h3 className="no-chat-title">Select a conversation</h3>
                <p className="no-chat-text">Choose a chat from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;