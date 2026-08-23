import { useAgent } from "agents/react";
import { useAgentChat } from "@cloudflare/think/react";
import { useCallback, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

import "./client.css";

const SESSION = "main";

function messageText(parts: { type: string; text?: string }[]): string {
  return parts
    .filter((part) => part.type === "text" && part.text)
    .map((part) => part.text!)
    .join("");
}

function Chat() {
  const agent = useAgent({ agent: "crazp", name: SESSION });
  const {
    messages,
    sendMessage,
    status,
    isStreaming,
    isRecovering,
    connectionError
  } = useAgentChat({ agent });

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  const connected = agent.readyState === WebSocket.OPEN;
  const busy =
    isStreaming ||
    isRecovering ||
    status === "submitted" ||
    status === "streaming";

  const statusLabel = connectionError
    ? "Connection error"
    : !connected
      ? "Connecting…"
      : isRecovering
        ? "Recovering…"
        : busy
          ? "Thinking…"
          : "Ready";

  const submit = useCallback(() => {
    const text = inputRef.current?.value.trim() ?? "";
    if (!text || busy || !connected) return;
    sendMessage({ text });
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.style.height = "auto";
    }
  }, [busy, connected, sendMessage]);

  return (
    <div className="app">
      <header className="header">
        <h1>Crazp</h1>
        <span
          className={`status ${connectionError ? "error" : connected ? "connected" : ""}`}
        >
          {statusLabel}
        </span>
      </header>

      <div className="messages" ref={listRef}>
        {messages.length === 0 ? (
          <p className="empty">
            Send a message to chat with your agent.
            <br />
            Session: <code>{SESSION}</code>
          </p>
        ) : (
          messages.map((msg) => {
            const text = messageText(msg.parts);
            if (!text) return null;
            return (
              <div
                key={msg.id}
                className={`bubble ${msg.role === "user" ? "user" : "assistant"}`}
              >
                <div className="bubble-label">{msg.role}</div>
                {text}
              </div>
            );
          })
        )}
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          ref={inputRef}
          rows={1}
          placeholder="Message Crazp…"
          disabled={!connected || busy}
          onInput={(e) => {
            e.currentTarget.style.height = "auto";
            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button type="submit" disabled={!connected || busy}>
          Send
        </button>
      </form>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Chat />);
