import React, { useState, useEffect } from 'react';

export default function NotionKnowledgeAgent() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm here to help you with your website roadmap and lead generation strategy. Ask me anything!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [notionKnowledgeBase, setNotionKnowledgeBase] = useState('');
  const [loadingNotion, setLoadingNotion] = useState(true);

  useEffect(() => {
    fetchNotionContent();
  }, []);

  const fetchNotionContent = async () => {
    try {
      const response = await fetch('/api/knowledge-base');
      const data = await response.json();
      
      if (data.content && data.content.trim().length > 0) {
        setNotionKnowledgeBase(data.content);
      } else {
        setNotionKnowledgeBase(getDemoContent());
      }
    } catch (error) {
      setNotionKnowledgeBase(getDemoContent());
    } finally {
      setLoadingNotion(false);
    }
  };

  const getDemoContent = () => {
    return `# Website Optimization Roadmap

## Speed Optimization
Tools: Google PageSpeed Insights
Steps: Run tests, identify issues, prioritize fixes

## SEO Foundation
Focus on meta descriptions, alt text, internal links

## Conversion
Create compelling landing pages with clear CTAs`;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful website optimization consultant. Use this documentation to answer:

${notionKnowledgeBase}

Question: ${input}

Provide a helpful answer based on the documentation.`
            }]
          }]
        })
      });

      const geminiData = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: geminiData.candidates[0].content.parts[0].text
      };
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'I encountered an error. Please make sure your API key is configured correctly.'
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  if (loadingNotion) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f3f4f6' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f3f4f6' }}>
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 24px' }}>
        <div style={{ maxWidth: '896px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Website Roadmap Assistant</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>Ask me anything about your roadmap</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '896px', margin: '0 auto' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: '16px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: '12px',
                background: msg.role === 'user' ? '#3b82f6' : 'white',
                color: msg.role === 'user' ? 'white' : '#1f2937',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.5' }}>
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
              <div style={{ background: 'white', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', animation: 'bounce 1s infinite' }}></div>
                  <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }}></div>
                  <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '16px 24px' }}>
        <div style={{ maxWidth: '896px', margin: '0 auto', display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !input.trim() ? 0.5 : 1,
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
