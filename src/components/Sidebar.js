import React, { useState, useEffect } from 'react';
import './Sidebar.css';

function Sidebar({ onSelectChat }) {
  const [chats, setChats] = useState([]);
  const [newChatName, setNewChatName] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // 新增状态变量存储搜索词
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  useEffect(() => {
    const loadSidebarContent = async () => {
      try {
        const response = await fetch('http://localhost:3001/sidebar');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error('Failed to load sidebar content:', error);
      }
    };
    loadSidebarContent();
  }, []);

  useEffect(() => {
    const saveSidebarContent = async () => {
      try {
        await fetch('http://localhost:3001/sidebar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(chats)
        });
      } catch (error) {
        console.error('Failed to save sidebar content:', error);
      }
    };
    if (chats.length > 0) {
      saveSidebarContent();
    }
  }, [chats]);

  const addChat = () => {
    if (newChatName.trim()) {
      setChats([...chats, { id: Date.now(), name: newChatName, isEditing: false }]);
      setNewChatName('');
    }
  };

  const deleteChat = (id) => {
    setChats(chats.filter(chat => chat.id !== id));
    if (selectedChatId === id) {
      setSelectedChatId(null);  // Deselect if the deleted chat was selected
      selectChat(1);
    }
  };

  const startEditingChat = (id) => {
    setChats(chats.map(chat => (chat.id === id ? { ...chat, isEditing: true } : chat)));
  };

  const renameChat = (id, newName) => {
    setChats(chats.map(chat => (chat.id === id ? { ...chat, name: newName, isEditing: false } : chat)));
  };

  const selectChat = (id) => {
    setSelectedChatId(id);
    onSelectChat(id);
  };

  const toggleSidebarVisibility = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const filteredChats = chats.filter(chat => chat.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="sidebar-container">
      <button className="toggle-sidebar-btn" onClick={toggleSidebarVisibility}>
        {isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
      </button>
      <div className={`sidebar ${isSidebarVisible ? 'visible' : 'hidden'}`}>
        {isSidebarVisible && (
          <>
            <div className="sidebar-header">
              <input
                type="text"
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                placeholder="New chat name"
              />
              <button onClick={addChat}>Add</button>
            </div>
            <div className="search-bar"> {/* 新增搜索框 */}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search chats"
              />
            </div>
            <div className="sidebar-list">
              {filteredChats.map(chat => (  // 使用过滤后的聊天列表
                <div
                  key={chat.id}
                  className={`sidebar-item ${selectedChatId === chat.id ? 'selected' : ''}`}
                  onClick={() => selectChat(chat.id)}
                >
                  {chat.isEditing ? (
                    <input
                      type="text"
                      value={chat.name}
                      onChange={(e) => renameChat(chat.id, e.target.value)}
                      onBlur={() => renameChat(chat.id, chat.name)}
                      autoFocus
                    />
                  ) : (
                    <>
                      <span>{chat.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); startEditingChat(chat.id); }}>Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}>Delete</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Sidebar;