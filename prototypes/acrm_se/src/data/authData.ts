export type AuthAccessRole = 'employee' | 'leader';

export interface EmployeeRecord {
  login: string;
  fullName: string;
  employeeNumber: string;
}

export interface AccessRecord {
  login: string;
  role: AuthAccessRole;
}

export const employeeTable: EmployeeRecord[] = [
  {
    login: 'admin_s@moex.com',
    fullName: 'Иванов Алексей Петрович',
    employeeNumber: '10012',
  },
  {
    login: 'admin_r@moex.com',
    fullName: 'Петрова Марина Сергеевна',
    employeeNumber: '20033',
  },
];

export const accessTable: AccessRecord[] = [
  { login: 'admin_s@moex.com', role: 'employee' },
  { login: 'admin_r@moex.com', role: 'leader' },
];

export const demoPassword = '123456';

export const authenticateUser = (login: string, password: string) => {
  const normalizedLogin = login.trim().toLowerCase();
  const employee = employeeTable.find((item) => item.login.toLowerCase() === normalizedLogin);

  if (!employee || password !== demoPassword) {
    return null;
  }

  const access = accessTable.find((item) => item.login.toLowerCase() === normalizedLogin);

  if (!access) {
    return null;
  }

  return {
    employee,
    access,
  };
};
