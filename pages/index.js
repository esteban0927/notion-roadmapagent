import React, { useState, useEffect } from 'react';

export default function NotionKnowledgeAgent() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm here to help you with your website roadmap and lead generation strategy. I have access to your complete strategic documentation and can answer questions, provide specific steps, share resources, and guide you through implementation.\n\nWhat would you like to know about?"
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
        console.log('Loaded Notion content successfully');
      } else {
        setNotionKnowledgeBase(getDemoContent());
        console.log('Using demo content - Notion not connected');
      }
    } catch (error) {
      console.error('Failed to load Notion content:', error);
      setNotionKnowledgeBase(getDemoContent());
      console.log('Using demo content - Connection failed');
    } finally {
      setLoadingNotion(false);
    }
  };

  const getDemoContent = () => {
    return `# Website Optimization & Lead Generation Roadmap

## Phase 1: Discovery & Audit

### Website Speed Analysis
Tools to use:
- Google PageSpeed Insights: https://pagespeed.web.dev
- GTmetrix: https://gtmetrix.com

## Phase 2: Foundation Optimization

### Technical SEO Fixes
Common issues to address:
- Missing or duplicate meta descriptions
- Broken internal links
- Missing alt text on images

## Phase 3: Conversion Optimization

### Landing Page Design
Key elements of high-converting landing pages:
- Clear, benefit-driven headline
- Strong CTA button
- Social proof`;
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
              text: `You are a helpful assistant for a website optimization and lead generation consultancy. You have access to the client's strategic roadmap documentation.

Your job is to:
1. Answer questions using the information from the documentation below
2. Provide specific action steps when asked
3. Share relevant links and resources from the documentation
4. Be encouraging and actionable

Here is the complete documentation:

${notionKnowledgeBase}

---

Client question: ${input}

Provide a helpful, specific answer based on the documentation. Include links where relevant. Keep your response conversational and actionable.`
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'linear-gradient(to bottom right, #f9fafb, #eff6ff)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#4b5563' }}>Loading your knowledge base...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'linear-gradient(to bottom right, #f9fafb, #eff6ff)' }}>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 24px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        <div style={{ maxWidth: '896px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>
            📚
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Website Roadmap Assistant</h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Ask me anything about your strategic roadmap</p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px' }}>
        <div style={{ maxWidth: '896px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '768px',
                borderRadius: '16px',
                padding: '16px 20px',
                background: msg.role === 'user' ? '#2563eb' : 'white',
                color: msg.role === 'user' ? 'white' : '#1f2937',
                border: msg.role === 'user' ? 'none' : '1px solid #e5e7eb',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}>
                <p style={{ fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: 0 }}>
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#93c5fd', borderRadius: '50%', animation: 'bounce 1s infinite' }}></div>
                  <div style={{ width: '8px', height: '8px', background: '#93c5fd', borderRadius: '50%', animation: 'bounce 1s infinite 0.15s' }}></div>
                  <div style={{ width: '8px', height: '8px', background: '#93c5fd', borderRadius: '50%', animation: 'bounce 1s infinite 0.3s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '16px 24px', boxShadow: '0 -1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        <div style={{ maxWidth: '896px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your roadmap, tools, strategies, or specific steps..."
              style={{
                flex: 1,
                padding: '12px 20px',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
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
                background: '#2563eb',
                color: 'white',
                borderRadius: '12px',
                border: 'none',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !input.trim() ? 0.5 : 1,
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Send
            </button>
          </div>
          
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', color: '#6b7280' }}>
            <span>📚</span>
            <span>Answers are based on your strategic roadmap documentation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
