'use client'
import {useEffect, useState, useRef, Suspense} from 'react'
import {useSearchParams} from 'next/navigation'
import * as d3 from 'd3'
import OpenAI from 'openai'
import dotenv from 'dotenv'
dotenv.config()

function Graph() {
  const searchParams = useSearchParams()
  const [graph, setGraph] = useState({nodes: [{id: 1, name: searchParams.get('topic') || 'No topic', fx: 480, fy: 300}], links: []})
  const [sentence, setSentence] = useState('')
  const [loadingNode, setLoadingNode] = useState(null)
  const svgRef = useRef(null)
  const openai = new OpenAI({apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY, dangerouslyAllowBrowser: true})

  const handleNodeClick = async node => {
    setLoadingNode(node.id)
    const content = `""키워드"": ${node.name}\n""키메시지"": ${searchParams.get('key') || ''}\n*[최종 답변 형태] 외 답변 금지\n**[답변 금지 단어]: ${graph.nodes.map(node => node.name).join(', ')}`
    const json = await (await fetch(`${searchParams.get('mood')}.json`)).json() //분위기 json 가져오기
    json.messages.push({role: 'user', content})
    const response = await openai.chat.completions.create(json)
    const [keyword, relatedWords] = response.choices[0].message.content.match(/(?<=1개: ).+|(?<=6개: ).+/g).map(words => words.split(', '))
    const newNodes = [keyword, ...relatedWords].map((name, i) => ({id: graph.nodes.length + i + 1, name, x: node.x + 50 * Math.cos(i / 2), y: node.y + 50 * Math.sin(i / 2)}))
    setGraph(prevGraph => ({nodes: [...prevGraph.nodes, ...newNodes], links: [...prevGraph.links, ...newNodes.map(newNode => ({source: node.id, target: newNode.id}))]}))
    setLoadingNode(null)
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    const linkGroup = svg.append('g').attr('class', 'links')
    const nodeGroup = svg.append('g').attr('class', 'nodes')
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
      .on('tick', () => {
        linkGroup
          .selectAll('line')
          .data(graph.links)
          .join('line')
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)
          .attr('stroke', '#999')
          .attr('stroke-width', 2)
        nodeGroup
          .selectAll('g')
          .data(graph.nodes)
          .join(enter => {
            const nodeEnter = enter
              .append('g')
              .attr('class', 'node')
              .on('click', (e, d) => handleNodeClick(d))
              .call(
                d3
                  .drag()
                  .on('start', (e, d) => {
                    if (!e.active) simulation.alphaTarget(0.3).restart()
                    d.fx = d.x
                    d.fy = d.y
                  })
                  .on('drag', (e, d) => {
                    d.fx = e.x
                    d.fy = e.y
                  })
                  .on('end', (e, d) => {
                    if (!e.active) simulation.alphaTarget(0)
                    if (d.id !== 1) {
                      d.fx = null
                      d.fy = null
                    }
                  })
              )
              .on('mouseenter', function (e, d) {
                d3.select(this).select('circle').attr('fill', '#ffa500') // Change the node color on hover
                svg.style('cursor', 'pointer') // Change cursor to pointer
              })
              .on('mouseleave', function (e, d) {
                d3.select(this).select('circle').attr('fill', '#d9d9d9') // Revert the node color
                svg.style('cursor', 'default') // Revert cursor to default
              })
            nodeEnter.append('circle').attr('r', 20).attr('fill', '#d9d9d9')
            nodeEnter
              .append('text')
              .attr('dy', 4)
              .attr('x', -10)
              .attr('font-size', 12)
              .text(d => d.name)
            nodeEnter.each(function (d) {
              if (loadingNode === d.id) {
                d3.select(this)
                  .append('svg')
                  .attr('x', -35)
                  .attr('y', -35)
                  .attr('width', 70)
                  .attr('height', 70)
                  .attr('viewBox', '0 0 200 200')
                  .html(
                    "<radialGradient id='a10' cx='.66' fx='.66' cy='.3125' fy='.3125' gradientTransform='scale(1.5)'><stop offset='0' stop-color='#000000'></stop><stop offset='.3' stop-color='#000000' stop-opacity='.9'></stop><stop offset='.6' stop-color='#000000' stop-opacity='.6'></stop><stop offset='.8' stop-color='#000000' stop-opacity='.3'></stop><stop offset='1' stop-color='#000000' stop-opacity='0'></stop></radialGradient><circle transform-origin='center' fill='none' stroke='url(#a10)' stroke-width='15' stroke-linecap='round' stroke-dasharray='200 1000' stroke-dashoffset='0' cx='100' cy='100' r='70'><animateTransform type='rotate' attributeName='transform' calcMode='spline' dur='2' values='360;0' keyTimes='0;1' keySplines='0 0 1 1' repeatCount='indefinite'></animateTransform></circle><circle transform-origin='center' fill='none' opacity='.2' stroke='#000000' stroke-width='15' stroke-linecap='round' cx='100' cy='100' r='70'></circle>"
                  )
              }
            })
            return nodeEnter
          })
          .attr('transform', d => `translate(${d.x},${d.y})`)
      })
    simulation.nodes(graph.nodes)
    simulation.force('link').links(graph.links)
    simulation.alpha(1).restart()
  }, [graph, loadingNode])

  return (
    <>
      <svg ref={svgRef} width="960" height="600"></svg>
      <div className="mb-16 flex w-full items-center justify-center">
        <input type="text" placeholder="MAKE A SENTENCE USING THE CHOSEN WORD" value={sentence} onChange={e => setSentence(e.target.value)} />
        <button className="ml-4 rounded-md bg-gray-400 p-3 text-lg" onClick={() => alert(`Sentence: ${sentence}`)}>
          MAKE
        </button>
      </div>
    </>
  )
}

export default () => (
  <Suspense>
    <Graph />
  </Suspense>
)
