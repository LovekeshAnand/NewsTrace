class GraphAnalyzer {
  buildJournalistTopicGraph(journalists) {
    const nodes = [];
    const edges = [];
    const topicMap = new Map();

    journalists.forEach(j => {
      const jId = `journalist_${j._id || j.name}`;
      nodes.push({
        id: jId, label: j.name, type: 'journalist',
        size: j.articleCount || 0,
        metadata: { articleCount: j.articleCount, email: j.email, profileUrl: j.profileUrl }
      });

      if (j.articles?.length > 0) {
        j.articles.forEach(article => {
          const section = article.section || 'general';
          const tId = `topic_${section}`;

          if (!topicMap.has(tId)) {
            nodes.push({ id: tId, label: section, type: 'topic', size: 0 });
            topicMap.set(tId, { count: 0, journalists: new Set() });
          }

          const td = topicMap.get(tId);
          td.count++;
          td.journalists.add(jId);

          const eId = `${jId}_${tId}`;
          const existing = edges.find(e => e.id === eId);
          if (existing) existing.weight++;
          else edges.push({ id: eId, source: jId, target: tId, weight: 1, type: 'covers' });
        });
      }
    });

    nodes.filter(n => n.type === 'topic').forEach(n => {
      const td = topicMap.get(n.id);
      if (td) {
        n.size = td.count;
        n.metadata = { articleCount: td.count, journalistCount: td.journalists.size };
      }
    });

    return { nodes, edges };
  }

  calculateMetrics(graph) {
    const connCounts = new Map();
    graph.edges.forEach(e => {
      connCounts.set(e.source, (connCounts.get(e.source) || 0) + 1);
    });

    const avgConn = connCounts.size > 0
      ? [...connCounts.values()].reduce((a, b) => a + b, 0) / connCounts.size : 0;

    const topJournalists = [...connCounts.entries()]
      .map(([id, count]) => ({ id, label: graph.nodes.find(n => n.id === id)?.label, connections: count }))
      .sort((a, b) => b.connections - a.connections).slice(0, 10);

    const topicWeights = new Map();
    graph.edges.filter(e => e.target.startsWith('topic_')).forEach(e => {
      topicWeights.set(e.target, (topicWeights.get(e.target) || 0) + e.weight);
    });

    const topTopics = [...topicWeights.entries()]
      .map(([id, w]) => ({ id, label: graph.nodes.find(n => n.id === id)?.label, coverage: w }))
      .sort((a, b) => b.coverage - a.coverage).slice(0, 10);

    return {
      totalNodes: graph.nodes.length, totalEdges: graph.edges.length,
      journalistCount: graph.nodes.filter(n => n.type === 'journalist').length,
      topicCount: graph.nodes.filter(n => n.type === 'topic').length,
      averageConnections: avgConn, topJournalists, topTopics
    };
  }

  exportForVisualization(graph) {
    return {
      nodes: graph.nodes.map(n => ({
        id: n.id, label: n.label, type: n.type,
        size: Math.max(n.size, 10),
        color: n.type === 'journalist' ? '#3b5bdb' : '#e8590c',
        ...n.metadata
      })),
      edges: graph.edges.map(e => ({
        id: e.id, source: e.source, target: e.target, weight: e.weight, color: '#adb5bd'
      }))
    };
  }
}

const analyzer = new GraphAnalyzer();
export default analyzer;
export const { buildJournalistTopicGraph, calculateMetrics, exportForVisualization } = analyzer;