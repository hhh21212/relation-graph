// 导出图片：把命盘 / 合盘结果画成一张暗色金字的卡片长图（PNG），便于保存与分享。
// 不依赖第三方库，直接用 canvas 绘制，PWA 离线也能用。

export interface ExportSection {
  heading: string
  lines?: string[]
  chips?: string[]
}

interface ExportOpts {
  filename: string
  title: string
  subtitle?: string
  sections: ExportSection[]
  footer?: string
}

const BG = '#0b1020'
const GOLD = '#e3b341'
const GOLD_SOFT = '#c9a86a'
const TEXT = '#e8e2d4'
const DIM = '#8f96ad'
const LINE = 'rgba(227,179,65,0.35)'

const W = 720
const PAD = 48
const FONT_HEAD = '"KaiTi","STKaiti","SimSun",serif'
const FONT_BODY = '"PingFang SC","Microsoft YaHei","SimHei",sans-serif'

const TITLE_SIZE = 40
const SUB_SIZE = 22
const HEAD_SIZE = 26
const BODY_SIZE = 21
const CHIP_H = 34

// 行高（与下方 draw 里的推进量严格一致）
const TITLE_LH = 52
const SUB_LH = 30
const BODY_LH = 33
const CHIP_LH = 44

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string): string[] {
  ctx.font = font
  const out: string[] = []
  let line = ''
  for (const ch of text) {
    const t = line + ch
    if (ctx.measureText(t).width > maxWidth && line.length > 0) {
      out.push(line)
      line = ch
    } else {
      line = t
    }
  }
  if (line) out.push(line)
  return out
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function exportCardImage(opts: ExportOpts): void {
  const measure = document.createElement('canvas').getContext('2d')!
  const contentW = W - PAD * 2
  const bodyFont = `${BODY_SIZE}px ${FONT_BODY}`

  // 预排版：每个 section 拆成若干「文本行 / 芯片行」
  interface TextLine { kind: 'text'; text: string }
  interface ChipRow { kind: 'chips'; chips: { x: number; w: number; text: string }[] }
  type Line = TextLine | ChipRow
  const blocks: { heading: string; lines: Line[] }[] = []

  for (const sec of opts.sections) {
    const lines: Line[] = []
    for (const l of sec.lines ?? []) {
      for (const wl of wrap(measure, l, contentW, bodyFont)) lines.push({ kind: 'text', text: wl })
    }
    const chips = sec.chips ?? []
    if (chips.length) {
      measure.font = bodyFont
      const rows: ChipRow['chips'][] = [[]]
      let x = PAD
      for (const c of chips) {
        const w = measure.measureText(c).width + 24
        if (rows[rows.length - 1].length > 0 && x + w > W - PAD) {
          rows.push([])
          x = PAD
        }
        rows[rows.length - 1].push({ x, w, text: c })
        x += w + 12
      }
      for (const row of rows) lines.push({ kind: 'chips', chips: row })
    }
    blocks.push({ heading: sec.heading, lines })
  }

  const titleFont = `bold ${TITLE_SIZE}px ${FONT_HEAD}`
  const subFont = `${SUB_SIZE}px ${FONT_BODY}`
  const headFont = `bold ${HEAD_SIZE}px ${FONT_HEAD}`
  const titleLines = wrap(measure, opts.title, contentW, titleFont)
  const subLines = opts.subtitle ? wrap(measure, opts.subtitle, contentW, subFont) : []
  const footerLines = opts.footer ? wrap(measure, opts.footer, contentW, subFont) : []

  // 算总高度（与 draw 里的推进量一致）
  let h = PAD + titleLines.length * TITLE_LH
  if (subLines.length) h += 10 + subLines.length * SUB_LH
  h += 14 + 22 // 分隔线前后
  for (const b of blocks) {
    h += 24 + HEAD_SIZE + 12 // 标题区
    for (const l of b.lines) h += l.kind === 'text' ? BODY_LH : CHIP_LH
  }
  if (footerLines.length) h += 28 + footerLines.length * SUB_LH
  h += PAD

  const scale = 2
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(W * scale)
  canvas.height = Math.ceil(h * scale)
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)

  // 背景
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, W, h)

  ctx.textBaseline = 'top'
  let y = PAD

  // 标题
  ctx.font = titleFont
  ctx.fillStyle = GOLD
  for (const l of titleLines) {
    ctx.fillText(l, PAD, y)
    y += TITLE_LH
  }

  // 副标题
  if (subLines.length) {
    y += 10
    ctx.font = subFont
    ctx.fillStyle = DIM
    for (const l of subLines) {
      ctx.fillText(l, PAD, y)
      y += SUB_LH
    }
  }

  // 分隔线
  y += 14
  ctx.strokeStyle = LINE
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PAD, y)
  ctx.lineTo(W - PAD, y)
  ctx.stroke()
  y += 22

  // 各 section
  for (const b of blocks) {
    y += 24
    ctx.font = headFont
    ctx.fillStyle = GOLD_SOFT
    ctx.fillText(`✦ ${b.heading}`, PAD, y)
    y += HEAD_SIZE + 12

    for (const l of b.lines) {
      if (l.kind === 'text') {
        ctx.font = bodyFont
        ctx.fillStyle = TEXT
        ctx.fillText(l.text, PAD, y)
        y += BODY_LH
      } else {
        for (const c of l.chips) {
          roundRectPath(ctx, c.x, y, c.w, CHIP_H, 17)
          ctx.fillStyle = 'rgba(227,179,65,0.08)'
          ctx.fill()
          ctx.strokeStyle = LINE
          ctx.stroke()
          ctx.font = bodyFont
          ctx.fillStyle = GOLD
          ctx.fillText(c.text, c.x + 12, y + (CHIP_H - BODY_SIZE) / 2)
        }
        y += CHIP_LH
      }
    }
  }

  // 页脚
  if (footerLines.length) {
    y += 28
    ctx.font = subFont
    ctx.fillStyle = DIM
    for (const l of footerLines) {
      ctx.fillText(l, PAD, y)
      y += SUB_LH
    }
  }

  // 触发下载
  const a = document.createElement('a')
  a.download = opts.filename
  a.href = canvas.toDataURL('image/png')
  a.click()
}
