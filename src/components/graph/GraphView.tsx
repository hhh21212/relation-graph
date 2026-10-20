// 关系树可视化：d3-force 力导向 + d3-zoom 缩放平移 + d3-drag 拖拽。
// 「我」固定在中心，身边的人环绕；人与人之间的关系用连线标出来。
// 点节点回调 onNodeClick 打开详情。

import { useEffect, useRef } from 'react'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceX,
  forceY,
  forceCollide,
  Simulation,
  SimulationNodeDatum,
  SimulationLinkDatum,
} from 'd3-force'
import { zoom, zoomIdentity, ZoomBehavior } from 'd3-zoom'
import { drag, D3DragEvent } from 'd3-drag'
import { select } from 'd3-selection'
import { Person, RelationshipTag, RELATION_TAG_LABELS } from '../../types/person'
import { EDGE_TAG_LABELS } from '../../types/relation'
import { useStore } from '../../core/storage/store'

interface GNode extends SimulationNodeDatum {
  id: string
  name: string
  isSelf: boolean
  tag: RelationshipTag
}

interface GLink extends SimulationLinkDatum<GNode> {
  source: string | GNode
  target: string | GNode
  kind: 'me' | 'rel'
  label: string
}

const FAMILY: RelationshipTag[] = ['father', 'mother', 'partner', 'child', 'sibling', 'relative']

interface Props {
  onNodeClick: (id: string) => void
}

export default function GraphView({ onNodeClick }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const persons = useStore((s) => s.persons)
  const relations = useStore((s) => s.relations)
  const theme = useStore((s) => s.theme)

  // 用 ref 存回调，避免回调变化导致图重绘
  const clickRef = useRef(onNodeClick)
  clickRef.current = onNodeClick

  useEffect(() => {
    const svgEl = svgRef.current
    if (!svgEl) return

    const cs = getComputedStyle(document.documentElement)
    const accent = cs.getPropertyValue('--color-accent').trim() || '#d8c9a3'
    const accent2 = cs.getPropertyValue('--color-accent-2').trim() || '#a6b0e0'
    const textColor = cs.getPropertyValue('--color-text').trim() || '#f5f1e6'
    const textDim = cs.getPropertyValue('--color-text-dim').trim() || '#9aa3c7'
    const border = cs.getPropertyValue('--color-border').trim() || 'rgba(216,201,163,0.2)'

    const svg = select(svgEl)
    svg.selectAll('*').remove()

    const width = svgEl.clientWidth || window.innerWidth
    const height = svgEl.clientHeight || window.innerHeight

    const self = persons.find((p) => p.isSelf)
    const others = persons.filter((p) => !p.isSelf)

    // 节点
    const nodes: GNode[] = [
      ...(self ? [{ id: self.id, name: self.name, isSelf: true, tag: self.relationTag }] : []),
      ...others.map((o) => ({ id: o.id, name: o.name, isSelf: false, tag: o.relationTag })),
    ]
    const ids = new Set(nodes.map((n) => n.id))

    // 边：我→每个人 + 人与人之间的关系
    const links: GLink[] = []
    if (self) {
      for (const o of others) {
        links.push({ source: self.id, target: o.id, kind: 'me', label: RELATION_TAG_LABELS[o.relationTag] })
      }
    }
    for (const r of relations) {
      if (ids.has(r.a) && ids.has(r.b)) {
        links.push({ source: r.a, target: r.b, kind: 'rel', label: EDGE_TAG_LABELS[r.tag] })
      }
    }

    const colorOf = (n: GNode) => {
      if (n.isSelf) return accent
      if (FAMILY.includes(n.tag)) return accent
      if (n.tag === 'other') return textDim
      return accent2
    }

    // 发光渐变（「我」节点）
    const defs = svg.append('defs')
    const radial = defs.append('radialGradient').attr('id', 'selfGlow')
    radial.append('stop').attr('offset', '0%').attr('stop-color', accent)
    radial.append('stop').attr('offset', '100%').attr('stop-color', 'transparent')

    const root = svg.append('g')

    // 缩放 / 平移
    const zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 2.6])
      .on('zoom', (event) => root.attr('transform', event.transform.toString()))
    svg.call(zoomBehavior).on('dblclick.zoom', null)

    // 初始把坐标原点(0,0)放到画布中心
    svg.call(zoomBehavior.transform, zoomIdentity.translate(width / 2, height / 2))

    // 模拟（关系边更近，让相关的人聚成簇）
    const sim: Simulation<GNode, GLink> = forceSimulation<GNode>(nodes)
      .force(
        'link',
        forceLink<GNode, GLink>(links)
          .id((d) => d.id)
          .distance((d) => (d.kind === 'rel' ? 95 : 170))
          .strength(0.4),
      )
      .force('charge', forceManyBody<GNode>().strength(-300))
      .force('x', forceX<GNode>(0).strength(0.05))
      .force('y', forceY<GNode>(0).strength(0.05))
      .force('collide', forceCollide<GNode>().radius(50))

    if (self) {
      nodes[0].fx = 0
      nodes[0].fy = 0
    }

    // 边（关系边实线高亮，我→人边虚线淡化）
    const linkSel = root
      .append('g')
      .selectAll<SVGLineElement, GLink>('line')
      .data(links)
      .join('line')
      .attr('stroke', (d) => (d.kind === 'rel' ? accent2 : border))
      .attr('stroke-width', (d) => (d.kind === 'rel' ? 1.6 : 1))
      .attr('stroke-dasharray', (d) => (d.kind === 'rel' ? null : '3 5'))
      .attr('opacity', (d) => (d.kind === 'rel' ? 0.75 : 0.6))

    // 边上的关系词
    const labelSel = root
      .append('g')
      .selectAll<SVGTextElement, GLink>('text')
      .data(links)
      .join('text')
      .text((d) => d.label)
      .attr('text-anchor', 'middle')
      .attr('fill', (d) => (d.kind === 'rel' ? accent2 : textDim))
      .attr('font-size', 10)
      .attr('opacity', 0.9)

    // 拖拽行为（「我」不可拖）
    const dragBehavior = drag<SVGGElement, GNode>()
      .filter((_e, d) => !d.isSelf)
      .on('start', (_e: D3DragEvent<SVGGElement, GNode, GNode>, d) => {
        if (!_e.active) sim.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (e: D3DragEvent<SVGGElement, GNode, GNode>, d) => {
        d.fx = e.x
        d.fy = e.y
      })
      .on('end', (_e: D3DragEvent<SVGGElement, GNode, GNode>, d) => {
        if (!_e.active) sim.alphaTarget(0)
        d.fx = null
        d.fy = null
      })

    // 节点
    const nodeSel = root
      .append('g')
      .selectAll<SVGGElement, GNode>('g')
      .data(nodes)
      .join('g')
      .style('cursor', (d) => (d.isSelf ? 'default' : 'pointer'))
      .call(dragBehavior)
      .on('click', (_e, d) => {
        _e.stopPropagation()
        clickRef.current?.(d.id)
      })

    // 光晕
    nodeSel
      .append('circle')
      .attr('r', (d) => (d.isSelf ? 44 : 30))
      .attr('fill', (d) => colorOf(d))
      .attr('opacity', (d) => (d.isSelf ? 0.25 : 0.12))

    // 主体
    nodeSel
      .append('circle')
      .attr('r', (d) => (d.isSelf ? 24 : 15))
      .attr('fill', (d) => (d.isSelf ? 'url(#selfGlow)' : colorOf(d)))
      .attr('stroke', (d) => colorOf(d))
      .attr('stroke-width', (d) => (d.isSelf ? 2 : 1.5))

    // 「我」的中心小点
    nodeSel
      .filter((d) => d.isSelf)
      .append('circle')
      .attr('r', 5)
      .attr('fill', 'rgba(0,0,0,0.55)')

    // 名字
    nodeSel
      .append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => (d.isSelf ? 42 : 30))
      .attr('fill', textColor)
      .attr('font-size', (d) => (d.isSelf ? 15 : 13))
      .attr('font-weight', (d) => (d.isSelf ? 700 : 500))

    // 关系标签（「我」用 accent 显示）
    nodeSel
      .append('text')
      .text((d) => (d.isSelf ? '我' : RELATION_TAG_LABELS[d.tag]))
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => (d.isSelf ? 60 : 46))
      .attr('fill', (d) => (d.isSelf ? accent : textDim))
      .attr('font-size', 11)

    sim.on('tick', () => {
      linkSel
        .attr('x1', (d) => (d.source as GNode).x ?? 0)
        .attr('y1', (d) => (d.source as GNode).y ?? 0)
        .attr('x2', (d) => (d.target as GNode).x ?? 0)
        .attr('y2', (d) => (d.target as GNode).y ?? 0)
      labelSel
        .attr('x', (d) => {
          const s = d.source as GNode
          const t = d.target as GNode
          const f = d.kind === 'me' ? 0.6 : 0.5
          return ((s.x ?? 0) + ((t.x ?? 0) - (s.x ?? 0)) * f)
        })
        .attr('y', (d) => {
          const s = d.source as GNode
          const t = d.target as GNode
          const f = d.kind === 'me' ? 0.6 : 0.5
          return ((s.y ?? 0) + ((t.y ?? 0) - (s.y ?? 0)) * f) - 5
        })
      nodeSel.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    return () => {
      sim.stop()
    }
  }, [persons, relations, theme])

  return <svg ref={svgRef} className="h-full w-full" style={{ touchAction: 'none' }} />
}
