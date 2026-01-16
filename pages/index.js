import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function NotionKnowledgeAgent() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm here to help you with your website roadmap and lead generation strategy. Ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notionKnowledgeBase, setNotionKnowledgeBase] = useState("");
  const [loadingNotion, setLoadingNotion] = useState(true);

  useEffect(() => {
    fetchNotionContent();
  }, []);

  const fetchNotionContent = async () => {
    try {
      const response = await fetch("/api/knowledge-base");
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

    const userText = input;

    const userMessage = { role: "user", content: userText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userText,
          notionKnowledgeBase,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.log("API /api/gemini failed:", data);

        const msg =
          data?.details?.error?.message ||
          data?.details?.error ||
          data?.error ||
          "Gemini request failed";

        throw new Error(msg);
      }

      let content = data?.answer || data?.text || "No response text returned.";

if (data?.route === "handoff" && data?.handoffPrompt) {
  content += `

---

Copy and paste this into ChatGPT or Gemini:

${data.handoffPrompt}`;
}

const assistantMessage = {
  role: "assistant",
  content,
};

setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Gemini error:", error);

      const errorMessage = {
        role: "assistant",
        content:
          "I hit an error calling Gemini. Check the browser console for the exact /api/gemini error details.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (loadingNotion) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#f3f4f6",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid #3b82f6",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          ></div>
          <p>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#f3f4f6",
      }}
    >
      <style jsx>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      <div
        style={{
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "16px 24px",
        }}
      >
        <div style={{ maxWidth: "896px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
            Website Roadmap Assistant
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              margin: "4px 0 0 0",
            }}
          >
            Ask me anything about your roadmap
          </p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        <div style={{ maxWidth: "896px", margin: "0 auto" }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "16px",
                display: "flex",
                justifyContent:
                  msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: msg.role === "user" ? "#3b82f6" : "white",
                  color: msg.role === "user" ? "white" : "#1f2937",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ fontSize: "14px", lineHeight: "1.5" }}>
                  <ReactMarkdown
                    // Keep it simple and safe: no raw HTML rendering
                    components={{
                      p: ({ children }) => (
                        <p style={{ margin: 0 }}>{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong>{children}</strong>
                      ),
                      em: ({ children }) => <em>{children}</em>,
                      ul: ({ children }) => (
                        <ul style={{ margin: "8px 0 0 18px" }}>{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol style={{ margin: "8px 0 0 18px" }}>{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li style={{ margin: "4px 0" }}>{children}</li>
                      ),
                      h1: ({ children }) => (
                        <div style={{ fontWeight: 800, fontSize: "16px" }}>
                          {children}
                        </div>
                      ),
                      h2: ({ children }) => (
                        <div style={{ fontWeight: 700, fontSize: "15px" }}>
                          {children}
                        </div>
                      ),
                      h3: ({ children }) => (
                        <div style={{ fontWeight: 700, fontSize: "14px" }}>
                          {children}
                        </div>
                      ),
                      code: ({ children }) => (
                        <code
                          style={{
                            fontFamily:
                              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                            fontSize: "13px",
                            padding: "2px 6px",
                            borderRadius: "6px",
                            background:
                              msg.role === "user"
                                ? "rgba(255,255,255,0.18)"
                                : "rgba(0,0,0,0.06)",
                          }}
                        >
                          {children}
                        </code>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: msg.role === "user" ? "white" : "#2563eb",
                            textDecoration: "underline",
                          }}
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  background: "white",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ display: "flex", gap: "4px" }}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      background: "#3b82f6",
                      borderRadius: "50%",
                      animation: "bounce 1s infinite",
                    }}
                  ></div>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      background: "#3b82f6",
                      borderRadius: "50%",
                      animation: "bounce 1s infinite 0.2s",
                    }}
                  ></div>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      background: "#3b82f6",
                      borderRadius: "50%",
                      animation: "bounce 1s infinite 0.4s",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          background: "white",
          borderTop: "1px solid #e5e7eb",
          padding: "16px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "896px",
            margin: "0 auto",
            display: "flex",
            gap: "8px",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a question..."
            style={{
              flex: 1,
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
            }}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{
              padding: "12px 24px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              opacity: loading || !input.trim() ? 0.5 : 1,
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
