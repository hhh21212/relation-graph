// 首次进入：先输入「我」的生日（可选时辰），之后才能挂上身边的人。

import { useState } from 'react'
import { Person } from '../types/person'
import { useStore, newId } from '../core/storage/store'
import Button from './ui/Button'

export default function Onboarding() {
  const setSelf = useStore((s) => s.setSelf)
  const [name, setName] = useState('我')
  const [year, setYear] = useState(1990)
  const [month, setMonth] = useState(6)
  const [day, setDay] = useState(15)
  const [hasHour, setHasHour] = useState(false)
  const [hour, setHour] = useState(12)
  const [gender, setGender] = useState<'male' | 'female' | ''>('')

  const submit = () => {
    if (!name.trim()) return
    if (!gender) {
      alert('请选择性别')
      return
    }
    const p: Person = {
      id: newId(),
      name: name.trim(),
      birthYear: year,
      birthMonth: month,
      birthDay: day,
      hour: hasHour ? hour : undefined,
      gender,
      isSelf: true,
      relationTag: 'self',
      createdAt: Date.now(),
    }
    setSelf(p)
  }

  const inputCls =
    'w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none'
  const inputStyle = { borderColor: 'var(--color-border)', color: 'var(--color-text)' } as const

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mb-6 text-center">
        <div className="text-4xl">🌙</div>
        <h1 className="font-kai mt-3 text-2xl font-bold text-gold-glow">
          关系树 · 人际合盘
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-text-dim)' }}>
          先填「我」的生日，软件会帮你说人话，不用懂命理。
          <br />
          有出生时辰更细，不知道也可以先留空。
        </p>
      </div>

      <div className="card w-full max-w-sm space-y-3 p-5">
        <label className="block">
          <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
            名字（默认「我」）
          </span>
          <input
            className={inputCls}
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <div>
          <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
            生日（公历）
          </span>
          <div className="grid grid-cols-3 gap-2">
            <input
              className={inputCls}
              style={inputStyle}
              type="number"
              value={year}
              min={1900}
              max={2100}
              onChange={(e) => setYear(Number(e.target.value))}
              aria-label="年"
            />
            <input
              className={inputCls}
              style={inputStyle}
              type="number"
              value={month}
              min={1}
              max={12}
              onChange={(e) => setMonth(Number(e.target.value))}
              aria-label="月"
            />
            <input
              className={inputCls}
              style={inputStyle}
              type="number"
              value={day}
              min={1}
              max={31}
              onChange={(e) => setDay(Number(e.target.value))}
              aria-label="日"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            checked={hasHour}
            onChange={(e) => setHasHour(e.target.checked)}
          />
          <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
            我知道出生时辰
          </span>
        </label>

        {hasHour && (
          <label className="block">
            <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
              几点出生（0–23 点）
            </span>
            <input
              className={inputCls}
              style={inputStyle}
              type="number"
              value={hour}
              min={0}
              max={23}
              onChange={(e) => setHour(Number(e.target.value))}
            />
          </label>
        )}

        <div>
          <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
            性别（用于排大运）
          </span>
          <div className="grid grid-cols-2 gap-2">
            {([
              ['male', '男'],
              ['female', '女'],
            ] as const).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setGender(val)}
                className="rounded-xl border px-3 py-2.5 text-sm transition"
                style={{
                  borderColor: gender === val ? 'var(--color-accent)' : 'var(--color-border)',
                  color: gender === val ? 'var(--color-accent)' : 'var(--color-text-dim)',
                  background: gender === val ? 'var(--color-card)' : 'transparent',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={submit} className="w-full">
          开始使用
        </Button>
      </div>

      <p className="mt-4 max-w-xs text-center text-[11px]" style={{ color: 'var(--color-text-dim)' }}>
        数据只存在你自己的设备里，不上传、不注册。
        结果仅供娱乐参考。
      </p>
    </div>
  )
}
