'use client'

import React, {useEffect, useState, useRef, Suspense} from 'react'
import {useSearchParams} from 'next/navigation'
import * as d3 from 'd3'

function Graph() {
  const searchParams = useSearchParams()
  const initialGraph = {nodes: [{id: 1, name: searchParams.get('topic') || 'No topic', fx: 480, fy: 300}], links: []}
  const [graph, setGraph] = useState(initialGraph)
  const [sentence, setSentence] = useState('')
  const svgRef = useRef(null)

  const handleNodeClick = node => {
    const angleStep = (2 * Math.PI) / 3 // for three children
    const newNodes = Array.from({length: 3}, (_, i) => {
      const angle = i * angleStep
      return {
        id: graph.nodes.length + i + 1,
        name: `${node.name}${i + 1}`,
        x: node.x + 50 * Math.cos(angle),
        y: node.y + 50 * Math.sin(angle)
      }
    })
    const newLinks = newNodes.map(newNode => ({source: node.id, target: newNode.id}))

    setGraph(prevGraph => ({
      nodes: [...prevGraph.nodes, ...newNodes],
      links: [...prevGraph.links, ...newLinks]
    }))
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    const width = +svg.attr('width')
    const height = +svg.attr('height')

    const simulation = d3
      .forceSimulation(graph.nodes)
      .force(
        'link',
        d3
          .forceLink(graph.links)
          .id(d => d.id)
          .distance(50)
          .strength(1)
      )
      .force('charge', d3.forceManyBody().strength(-500))
      .force('collision', d3.forceCollide().radius(40))
      .on('tick', ticked)

    let link = svg.selectAll('.link')
    let node = svg.selectAll('.node')

    function ticked() {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node.attr('transform', d => `translate(${d.x},${d.y})`)
    }

    function update() {
      const links = graph.links
      const nodes = graph.nodes

      link = link.data(links, d => `${d.source.id}-${d.target.id}`)
      link.exit().remove()
      link = link.enter().append('line').attr('class', 'link').style('stroke', '#999').style('stroke-width', '2px').merge(link)

      node = node.data(nodes, d => d.id)
      simulation.nodes(nodes)

      node.exit().remove()
      const nodeEnter = node
        .enter()
        .append('g')
        .attr('class', 'node')
        .on('click', (event, d) => {
          handleNodeClick(d)
          update()
        })
        .call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended))

      nodeEnter.append('circle').attr('r', 20).style('fill', '#d9d9d9')

      nodeEnter
        .append('text')
        .attr('class', 'text')
        .attr('dy', 4)
        .attr('x', -10)
        .style('font-size', '12px')
        .text(d => d.name)

      node = nodeEnter.merge(node)

      // Ensure node A remains fixed
      graph.nodes.forEach(d => {
        if (d.id === 1) {
          d.fx = 480
          d.fy = 300
        }
      })

      simulation.force('link').links(links)
      simulation.alpha(1).restart()
    }

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      if (d.id !== 1) {
        // 노드 A는 드래그 시작해도 고정
        d.fx = d.x
        d.fy = d.y
      }
    }

    function dragged(event, d) {
      if (d.id !== 1) {
        // 노드 A는 드래그 중에도 고정
        d.fx = event.x
        d.fy = event.y
      }
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0)
      if (d.id !== 1) {
        // 노드 A는 드래그 끝난 후에도 고정
        d.fx = null
        d.fy = null
      }
    }

    update()
  }, [graph])

  const handleMake = () => {
    alert(`Sentence: ${sentence}`)
  }

  return (
    <div className="text-center flex flex-col justify-between min-h-screen">
      <svg ref={svgRef} width="960" height="600"></svg>

      <div className="mb-16 flex items-center justify-center w-full">
        <input
          type="text"
          placeholder="MAKE A SENTENCE USING THE CHOSEN WORD"
          className="w-128 p-3 border rounded-md text-lg"
          value={sentence}
          onChange={e => setSentence(e.target.value)}
        />
        <button className="ml-4 p-3 bg-gray-400 rounded-md text-lg" onClick={handleMake}>
          MAKE
        </button>
      </div>
    </div>
  )
}

export default () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Graph />
  </Suspense>
)
