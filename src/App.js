import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Content from './components/Content';

function App() {
  const [selectedChatId, setSelectedChatId] = useState(1); // 管理選擇的聊天室 ID

  // 定義一個回調函數，用於當在 Sidebar 中選擇聊天室時更新 App 的 state
  const selectChat = (id) => {
    setSelectedChatId(id); // 更新選擇的聊天室 ID
  };
  return (
    <div className="App">
      <Sidebar onSelectChat={selectChat} />
      <Content chatId={selectedChatId} />
    </div>
  );
}

export default App;
