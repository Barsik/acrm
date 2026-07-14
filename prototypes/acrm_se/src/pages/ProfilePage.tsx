import { useRef } from 'react';
import { Camera, Trash2, Mail, Phone, Briefcase, Building2, UserRound } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { useApp } from '../context/AppContext';
import { profilesByRole } from '../data/profileData';

export const ProfilePage = () => {
  const { role, profilePhoto, setProfilePhoto } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!role) return null;
  const profile = profilesByRole[role];

  const initials = profile.fullName
    .split(' ')
    .slice(0, 2)
    .map(part => part[0])
    .join('');

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePhoto(String(reader.result));
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handlePhotoRemove = () => setProfilePhoto(null);

  const fields = [
    { label: 'Email', value: profile.email, icon: <Mail size={15} /> },
    { label: 'Телефон', value: profile.phone, icon: <Phone size={15} /> },
    { label: 'Должность', value: profile.position, icon: <Briefcase size={15} /> },
    { label: 'Подразделение', value: profile.department, icon: <Building2 size={15} /> },
    { label: 'Непосредственный руководитель', value: profile.managerName, icon: <UserRound size={15} /> },
  ];

  return (
    <Layout breadcrumbs={[{ label: 'Профиль' }]}>
      <h1 className="mb-5 text-2xl font-bold text-slate-900">Профиль сотрудника</h1>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Фото */}
        <div className="card flex flex-col items-center p-6">
          <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-200 to-slate-300">
            {profilePhoto ? (
              <img src={profilePhoto} alt={profile.fullName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-slate-500">{initials}</span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          <button
            className="btn-primary mt-5 w-full justify-center text-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={15} /> Загрузить фото
          </button>
          {profilePhoto && (
            <button
              className="btn-secondary mt-2 w-full justify-center text-sm"
              onClick={handlePhotoRemove}
            >
              <Trash2 size={15} /> Удалить фото
            </button>
          )}
          <p className="mt-3 text-center text-[11px] text-slate-400">
            JPG или PNG. Фото сохраняется локально в браузере.
          </p>
        </div>

        {/* Данные сотрудника */}
        <div className="card p-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="text-xl font-bold text-slate-900">{profile.fullName}</div>
            <div className="mt-1 text-sm text-slate-500">{profile.position}</div>
          </div>
          <dl className="mt-4 space-y-4">
            {fields.map(field => (
              <div key={field.label} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  {field.icon}
                </span>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{field.label}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-slate-900">{field.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Layout>
  );
};
