import { USERS } from '../../constants';

export type MembershipTier = 'Gold' | 'Silver' | 'Bronze';
export type AdminUserStatus = 'Active' | 'Inactive' | 'Pending' | 'Deactivated';
export type RuleStatus = 'Active' | 'Inactive';
export type TransactionType = 'Sale' | 'Refund' | 'Fee';
export type PaymentMethod = 'Credit Card' | 'Digital Wallet' | 'Cash' | 'Bank Transfer';

export type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipTier: MembershipTier;
  ltv: number;
  status: AdminUserStatus;
  joinedAt: string;
  lastActiveAt: string;
};

export type PricingRuleRecord = {
  id: string;
  name: string;
  type: 'Base' | 'Add-on' | 'Seating' | 'Modifier';
  amount: number;
  mode: 'fixed' | 'delta';
  description: string;
  status: RuleStatus;
};

export type PricingModifierRecord = {
  id: string;
  name: string;
  condition: string;
  amount: number;
  mode: 'increase' | 'decrease';
  status: RuleStatus;
};

export type FinanceTransactionRecord = {
  id: string;
  date: string;
  type: TransactionType;
  description: string;
  movieTitle: string;
  method: PaymentMethod;
  status: 'Completed' | 'Refunded' | 'Pending';
  amount: number;
  ticketCount: number;
  customerName: string;
};

export type AdminSettingsRecord = {
  general: {
    appName: string;
    supportEmail: string;
    timezone: string;
    language: string;
    bookingFee: number;
    maxTicketsPerUser: number;
    allowGuestCheckout: boolean;
    autoReleaseSeats: boolean;
  };
  branding: {
    primaryColor: string;
    accentColor: string;
    heroHeadline: string;
    footerNote: string;
  };
  notifications: {
    orderEmails: boolean;
    refundAlerts: boolean;
    weeklyReport: boolean;
    lowOccupancyAlert: boolean;
  };
  security: {
    publicApiKey: string;
    requireSms2fa: boolean;
    requireEmail2fa: boolean;
    sessionTimeoutMinutes: number;
  };
  integrations: {
    paymentGateway: string;
    smsProvider: string;
    analyticsProvider: string;
  };
  backup: {
    backupFrequency: string;
    lastBackupAt: string;
    keepSnapshots: number;
  };
};

const STORAGE_KEYS = {
  users: 'utc-admin-users',
  pricingRules: 'utc-admin-pricing-rules',
  pricingModifiers: 'utc-admin-pricing-modifiers',
  transactions: 'utc-admin-transactions',
  settings: 'utc-admin-settings',
};

const DEFAULT_USERS: AdminUserRecord[] = USERS.map((user, index) => ({
  ...user,
  joinedAt: new Date(Date.now() - (index + 14) * 86400000).toISOString(),
  lastActiveAt: new Date(Date.now() - index * 600000).toISOString(),
}));

const DEFAULT_PRICING_RULES: PricingRuleRecord[] = [
  {
    id: 'RULE-BASE-2D',
    name: 'Standard 2D Base',
    type: 'Base',
    amount: 120000,
    mode: 'fixed',
    description: 'Muc gia co ban cho suat chieu 2D.',
    status: 'Active',
  },
  {
    id: 'RULE-3D',
    name: '3D Surcharge',
    type: 'Add-on',
    amount: 30000,
    mode: 'delta',
    description: 'Phu thu cho dinh dang 3D.',
    status: 'Active',
  },
  {
    id: 'RULE-IMAX',
    name: 'IMAX Surcharge',
    type: 'Add-on',
    amount: 50000,
    mode: 'delta',
    description: 'Phu thu cho phong IMAX.',
    status: 'Active',
  },
  {
    id: 'RULE-WEEKEND',
    name: 'Weekend Premium',
    type: 'Modifier',
    amount: 15000,
    mode: 'delta',
    description: 'Tang gia vao cuoi tuan.',
    status: 'Active',
  },
];

const DEFAULT_PRICING_MODIFIERS: PricingModifierRecord[] = [
  {
    id: 'MOD-WEEKDAY',
    name: 'Weekday Saver',
    condition: 'Thu hai den thu nam sau 22:00',
    amount: 10000,
    mode: 'decrease',
    status: 'Active',
  },
  {
    id: 'MOD-HOLIDAY',
    name: 'Holiday Peak',
    condition: 'Ngay le va cuoi tuan',
    amount: 20000,
    mode: 'increase',
    status: 'Active',
  },
  {
    id: 'MOD-STUDENT',
    name: 'Student Discount',
    condition: 'Suat truoc 17:00 cho hoc sinh, sinh vien',
    amount: 15000,
    mode: 'decrease',
    status: 'Inactive',
  },
];

const DEFAULT_TRANSACTIONS: FinanceTransactionRecord[] = [
  {
    id: 'TXN-240401-001',
    date: new Date(Date.now() - 2 * 3600000).toISOString(),
    type: 'Sale',
    description: 'Online ticket sale',
    movieTitle: 'Avengers: Endgame',
    method: 'Credit Card',
    status: 'Completed',
    amount: 240000,
    ticketCount: 3,
    customerName: 'Nguyen Van A',
  },
  {
    id: 'TXN-240401-002',
    date: new Date(Date.now() - 4 * 3600000).toISOString(),
    type: 'Sale',
    description: 'Counter booking',
    movieTitle: 'Dune: Part Two',
    method: 'Cash',
    status: 'Completed',
    amount: 180000,
    ticketCount: 2,
    customerName: 'Tran Thi B',
  },
  {
    id: 'TXN-240401-003',
    date: new Date(Date.now() - 28 * 3600000).toISOString(),
    type: 'Refund',
    description: 'Refund requested for seat issue',
    movieTitle: 'Barbie',
    method: 'Digital Wallet',
    status: 'Refunded',
    amount: -90000,
    ticketCount: 1,
    customerName: 'Le Van C',
  },
  {
    id: 'TXN-240331-001',
    date: new Date(Date.now() - 52 * 3600000).toISOString(),
    type: 'Fee',
    description: 'Payment gateway settlement fee',
    movieTitle: 'System',
    method: 'Bank Transfer',
    status: 'Completed',
    amount: -15000,
    ticketCount: 0,
    customerName: 'Gateway',
  },
  {
    id: 'TXN-240330-003',
    date: new Date(Date.now() - 74 * 3600000).toISOString(),
    type: 'Sale',
    description: 'Online combo booking',
    movieTitle: 'Oppenheimer',
    method: 'Digital Wallet',
    status: 'Completed',
    amount: 320000,
    ticketCount: 4,
    customerName: 'Pham Thi D',
  },
  {
    id: 'TXN-240329-002',
    date: new Date(Date.now() - 98 * 3600000).toISOString(),
    type: 'Sale',
    description: 'Corporate booking',
    movieTitle: 'Avengers: Endgame',
    method: 'Bank Transfer',
    status: 'Completed',
    amount: 560000,
    ticketCount: 7,
    customerName: 'UTC Club',
  },
];

const DEFAULT_SETTINGS: AdminSettingsRecord = {
  general: {
    appName: 'UTCCINEMA',
    supportEmail: 'support@utccinema.com',
    timezone: 'UTC+7 (Bangkok, Hanoi, Jakarta)',
    language: 'Vietnamese',
    bookingFee: 2500,
    maxTicketsPerUser: 8,
    allowGuestCheckout: false,
    autoReleaseSeats: true,
  },
  branding: {
    primaryColor: '#D4AF37',
    accentColor: '#F7E3A1',
    heroHeadline: 'Experience the gold standard of cinema.',
    footerNote: 'Powered by UTC Cinema Admin',
  },
  notifications: {
    orderEmails: true,
    refundAlerts: true,
    weeklyReport: true,
    lowOccupancyAlert: false,
  },
  security: {
    publicApiKey: 'pk_live_51Mv9X6L2h8G4j7K1m9n0p3q5r7s9t1u3v5w7x9y0z2',
    requireSms2fa: false,
    requireEmail2fa: true,
    sessionTimeoutMinutes: 90,
  },
  integrations: {
    paymentGateway: 'VNPay',
    smsProvider: 'Twilio',
    analyticsProvider: 'Google Analytics 4',
  },
  backup: {
    backupFrequency: 'Weekly',
    lastBackupAt: new Date(Date.now() - 86400000).toISOString(),
    keepSnapshots: 10,
  },
};

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getAdminUsers() {
  return readStorage(STORAGE_KEYS.users, DEFAULT_USERS);
}

export function saveAdminUsers(users: AdminUserRecord[]) {
  writeStorage(STORAGE_KEYS.users, users);
}

export function getPricingRules() {
  return readStorage(STORAGE_KEYS.pricingRules, DEFAULT_PRICING_RULES);
}

export function savePricingRules(rules: PricingRuleRecord[]) {
  writeStorage(STORAGE_KEYS.pricingRules, rules);
}

export function getPricingModifiers() {
  return readStorage(STORAGE_KEYS.pricingModifiers, DEFAULT_PRICING_MODIFIERS);
}

export function savePricingModifiers(modifiers: PricingModifierRecord[]) {
  writeStorage(STORAGE_KEYS.pricingModifiers, modifiers);
}

export function getFinanceTransactions() {
  return readStorage(STORAGE_KEYS.transactions, DEFAULT_TRANSACTIONS);
}

export function saveFinanceTransactions(transactions: FinanceTransactionRecord[]) {
  writeStorage(STORAGE_KEYS.transactions, transactions);
}

export function getAdminSettings() {
  return readStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
}

export function saveAdminSettings(settings: AdminSettingsRecord) {
  writeStorage(STORAGE_KEYS.settings, settings);
}

export function exportToCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    )
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('vi-VN');
}

export function isSameDay(dateString: string, target: Date) {
  const date = new Date(dateString);
  return (
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth() &&
    date.getDate() === target.getDate()
  );
}

export function getDateRangeLabel(range: string) {
  switch (range) {
    case 'Last 7 Days':
      return 7;
    case 'Last 24 Hours':
      return 1;
    case 'Last 30 Days':
      return 30;
    default:
      return 30;
  }
}
