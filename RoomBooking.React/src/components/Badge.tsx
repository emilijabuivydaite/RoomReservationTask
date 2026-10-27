import type { ReactNode } from 'react';

interface Props {
  variant: 'primary' | 'success' | 'secondary' | 'danger' | 'light';
  className?: string;
  children: ReactNode;
}

export default function Badge({ variant, className = '', children }: Props) {
  return (
    <span className={`badge text-bg-${variant} ${className}`.trim()}>
      {children}
    </span>
  );
}
