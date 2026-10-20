// 通用按钮：primary（主）/ ghost（次）/ danger（危险）

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  children: ReactNode
}

export default function Button({ variant = 'primary', children, className = '', ...rest }: ButtonProps) {
  const base = 'tap-target inline-flex items-center justify-center gap-1 rounded-xl px-4 py-2 text-sm font-medium transition active:scale-95 disabled:opacity-40'
  const styles: Record<string, string> = {
    primary: 'text-[#0b1020]',
    ghost: 'border text-current',
    danger: 'border text-current',
  }
  const inline: React.CSSProperties =
    variant === 'primary'
      ? {
          background: 'linear-gradient(180deg, var(--color-gold-bright) 0%, var(--color-gold) 100%)',
          color: '#0b1020',
          boxShadow: '0 0 18px var(--glow)',
        }
      : variant === 'danger'
        ? { borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }
        : { borderColor: 'var(--color-border)', color: 'var(--color-text)' }

  return (
    <button className={`${base} ${styles[variant]} ${className}`} style={inline} {...rest}>
      {children}
    </button>
  )
}
