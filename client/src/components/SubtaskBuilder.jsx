import { AppIcon, IconButton, Icons } from './icons';
import { roleLabel } from '../utils/helpers';

export function blankSubtask() {
  return {
    key: `st-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: '',
    description: '',
    url: '',
    message: '',
    assign: '',
    prio: 'Medium',
    due: '',
  };
}

export default function SubtaskBuilder({ subtasks, onChange, members = [] }) {
  const add = () => onChange([...subtasks, blankSubtask()]);

  const update = (key, patch) => {
    onChange(subtasks.map((st) => (st.key === key ? { ...st, ...patch } : st)));
  };

  const remove = (key) => {
    onChange(subtasks.filter((st) => st.key !== key));
  };

  return (
    <div className="cw-subtasks">
      <div className="cw-subtasks-hd">
        <span className="cw-subtasks-title">Sub-tasks</span>
        <span className="cw-subtasks-hint">
          Each sub-task can have its own name, assignee, description, URL, due date, and message.
        </span>
      </div>

      {subtasks.length > 0 && (
        <div className="cw-subtasks-list">
          {subtasks.map((st, idx) => (
            <div key={st.key} className="cw-subtask-card">
              <div className="cw-subtask-card-hd">
                <span className="cw-subtask-num">{idx + 1}</span>
                <span className="cw-subtask-card-label">Sub-task {idx + 1}</span>
                <IconButton
                  icon={Icons.trash}
                  label="Remove sub-task"
                  variant="danger"
                  size={12}
                  className="cw-subtask-remove"
                  onClick={() => remove(st.key)}
                />
              </div>
              <div className="cw-subtask-row">
                <input
                  className="fi cw-subtask-title"
                  value={st.title}
                  onChange={(e) => update(st.key, { title: e.target.value })}
                  placeholder="Sub-task name"
                />
                <select
                  className="fs cw-subtask-assign"
                  value={st.assign}
                  onChange={(e) => update(st.key, { assign: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {members.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name.split(' ')[0]} ({roleLabel(u.role)})
                    </option>
                  ))}
                </select>
                <select
                  className="fs cw-subtask-prio"
                  value={st.prio}
                  onChange={(e) => update(st.key, { prio: e.target.value })}
                >
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div className="cw-subtask-fields">
                <div className="fl">
                  <label>Description</label>
                  <textarea
                    className="fa"
                    rows={2}
                    value={st.description}
                    onChange={(e) => update(st.key, { description: e.target.value })}
                    placeholder="What needs to be done for this sub-task…"
                  />
                </div>
                <div className="fl">
                  <label>URL</label>
                  <input
                    type="url"
                    className="fi"
                    value={st.url}
                    onChange={(e) => update(st.key, { url: e.target.value })}
                    placeholder="https://staging.example.com/page"
                  />
                </div>
                <div className="fl">
                  <label>Due date</label>
                  <input
                    type="date"
                    className="fi cw-subtask-due-field"
                    value={st.due}
                    onChange={(e) => update(st.key, { due: e.target.value })}
                  />
                </div>
                <div className="fl">
                  <label>Message</label>
                  <textarea
                    className="fa"
                    rows={2}
                    value={st.message}
                    onChange={(e) => update(st.key, { message: e.target.value })}
                    placeholder="Internal note for the assignee…"
                  />
                  <div className="cw-field-hint">Internal note for the assignee — shown on the sub-task detail.</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="cw-subtasks-add-btn" onClick={add}>
        <AppIcon icon={Icons.plus} size={14} />
        Add sub-task
      </button>
    </div>
  );
}
