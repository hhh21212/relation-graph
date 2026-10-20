// 导出文本报告：把命盘 / 合盘结果拼成一份纯文本（.txt），方便留存或打印。
// 加 UTF-8 BOM，Windows 记事本打开中文不乱码。

export interface TextSection {
  heading: string
  lines?: string[]
  chips?: string[]
}

interface TextOpts {
  filename: string
  title: string
  subtitle?: string
  sections: TextSection[]
  footer?: string
}

export function exportTextFile(opts: TextOpts): void {
  const sep = '━'.repeat(32)
  const lines: string[] = []

  lines.push(opts.title)
  if (opts.subtitle) lines.push(opts.subtitle)
  lines.push(sep)

  for (const sec of opts.sections) {
    lines.push('')
    lines.push(`✦ ${sec.heading}`)
    for (const l of sec.lines ?? []) lines.push(`　${l}`)
    if ((sec.chips ?? []).length) lines.push(`　${sec.chips!.join('、')}`)
  }

  if (opts.footer) {
    lines.push('')
    lines.push(sep)
    lines.push(opts.footer)
  }

  // 文本报告带时间戳，方便区分多次导出
  const now = new Date()
  lines.push(`生成于 ${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`)

  const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = opts.filename
  a.click()
  URL.revokeObjectURL(url)
}
