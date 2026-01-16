import React, { useState, useEffect } from 'react';
import { Send, BookOpen, ExternalLink } from 'lucide-react';

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
        console.log('✅ Loaded Notion content successfully');
      } else {
        setNotionKnowledgeBase(getDemoContent());
        console.log('⚠️ Using demo content - Notion not connected');
      }
    } catch (error) {
      console.error('Failed to load Notion content:', error);
      setNotionKnowledgeBase(getDemoContent());
      console.log('⚠️ Using demo content - Connection failed');
    } finally {
      setLoadingNotion(false);
    }
  };

  const getDemoContent = () => {
    return `# Website Optimization & Lead Generation Roadmap

## Phase 1: Discovery & Audit

### Website Speed Analysis
**Overview:** Analyze current page load times and identify bottlenecks.

**Tools to use:**
- Google PageSpeed Insights: https://pagespeed.web.dev
- GTmetrix: https://gtmetrix.com

**Action steps:**
1. Run your homepage through all three tools
2. Document your current speed score
3. Identify the top 3 issues slowing down your site
4. Prioritize fixes based on impact

## Phase 2: Foundation Optimization

### Technical SEO Fixes
**Common issues to address:**
- Missing or duplicate meta descriptions
- Broken internal links
- Missing alt text on images

**Tools:**
- Google Search Console: https://search.google.com/search-console

## Phase 3: Conversion Optimization

### Landing Page Design
**Key elements of high-converting landing pages:**
- Clear, benefit-driven headline
- Supporting subheadline
- Hero image/video showing product in action
- Primary CTA button (contrasting color)

**Landing page tools:**
- Unbounce: https://unbounce.com
- Instapage: https://instapage.com`;
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
5. If something isn't in the documentation, say so and offer general guidance

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

  const renderMessageContent = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
       return (
  
    key={index}
    href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
          >
            {part}
            <ExternalLink className="w-3 h-3" />
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (loadingNotion) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your knowledge base...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Website Roadmap Assistant</h1>
            <p className="text-sm text-gray-600">Ask me anything about your strategic roadmap</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl rounded-2xl px-5 py-4 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.role === 'assistant' ? renderMessageContent(msg.content) : msg.content}
                </p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your roadmap, tools, strategies, or specific steps..."
              className="flex-1 px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
            <BookOpen className="w-3 h-3" />
            <span>Answers are based on your strategic roadmap documentation</span>
          </div>
        </div>
      </div>

      {messages.length === 1 && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-6">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-lg">
            <p className="text-xs font-medium text-gray-600 mb-3">Try asking:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setInput("How do I improve my website speed?")}
                className="text-left text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
              >
                How do I improve my website speed?
              </button>
              <button
                onClick={() => setInput("What should be on my landing page?")}
                className="text-left text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
              >
                What should be on my landing page?
              </button>
              <button
                onClick={() => setInput("How do I create a lead magnet?")}
                className="text-left text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
              >
                How do I create a lead magnet?
              </button>
              <button
                onClick={() => setInput("What metrics should I track?")}
                className="text-left text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
              >
                What metrics should I track?
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
