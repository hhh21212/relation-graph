// 求签音效：竹片相碰 + 木质共振 + 出签钟磬（从「三清观求签」原程序原样搬入）。
// 全部用 WebAudio 合成，不依赖任何音频文件。

let audioCtx: AudioContext | null = null

function ensureAudio() {
  if (!audioCtx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (AC) audioCtx = new AC()
  }
  if (audioCtx && audioCtx.state === 'suspended') void audioCtx.resume()
}

// 一次「竹片相碰」：短促噪声瞬态 + 木质共振体
function clack(time: number, intensity: number) {
  if (!audioCtx) return
  const ctx = audioCtx

  // 噪声瞬态（竹片碰击的「嗒」）
  const dur = 0.018 + intensity * 0.02
  const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3)
  const src = ctx.createBufferSource()
  src.buffer = buf
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 1700 + Math.random() * 1400
  bp.Q.value = 2.8
  const g = ctx.createGain()
  g.gain.value = 0.22 + intensity * 0.5
  src.connect(bp)
  bp.connect(g)
  g.connect(ctx.destination)
  src.start(time)

  // 木质共振体（低沉短促的「咚」）
  const o = ctx.createOscillator()
  o.type = 'triangle'
  o.frequency.setValueAtTime(820 + Math.random() * 620, time)
  o.frequency.exponentialRampToValueAtTime(360, time + 0.085)
  const og = ctx.createGain()
  og.gain.setValueAtTime(0.12 + intensity * 0.22, time)
  og.gain.exponentialRampToValueAtTime(0.0001, time + 0.14)
  o.connect(og)
  og.connect(ctx.destination)
  o.start(time)
  o.stop(time + 0.16)
}

/** 摇签过程中的一连串竹片碰撞声（越到后越重） */
export function playShakeSounds() {
  ensureAudio()
  if (!audioCtx) return
  const now = audioCtx.currentTime
  const n = 20
  for (let k = 0; k < n; k++) {
    const t = now + k * (3.3 / n) + Math.random() * 0.035
    const intensity = 0.3 + Math.pow(k / n, 1.4) * 0.7
    clack(t, intensity)
    // 偶尔两片几乎同时相碰
    if (k % 3 === 1) clack(t + 0.012 + Math.random() * 0.02, intensity * 0.8)
  }
}

/** 铜钱落地：一声清脆金属响（六爻摇卦用） */
export function playCoinToss() {
  ensureAudio()
  if (!audioCtx) return
  const ctx = audioCtx
  const now = ctx.currentTime
  ;[1567, 2093].forEach((f) => {
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = f
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.14, now)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)
    o.connect(g)
    g.connect(ctx.destination)
    o.start(now)
    o.stop(now + 0.22)
  })
}

/** 出签：两声竹片 + 一记钟磬清音 */
export function playRise() {
  ensureAudio()
  if (!audioCtx) return
  const ctx = audioCtx
  const now = ctx.currentTime
  clack(now, 1.0)
  clack(now + 0.07, 0.85)
  ;[880, 1318.5, 1760].forEach((f, i) => {
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = f
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, now + 0.1)
    g.gain.exponentialRampToValueAtTime(0.15 / (i + 1), now + 0.13)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.5)
    o.connect(g)
    g.connect(ctx.destination)
    o.start(now + 0.1)
    o.stop(now + 1.6)
  })
}
