import React, { useEffect, useMemo, useState } from 'react';
import { Search, Send, MessageSquare, Paperclip, MoreVertical, Image, Smile, Phone, Video, Info, ChevronLeft, UserPlus, Check, X } from 'lucide-react';
import { api } from '../../../../services/api';
import './Messages.css';

const Messages = ({ collapsed }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('chats'); // chats | requests | search
  const [requests, setRequests] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [error, setError] = useState('');

  const me = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // Fetch conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setError('');
        const response = await api.get('/messages/conversations');
        if (response.success) {
          const list = response.data.data || response.data || [];
          const mapped = list.map((c) => {
            const partner = c.partner || {};
            const lastText = c.lastMessage?.text || '';
            const ts = c.lastMessage?.createdAt ? new Date(c.lastMessage.createdAt) : null;
            const name = partner.username || partner.email || 'Unknown';
            const initials = (name || 'U').slice(0, 2).toUpperCase();
            return {
              id: partner._id,
              _id: partner._id,
              name,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0ea5e9&color=fff&size=64`,
              online: false,
              lastMessage: lastText,
              timestamp: ts ? ts.toLocaleString() : '',
              unread: c.unreadCount || 0
            };
          });
          setConversations(mapped);
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        setError(error?.message || 'Failed to load conversations.');
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const fetchRequests = async () => {
    try {
      setError('');
      const response = await api.get('/chat-requests/inbox');
      if (response.success) setRequests(response.data.data || []);
    } catch (e) {
      setError(e?.message || 'Failed to load requests.');
    }
  };

  useEffect(() => {
    if (mode === 'requests') fetchRequests();
  }, [mode]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    (conv.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const runUserSearch = async () => {
    try {
      setError('');
      if (!userQuery.trim()) {
        setUserResults([]);
        return;
      }
      const response = await api.get(`/messages/users?query=${encodeURIComponent(userQuery.trim())}`);
      if (response.success) setUserResults(response.data.data || []);
    } catch (e) {
      setError(e?.message || 'Search failed.');
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (mode === 'search') runUserSearch();
    }, 250);
    return () => clearTimeout(t);
  }, [userQuery, mode]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChat) return;

    try {
      const receiverId = selectedChat._id || selectedChat.userId || selectedChat.id;
      const response = await api.post('/messages', {
        receiverId,
        text: messageInput
      });

      if (response.success) {
        const newMsg = response.data.data || response.data;
        const mapped = {
          id: newMsg._id,
          sender: 'me',
          content: newMsg.text,
          time: new Date(newMsg.createdAt).toLocaleTimeString()
        };
        setSelectedChat(prev => ({
          ...prev,
          messages: [...(prev.messages || []), mapped],
          lastMessage: messageInput,
          timestamp: 'Now'
        }));
        setConversations(prev => prev.map(c =>
          (c._id || c.id) === (selectedChat._id || selectedChat.id)
            ? { ...c, lastMessage: messageInput, timestamp: 'Now' }
            : c
        ));
        setMessageInput('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error?.message || 'Failed to send message.');
    }
  };

  const handleChatSelect = async (chat) => {
    setSelectedChat(chat);
    setShowMobileChat(true);

    try {
      const userId = chat._id || chat.userId || chat.id;
      const response = await api.get(`/messages/${userId}`);
      if (response.success) {
        const messages = response.data.data || response.data || [];
        const mapped = messages.map((m) => ({
          id: m._id,
          sender: (m.sender?._id || m.sender) === (me?.id || me?._id) ? 'me' : 'other',
          content: m.text,
          time: new Date(m.createdAt).toLocaleTimeString()
        }));
        setSelectedChat(prev => ({ ...prev, messages: mapped }));
        // Update unread in list
        setConversations(prev => prev.map(c =>
          (c._id || c.id) === (chat._id || chat.id) ? { ...c, unread: 0 } : c
        ));
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError(error?.message || 'Failed to load messages.');
    }
  };

  const sendChatRequest = async (userId) => {
    try {
      setError('');
      await api.post('/chat-requests', { receiverId: userId, message: 'Hi, can we chat?' });
      setError('Request sent.');
    } catch (e) {
      setError(e?.message || 'Failed to send request.');
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      setError('');
      await api.post(`/chat-requests/${requestId}/accept`, {});
      await fetchRequests();
      // refresh conversations after accept
      const response = await api.get('/messages/conversations');
      if (response.success) {
        const list = response.data.data || response.data || [];
        const mapped = list.map((c) => {
          const partner = c.partner || {};
          const lastText = c.lastMessage?.text || '';
          const ts = c.lastMessage?.createdAt ? new Date(c.lastMessage.createdAt) : null;
          const name = partner.username || partner.email || 'Unknown';
          const initials = (name || 'U').slice(0, 2).toUpperCase();
          return {
            id: partner._id,
            _id: partner._id,
            name,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0ea5e9&color=fff&size=64`,
            online: false,
            lastMessage: lastText,
            timestamp: ts ? ts.toLocaleString() : '',
            unread: c.unreadCount || 0
          };
        });
        setConversations(mapped);
      }
    } catch (e) {
      setError(e?.message || 'Failed to accept request.');
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      setError('');
      await api.post(`/chat-requests/${requestId}/reject`, {});
      await fetchRequests();
    } catch (e) {
      setError(e?.message || 'Failed to reject request.');
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
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button className={`view-all ${mode === 'chats' ? 'active' : ''}`} onClick={() => setMode('chats')}>Chats</button>
              <button className={`view-all ${mode === 'requests' ? 'active' : ''}`} onClick={() => setMode('requests')}>Requests</button>
              <button className={`view-all ${mode === 'search' ? 'active' : ''}`} onClick={() => setMode('search')}>Find</button>
            </div>
            <div className="conversations-search">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder={mode === 'search' ? 'Search by user id/username/email...' : 'Search conversations...'}
                className="search-input"
                value={mode === 'search' ? userQuery : searchTerm}
                onChange={(e) => {
                  if (mode === 'search') setUserQuery(e.target.value);
                  else setSearchTerm(e.target.value);
                }}
              />
            </div>
          </div>

          {error && (
            <div className="no-conversations">
              <p className="no-conversations-text">{error}</p>
            </div>
          )}

          <div className="conversations-content">
            {mode === 'chats' && filteredConversations.length > 0 ? (
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
            ) : mode === 'chats' ? (
              <div className="no-conversations">
                <p className="no-conversations-text">No conversations found</p>
              </div>
            ) : null}

            {mode === 'requests' && (
              requests.length > 0 ? requests.map((r) => (
                <div key={r._id} className="conversation-item">
                  <div className="conversation-avatar-wrapper">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent((r.sender.username || 'U').slice(0, 2).toUpperCase())}&background=22c55e&color=fff&size=64`}
                      alt={r.sender.username}
                      className="conversation-avatar"
                    />
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <h3 className="conversation-name">{r.sender.username}</h3>
                      <span className="conversation-time">{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="conversation-preview" style={{ justifyContent: 'space-between' }}>
                      <p className="conversation-last-message">{r.message || 'Chat request'}</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="send-button" type="button" onClick={() => acceptRequest(r._id)} title="Accept">
                          <Check size={18} />
                        </button>
                        <button className="send-button" type="button" onClick={() => rejectRequest(r._id)} title="Reject">
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="no-conversations">
                  <p className="no-conversations-text">No pending requests</p>
                </div>
              )
            )}

            {mode === 'search' && (
              userResults.length > 0 ? userResults.map((u) => (
                <div key={u._id} className="conversation-item">
                  <div className="conversation-avatar-wrapper">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent((u.username || 'U').slice(0, 2).toUpperCase())}&background=0ea5e9&color=fff&size=64`}
                      alt={u.username}
                      className="conversation-avatar"
                    />
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <h3 className="conversation-name">{u.username}</h3>
                      <span className="conversation-time">{u._id.slice(0, 8)}</span>
                    </div>
                    <div className="conversation-preview" style={{ justifyContent: 'space-between' }}>
                      <p className="conversation-last-message">{u.email}</p>
                      <button className="send-button" type="button" onClick={() => sendChatRequest(u._id)} title="Request to chat">
                        <UserPlus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="no-conversations">
                  <p className="no-conversations-text">Search to find users</p>
                </div>
              )
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
                {(selectedChat.messages || []).map((message, index) => (
                  <div
                    key={message.id || index}
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
