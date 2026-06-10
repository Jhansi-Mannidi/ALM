import { useEffect, useRef, useState } from 'react';
import { AppIcon, Icons } from './icons';

const SLASH_COMMANDS = [
  { cmd: 'h1', label: 'Heading 1', action: () => document.execCommand('formatBlock', false, 'h1') },
  { cmd: 'h2', label: 'Heading 2', action: () => document.execCommand('formatBlock', false, 'h2') },
  { cmd: 'h3', label: 'Heading 3', action: () => document.execCommand('formatBlock', false, 'h3') },
  { cmd: 'ul', label: 'Bullet list', action: () => document.execCommand('insertUnorderedList') },
  { cmd: 'ol', label: 'Numbered list', action: () => document.execCommand('insertOrderedList') },
  { cmd: 'check', label: 'Checklist', action: () => document.execCommand('insertHTML', false, '<ul class="rte-checklist"><li>☐ Item</li></ul>') },
  { cmd: 'code', label: 'Code block', action: () => document.execCommand('formatBlock', false, 'pre') },
  { cmd: 'quote', label: 'Quote', action: () => document.execCommand('formatBlock', false, 'blockquote') },
  { cmd: 'table', label: 'Table', action: () => document.execCommand('insertHTML', false, '<table class="rte-table"><tr><th>Col 1</th><th>Col 2</th></tr><tr><td></td><td></td></tr></table>') },
];

function ToolbarBtn({ icon, label, onClick, active }) {
  return (
    <button
      type="button"
      className={`rte-tool${active ? ' active' : ''}`}
      title={label}
      aria-label={label}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {icon ? <AppIcon icon={icon} size={14} /> : <span className="rte-tool-txt">{label}</span>}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const emitChange = () => {
    onChange(editorRef.current?.innerHTML || '');
  };

  const run = (cmd, arg) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg);
    emitChange();
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL');
    if (url) run('createLink', url);
  };

  const insertMention = () => {
    const name = window.prompt('Mention teammate (@name)');
    if (name) run('insertHTML', `<span class="rte-mention">@${name.trim()}</span>&nbsp;`);
  };

  const onPaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          run('insertHTML', `<img src="${reader.result}" alt="pasted" class="rte-img" />`);
        };
        reader.readAsDataURL(file);
        return;
      }
    }
  };

  const onKeyDown = (e) => {
    if (e.key === '/') {
      setSlashOpen(true);
      setSlashFilter('');
      return;
    }
    if (slashOpen) {
      if (e.key === 'Escape') {
        setSlashOpen(false);
        return;
      }
      if (e.key === 'Enter' && slashFilter) {
        e.preventDefault();
        const match = SLASH_COMMANDS.find((c) => c.cmd.startsWith(slashFilter));
        if (match) {
          document.execCommand('delete');
          match.action();
          emitChange();
        }
        setSlashOpen(false);
        setSlashFilter('');
        return;
      }
      if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
        setSlashFilter((f) => f + e.key);
      }
    }
  };

  const filteredSlash = SLASH_COMMANDS.filter(
    (c) => !slashFilter || c.cmd.includes(slashFilter) || c.label.toLowerCase().includes(slashFilter.toLowerCase())
  );

  return (
    <div className="rte">
      <div className="rte-toolbar" role="toolbar" aria-label="Description formatting">
        <ToolbarBtn label="H1" onClick={() => run('formatBlock', 'h1')} />
        <ToolbarBtn label="H2" onClick={() => run('formatBlock', 'h2')} />
        <ToolbarBtn label="H3" onClick={() => run('formatBlock', 'h3')} />
        <span className="rte-sep" />
        <ToolbarBtn label="B" onClick={() => run('bold')} />
        <ToolbarBtn label="I" onClick={() => run('italic')} />
        <ToolbarBtn label="U" onClick={() => run('underline')} />
        <ToolbarBtn label="S" onClick={() => run('strikeThrough')} />
        <span className="rte-sep" />
        <ToolbarBtn icon={Icons.list} label="Bullet list" onClick={() => run('insertUnorderedList')} />
        <ToolbarBtn label="1." onClick={() => run('insertOrderedList')} />
        <ToolbarBtn label="☐" onClick={() => run('insertHTML', '<ul class="rte-checklist"><li>☐ </li></ul>')} />
        <ToolbarBtn label="{ }" onClick={() => run('formatBlock', 'pre')} />
        <ToolbarBtn label="❝" onClick={() => run('formatBlock', 'blockquote')} />
        <span className="rte-sep" />
        <ToolbarBtn icon={Icons.externalLink} label="Link" onClick={insertLink} />
        <ToolbarBtn label="@" onClick={insertMention} />
        <ToolbarBtn label="☺" onClick={() => run('insertText', '😀')} />
        <span className="rte-sep" />
        <ToolbarBtn label="A" onClick={() => run('foreColor', '#DC2626')} />
        <ToolbarBtn label="▮" onClick={() => run('hiliteColor', '#FEF3C7')} />
        <ToolbarBtn label="S+" onClick={() => run('fontSize', '5')} />
        <ToolbarBtn label="S-" onClick={() => run('fontSize', '2')} />
        <span className="rte-sep" />
        <ToolbarBtn label="⬅" onClick={() => run('justifyLeft')} />
        <ToolbarBtn label="⬌" onClick={() => run('justifyCenter')} />
        <ToolbarBtn label="➡" onClick={() => run('justifyRight')} />
      </div>
      <div className="rte-wrap">
        <div
          ref={editorRef}
          className="rte-editor"
          contentEditable
          role="textbox"
          aria-multiline="true"
          data-placeholder={placeholder}
          onInput={emitChange}
          onBlur={emitChange}
          onPaste={onPaste}
          onKeyDown={onKeyDown}
          suppressContentEditableWarning
        />
        {slashOpen && filteredSlash.length > 0 && (
          <div className="rte-slash-menu">
            {filteredSlash.map((c) => (
              <button
                key={c.cmd}
                type="button"
                className="rte-slash-item"
                onMouseDown={(e) => {
                  e.preventDefault();
                  c.action();
                  emitChange();
                  setSlashOpen(false);
                  setSlashFilter('');
                }}
              >
                <span className="rte-slash-cmd">/{c.cmd}</span>
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="rte-hint">Type <kbd>/</kbd> for quick commands · paste images directly</div>
    </div>
  );
}
