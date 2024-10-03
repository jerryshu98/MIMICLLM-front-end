import React, { useState, useEffect, useRef } from 'react';
import './Content.css';
import logo from './logo2.png';

function Content({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentModel, setCurrentModel] = useState('model1');
  const [isSingleMessageMode, setIsSingleMessageMode] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (chatId && chatId !== 0) {
        try {
          console.log(chatId);
          const response = await fetch(`http://localhost:3001/chat/history/${chatId}`);
          const data = await response.json();
          setMessages(data.map((msg, index) => ({
            id: index + 1,
            text: msg.content,
            type: msg.role === 'user' ? 'me' : 'other',
            avatar: ''
          })));
        } catch (error) {
          console.error('Failed to load chat history:', error);
        }
      }
    };
    fetchHistory();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageToServer = async (newMessages) => {
    try {
      const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chatId, messages: newMessages })
      });
      const data = await response.json();
      if (data.message) {
        setMessages(messages => [...messages, { id: messages.length + 1, text: data.message, type: 'other', avatar: '' }]);
      }
    } catch (error) {
      console.error('Failed to send message to the server:', error);
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: input,
        type: 'me',
        avatar: ''  // Optionally add avatar path here
      };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      sendMessageToServer(updatedMessages.map(msg => ({ role: msg.type === 'me' ? 'user' : 'system', content: msg.text })));
      setInput('');
      adjustTextareaHeight();
    }
  };

  const handleInput = (event) => {
    setInput(event.target.value);
    adjustTextareaHeight();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleModelChange = (event) => {
    setCurrentModel(event.target.value);
  };

  const toggleSingleMessageMode = () => {
    setIsSingleMessageMode(prevMode => !prevMode);
  };

  if (chatId === 1) {
    return (
      <div className="welcome-message">
        <img src={logo} alt="Logo" className="logo" />
        <p>Welcome to MIMIC LLM. This interface provides secure access to the large model to prevent data leakage.<br /> Please create a conversation box in the left window to initiate the GPT service.</p>
      </div>
    );
  }

  return (
    <div className={`content ${isSingleMessageMode ? 'single-message-mode' : ''}`}>
      <header className="header">
        <select value={currentModel} onChange={handleModelChange} className="model-select">
          <option value="model1">Model 1</option>
          <option value="model2">Model 2</option>
          <option value="model3">Model 3</option>
        </select>
        <span className="current-model">Current Model: {currentModel}</span>
        <button className="single-message-button" onClick={toggleSingleMessageMode}>
          {isSingleMessageMode ? 'Disable Single message' : 'Enable Single message'}
        </button>
      </header>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-row ${msg.type}-message`}>
            {(msg.type === 'me' && (msg.avatar || msg.avatar === '')) && (
              <div className="message">{msg.text}</div>
            )}
            {msg.avatar ? (
              <img src={msg.avatar} alt="avatar" className="avatar" />
            ) : (
              <div className="avatar-placeholder"></div>
            )}
            {(msg.type === 'other' && (msg.avatar || msg.avatar === '')) && (
              <div className="message">{msg.text}</div>
            )}
            <button className="copy-button">Copy</button>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          rows="1"
          className="input-box"
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default Content;
