import { useRef } from 'react';
import { AppIcon, Icons } from './icons';

function initials(name) {
  return String(name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

function formatChatTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function WorkItemSectionChat({
  title,
  messages = [],
  draft = '',
  onDraftChange,
  onSend,
  user,
  placeholder,
  readOnly = false,
}) {
  const inputRef = useRef(null);

  const handleSend = () => {
    if (!draft.trim()) return;
    onSend();
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="cw-section-chat">
      <div className="cw-section-chat-hd">
        <AppIcon icon={Icons.messageSquare} size={14} />
        <span>{title}</span>
      </div>
      <div className="cw-chat-thread" role="log" aria-live="polite">
        {messages.length === 0 ? (
          <div className="cw-chat-empty">No comments yet — add a note below.</div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="cw-chat-msg">
              <div className="cw-chat-avatar" aria-hidden="true">
                {initials(m.userName)}
              </div>
              <div className="cw-chat-bubble">
                <div className="cw-chat-msg-hd">
                  <span className="cw-chat-author">{m.userName}</span>
                  <span className="cw-chat-time">{formatChatTime(m.createdAt)}</span>
                </div>
                <div className="cw-chat-text">{m.text}</div>
              </div>
            </div>
          ))
        )}
      </div>
      {!readOnly && (
        <div className="cw-chat-compose">
          <div className="cw-chat-avatar cw-chat-avatar-me" aria-hidden="true">
            {initials(user?.name)}
          </div>
          <textarea
            ref={inputRef}
            className="fa cw-chat-input"
            rows={2}
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder || 'Write a comment… Enter to send, Shift+Enter for new line.'}
          />
          <button
            type="button"
            className="btn btn-primary cw-chat-send"
            onClick={handleSend}
            disabled={!draft.trim()}
            aria-label="Send comment"
          >
            <AppIcon icon={Icons.send} size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
