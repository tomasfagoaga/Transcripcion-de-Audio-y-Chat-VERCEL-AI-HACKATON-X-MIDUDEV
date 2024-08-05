'use client';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import ChatBubble from '../../components/ChatBubble';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'error') {
      setError(messages[messages.length - 1].content);
    } else {
      setError(null);
    }
  }, [messages]);

  return (
    <div>
      <div className="chat-container">
        {messages.map((m, index) => (
          <ChatBubble
            key={index}
            role={m.role === 'user' ? 'User' : 'AI'}
            content={m.content}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-form">
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl text-black"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
        <button type="submit" className="hidden">Send</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {error && error.includes('Too Many Requests') && (
        <p style={{ color: 'red' }}>You are sending too many requests. Please wait a moment and try again.</p>
      )}
    </div>
  );
}
