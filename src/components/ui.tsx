import type { ReactNode } from 'react';
import { type ButtonHTMLAttributes } from 'react';

export const COLORS = {
  ivory: '#F8F3EA',
  terracotta: '#C65D3B',
  charcoal: '#242321',
  olive: '#68745A',
  gold: '#C79A4B',
  white: '#FFFFFF',
  success: '#5B8C5A',
  warning: '#D97757',
  error: '#C73E3E',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}) {
  const base = 'rounded-lg font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3.5 text-lg',
  };
  const variants = {
    primary: 'bg-[#C65D3B] text-white hover:bg-[#B04D2F] shadow-sm',
    secondary: 'bg-[#68745A] text-white hover:bg-[#5A6650] shadow-sm',
    outline: 'border-2 border-[#C65D3B] text-[#C65D3B] hover:bg-[#C65D3B] hover:text-white',
    ghost: 'text-[#242321] hover:bg-black/5',
    danger: 'bg-[#C73E3E] text-white hover:bg-[#A83535]',
    success: 'bg-[#5B8C5A] text-white hover:bg-[#4A7A49]',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-stone-200 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'demo' | 'ai' }) {
  const variants = {
    default: 'bg-stone-100 text-stone-700',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-orange-100 text-orange-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    demo: 'bg-amber-100 text-amber-800 border border-amber-300',
    ai: 'bg-purple-100 text-purple-800',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    'Open for Recycler Quotes': 'info',
    'Quote Received': 'info',
    'Quote Accepted': 'success',
    'Pickup Scheduled': 'info',
    'Handover Completed': 'success',
    'Payment Completed': 'success',
    'Transaction Completed': 'success',
    'Offline Pending Sync': 'warning',
    Pending: 'warning',
    Countered: 'warning',
    Accepted: 'success',
    Rejected: 'error',
    Expired: 'error',
    Completed: 'success',
    Paid: 'success',
    Failed: 'error',
  };
  return <Badge variant={statusMap[status] ?? 'default'}>{status}</Badge>;
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <div className="w-8 h-8 border-3 border-[#C65D3B] border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px' }} />
      {label && <p className="text-sm text-stone-500">{label}</p>}
    </div>
  );
}

export function EmptyState({ icon, title, message, action }: { icon?: ReactNode; title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="text-stone-300 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-stone-700 mb-1">{title}</h3>
      <p className="text-sm text-stone-500 mb-4">{message}</p>
      {action}
    </div>
  );
}

export function DemoBanner({ text }: { text: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
      <p className="text-xs text-amber-800 font-medium">{text}</p>
    </div>
  );
}

export function StatCard({ label, value, sublabel, icon }: { label: string; value: string; sublabel?: string; icon?: ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-stone-800 mt-1">{value}</p>
          {sublabel && <p className="text-xs text-stone-400 mt-1">{sublabel}</p>}
        </div>
        {icon && <div className="text-[#C65D3B]">{icon}</div>}
      </div>
    </Card>
  );
}

export function SectionTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-stone-800">{children}</h2>
      {subtitle && <p className="text-sm text-stone-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export function Modal({ children, onClose, title }: { children: ReactNode; onClose: () => void; title?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
            <h2 className="text-lg font-bold text-stone-800">{title}</h2>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-2xl leading-none">&times;</button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function ProgressBar({ value, max = 100, color = '#C65D3B' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export function SimpleBarChart({ data, labels, color = '#C65D3B', height = 120 }: { data: number[]; labels?: string[]; color?: string; height?: number }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
          <div
            className="w-full rounded-t transition-all duration-500"
            style={{ height: `${(val / max) * 100}%`, backgroundColor: color, minHeight: '2px' }}
          />
          {labels && labels[i] && <span className="text-[10px] text-stone-400">{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
}

export function LineChart({ data, labels, color = '#C65D3B', height = 100 }: { data: number[]; labels?: string[]; color?: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 10) - 5;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
        {data.map((val, i) => {
          const x = (i / (data.length - 1)) * width;
          const y = height - ((val - min) / range) * (height - 10) - 5;
          return <circle key={i} cx={x} cy={y} r="1" fill={color} />;
        })}
      </svg>
      {labels && (
        <div className="flex justify-between mt-1">
          {labels.map((l, i) => (
            <span key={i} className="text-[10px] text-stone-400">{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
