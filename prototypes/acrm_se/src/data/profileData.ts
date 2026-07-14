// Мок-профили сотрудников по ролям для страницы «Профиль».
import type { UserRole } from '../types';

export interface EmployeeProfile {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  managerName: string;
}

export const profilesByRole: Record<UserRole, EmployeeProfile> = {
  manager: {
    fullName: 'Воронов Алексей Петрович',
    email: 'a.voronov@moex.com',
    phone: '+7 (495) 363-32-32, доб. 1274',
    position: 'Клиентский менеджер',
    department: 'Департамент по работе с клиентами · Клиентский блок',
    managerName: 'Соколова Ирина Владимировна',
  },
  block_head: {
    fullName: 'Соколова Ирина Владимировна',
    email: 'i.sokolova@moex.com',
    phone: '+7 (495) 363-32-32, доб. 1105',
    position: 'Руководитель клиентского блока',
    department: 'Клиентский блок',
    managerName: 'Гринёв Дмитрий Николаевич',
  },
  market_lead: {
    fullName: 'Кузнецова Мария Андреевна',
    email: 'm.kuznetsova@moex.com',
    phone: '+7 (495) 363-32-32, доб. 1418',
    position: 'Руководитель направления рынков',
    department: 'Департамент рынков и продуктов',
    managerName: 'Гринёв Дмитрий Николаевич',
  },
  operations: {
    fullName: 'Смирнов Павел Олегович',
    email: 'p.smirnov@moex.com',
    phone: '+7 (495) 363-32-32, доб. 1562',
    position: 'Специалист операционного контура',
    department: 'Операционный департамент',
    managerName: 'Соколова Ирина Владимировна',
  },
  ceo: {
    fullName: 'Гринёв Дмитрий Николаевич',
    email: 'd.grinev@moex.com',
    phone: '+7 (495) 363-32-32, доб. 1001',
    position: 'Председатель Правления',
    department: 'Правление',
    managerName: 'Наблюдательный совет',
  },
};

export const profilePhotoKey = (role: UserRole) => `acrm_profile_photo_${role}`;
