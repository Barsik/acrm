import { useRef, useState } from 'react';
import { X, CalendarDays, Paperclip, Trash2, CircleCheck, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { clients, type ClientRecord } from '../../data/mockDatabase';
import type { Task, UserRole } from '../../types';

interface Employee {
  id: string;
  name: string;
  position: string;
}

// Сотрудники, которым можно поставить задачу (мок; в проде — справочник oCRM/AD)
const EMPLOYEES: Employee[] = [
  { id: 'mgr1', name: 'Алексей Воронов', position: 'Клиентский менеджер' },
  { id: 'mgr2', name: 'Мария Соколова', position: 'Клиентский менеджер' },
  { id: 'mgr3', name: 'Дмитрий Козлов', position: 'Клиентский менеджер' },
  { id: 'pm1', name: 'Мария Кузнецова', position: 'Руководитель направления рынков' },
  { id: 'ops1', name: 'Павел Смирнов', position: 'Специалист операционного контура' },
];

const TYPE_OPTIONS: Array<{ value: Task['type']; label: string }> = [
  { value: 'call', label: 'Звонок' },
  { value: 'meeting', label: 'Встреча' },
  { value: 'document', label: 'Документ' },
  { value: 'escalation', label: 'Эскалация' },
  { value: 'cross_sell', label: 'Cross-sell' },
  { value: 'other', label: 'Прочее' },
];

const PRIORITY_OPTIONS: Array<{ value: Task['priority']; label: string }> = [
  { value: 'critical', label: 'Критично' },
  { value: 'high', label: 'Высокий' },
  { value: 'medium', label: 'Средний' },
  { value: 'low', label: 'Низкий' },
];

// Текущий пользователь в разрезе роли (мок; в проде — из сессии)
const selfByRole: Record<UserRole, Employee> = {
  manager: { id: 'mgr1', name: 'Алексей Воронов', position: 'Клиентский менеджер' },
  block_head: { id: 'bh1', name: 'Ирина Соколова', position: 'Руководитель клиентского блока' },
  market_lead: { id: 'pm1', name: 'Мария Кузнецова', position: 'Руководитель направления рынков' },
  operations: { id: 'ops1', name: 'Павел Смирнов', position: 'Специалист операционного контура' },
  ceo: { id: 'ceo1', name: 'Дмитрий Гринёв', position: 'Председатель Правления' },
};

// 'дд-мм-гггг' → 'гггг-мм-дд' (ISO); null, если дата невалидна
const parseDueDate = (value: string): string | null => {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const date = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  if (Number.isNaN(date.getTime()) || date.getDate() !== Number(dd) || date.getMonth() + 1 !== Number(mm)) return null;
  return `${yyyy}-${mm}-${dd}`;
};

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (task: Task) => void;
  /** Клиент, подставляемый в поле «Клиент/Холдинг» по умолчанию (например, с карточки клиента). */
  defaultClient?: ClientRecord;
}

export const CreateTaskModal = ({ open, onClose, onCreate, defaultClient }: CreateTaskModalProps) => {
  const { role } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<HTMLInputElement>(null);

  const [dueDate, setDueDate] = useState('');
  const [topic, setTopic] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [taskType, setTaskType] = useState<Task['type'] | ''>('');
  const [priority, setPriority] = useState<Task['priority'] | ''>('');
  const [clientQuery, setClientQuery] = useState(defaultClient?.name ?? '');
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(defaultClient ?? null);
  const [clientFocused, setClientFocused] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [assigneeId, setAssigneeId] = useState('');
  const [assignToSelf, setAssignToSelf] = useState(false);

  if (!open || !role) return null;

  const self = selfByRole[role];
  // Клиентский менеджер ставит задачи только на себя
  const selfOnly = role === 'manager';
  const employees = EMPLOYEES.filter(e => e.id !== self.id);

  const reset = () => {
    setDueDate(''); setTopic(''); setSubtopic(''); setTaskType(''); setPriority('');
    setClientQuery(defaultClient?.name ?? ''); setSelectedClient(defaultClient ?? null); setClientFocused(false);
    setFile(null); setAssigneeId(''); setAssignToSelf(false);
  };

  const close = () => { reset(); onClose(); };

  const openCalendar = () => {
    const picker = datePickerRef.current;
    if (!picker) return;
    if ('showPicker' in picker) picker.showPicker();
    else (picker as HTMLInputElement).click();
  };

  const handleCalendarPick = (iso: string) => {
    if (iso) setDueDate(iso.split('-').reverse().join('-'));
  };

  // Ручной ввод: только цифры, дефисы подставляются автоматически
  const handleDateInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
    setDueDate(parts.join('-'));
  };

  const isoDate = parseDueDate(dueDate);
  const assignee = selfOnly || assignToSelf ? self : employees.find(e => e.id === assigneeId);
  const canSubmit = !!isoDate && !!topic.trim() && !!taskType && !!priority && !!assignee;

  const clientSuggestions = clientQuery.trim() && !selectedClient
    ? clients.filter(c => {
        const q = clientQuery.trim().toLowerCase();
        return c.name.toLowerCase().includes(q) || c.inn.includes(q);
      }).slice(0, 6)
    : [];

  const pickClient = (c: ClientRecord) => {
    setSelectedClient(c);
    setClientQuery(c.name);
    setClientFocused(false);
  };

  const handleSubmit = () => {
    if (!isoDate || !topic.trim() || !taskType || !priority || !assignee) return;

    onCreate({
      id: `t${Date.now()}`,
      title: topic.trim(),
      description: [subtopic.trim(), file ? `Вложение: ${file.name}` : ''].filter(Boolean).join(' · '),
      type: taskType,
      priority,
      status: 'open',
      assigneeId: assignee.id,
      assigneeName: assignee.name,
      entityId: selectedClient ? String(selectedClient.id) : '',
      entityName: selectedClient ? selectedClient.name : (clientQuery.trim() || '—'),
      entityType: 'company',
      dueDate: isoDate,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    close();
  };

  const fieldClass = 'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-moex-red';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" onMouseDown={close}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl" onMouseDown={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Создать задачу</h2>
          <button className="rounded-lg p-2 hover:bg-slate-100" onClick={close}><X size={18} /></button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {/* Дата исполнения */}
          <label className="block text-xs font-semibold text-slate-600">
            Дата исполнения <span className="text-moex-red">*</span>
            <div className="relative mt-1.5">
              <input
                type="text"
                inputMode="numeric"
                placeholder="дд-мм-гггг"
                value={dueDate}
                onChange={e => handleDateInput(e.target.value)}
                className={`${fieldClass} pr-10`}
              />
              <button
                type="button"
                title="Выбрать по календарю"
                onClick={openCalendar}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <CalendarDays size={16} />
              </button>
              <input
                ref={datePickerRef}
                type="date"
                tabIndex={-1}
                aria-hidden="true"
                value={isoDate ?? ''}
                onChange={e => handleCalendarPick(e.target.value)}
                className="pointer-events-none absolute right-2 bottom-0 h-0 w-0 opacity-0"
              />
            </div>
          </label>

          {/* Тема */}
          <label className="block text-xs font-semibold text-slate-600">
            Тема <span className="text-moex-red">*</span>
            <input
              type="text"
              placeholder="Например: Встреча по пролонгации тарифа"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className={`${fieldClass} mt-1.5`}
            />
          </label>

          {/* Подтема */}
          <label className="block text-xs font-semibold text-slate-600">
            Подтема
            <input
              type="text"
              placeholder="Уточнение темы (необязательно)"
              value={subtopic}
              onChange={e => setSubtopic(e.target.value)}
              className={`${fieldClass} mt-1.5`}
            />
          </label>

          {/* Клиент/Холдинг — необязательное, с автоподсказкой */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600">
              Клиент/Холдинг
              <input
                type="text"
                placeholder="Начните вводить наименование или ИНН…"
                value={clientQuery}
                onChange={e => { setClientQuery(e.target.value); setSelectedClient(null); }}
                onFocus={() => setClientFocused(true)}
                onBlur={() => setClientFocused(false)}
                className={`${fieldClass} mt-1.5`}
              />
            </label>
            {clientFocused && clientSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                {clientSuggestions.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onMouseDown={e => { e.preventDefault(); pickClient(c); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50"
                  >
                    <Building2 size={14} className="shrink-0 text-slate-400" />
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{c.name}</span>
                    <span className="shrink-0 text-xs text-slate-400">ИНН {c.inn}</span>
                  </button>
                ))}
              </div>
            )}
            {selectedClient && (
              <span className="mt-1 block text-[10px] text-slate-400">
                Задача будет привязана к карточке клиента «{selectedClient.name}»
              </span>
            )}
          </div>

          {/* Тип и приоритет */}
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <label className="block text-xs font-semibold text-slate-600">
              Тип <span className="text-moex-red">*</span>
              <select
                value={taskType}
                onChange={e => setTaskType(e.target.value as Task['type'] | '')}
                className={`${fieldClass} mt-1.5 bg-white`}
              >
                <option value="">Выберите тип…</option>
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              Приоритет <span className="text-moex-red">*</span>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Task['priority'] | '')}
                className={`${fieldClass} mt-1.5 bg-white`}
              >
                <option value="">Выберите приоритет…</option>
                {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          </div>

          {/* Исполнитель */}
          {selfOnly ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <span className="block text-xs font-semibold text-slate-600">Исполнитель</span>
              <span className="mt-0.5 block text-sm text-slate-800">{self.name} <span className="text-slate-400">(вы)</span></span>
              <span className="text-[10px] text-slate-400">Клиентский менеджер ставит задачи только на себя</span>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Исполнитель <span className="text-moex-red">*</span>
                <select
                  value={assignToSelf ? '' : assigneeId}
                  disabled={assignToSelf}
                  onChange={e => setAssigneeId(e.target.value)}
                  className={`${fieldClass} mt-1.5 bg-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
                >
                  <option value="">Выберите сотрудника…</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} — {e.position}</option>
                  ))}
                </select>
              </label>
              <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={assignToSelf}
                  onChange={e => setAssignToSelf(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-moex-red"
                />
                Поставить задачу себе ({self.name})
              </label>
            </div>
          )}

          {/* Вложение */}
          <div>
            <span className="block text-xs font-semibold text-slate-600">Вложение</span>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={e => { setFile(e.target.files?.[0] ?? null); e.target.value = ''; }}
            />
            {file ? (
              <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <Paperclip size={14} className="shrink-0 text-slate-400" />
                <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{file.name}</span>
                <span className="shrink-0 text-xs text-slate-400">{(file.size / 1024).toFixed(0)} КБ</span>
                <button
                  title="Удалить файл"
                  onClick={() => setFile(null)}
                  className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-1.5 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-700"
              >
                <Paperclip size={14} /> Прикрепить файл
              </button>
            )}
          </div>

        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button className="btn-secondary text-sm" onClick={close}>Отмена</button>
          <button
            className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!canSubmit}
            title={canSubmit ? undefined : 'Заполните обязательные поля'}
            onClick={handleSubmit}
          >
            <CircleCheck size={15} /> Создать
          </button>
        </div>
      </div>
    </div>
  );
};
