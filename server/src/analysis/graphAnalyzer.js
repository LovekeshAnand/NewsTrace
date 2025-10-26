class GraphAnalyzer {
  constructor() {
    this.graph = {
      nodes: [],
      edges: []
    };
  }

  buildJournalistTopicGraph(journalists) {
    const nodes = [];
    const edges = [];
    const nodeMap = new Map();

    // Add journalist nodes
    journalists.forEach(journalist => {
      const nodeId = `journalist_${journalist.id || journalist.name}`;
      nodes.push({
        id: nodeId,
        label: journalist.name,
        type: 'journalist',
        size: journalist.articleCount || 0,
        metadata: {
          articleCount: journalist.articleCount,
          email: journalist.email,
          profileUrl: journalist.profileUrl
        }
      });
      nodeMap.set(nodeId, journalist);
    });

    // Track topics and create topic nodes
    const topicMap = new Map();

    journalists.forEach(journalist => {
      const journalistId = `journalist_${journalist.id || journalist.name}`;
      
      if (journalist.articles && journalist.articles.length > 0) {
        journalist.articles.forEach(article => {
          const section = article.section || 'general';
          const topicId = `topic_${section}`;

          // Add topic node if not exists
          if (!topicMap.has(topicId)) {
            nodes.push({
              id: topicId,
              label: section,
              type: 'topic',
              size: 0
            });
            topicMap.set(topicId, { count: 0, journalists: new Set() });
          }

          // Update topic stats
          const topicData = topicMap.get(topicId);
          topicData.count++;
          topicData.journalists.add(journalistId);

          // Add edge
          const edgeId = `${journalistId}_${topicId}`;
          const existingEdge = edges.find(e => e.id === edgeId);
          
          if (existingEdge) {
            existingEdge.weight++;
          } else {
            edges.push({
              id: edgeId,
              source: journalistId,
              target: topicId,
              weight: 1,
              type: 'covers'
            });
          }
        });
      }
    });

    // Update topic node sizes
    nodes.forEach(node => {
      if (node.type === 'topic') {
        const topicData = topicMap.get(node.id);
        if (topicData) {
          node.size = topicData.count;
          node.metadata = {
            articleCount: topicData.count,
            journalistCount: topicData.journalists.size
          };
        }
      }
    });

    return { nodes, edges };
  }

  detectCommunities(graph) {
    const communities = [];
    const visited = new Set();

    graph.nodes.forEach(node => {
      if (!visited.has(node.id) && node.type === 'journalist') {
        const community = this.expandCommunity(node, graph, visited);
        if (community.length > 1) {
          communities.push(community);
        }
      }
    });

    return communities;
  }

  expandCommunity(startNode, graph, visited) {
    const community = [startNode];
    visited.add(startNode.id);
    
    const nodeTopics = this.getNodeTopics(startNode.id, graph.edges);
    
    graph.nodes.forEach(node => {
      if (!visited.has(node.id) && node.type === 'journalist' && node.id !== startNode.id) {
        const otherTopics = this.getNodeTopics(node.id, graph.edges);
        const overlap = this.calculateOverlap(nodeTopics, otherTopics);
        
        if (overlap > 0.3) {
          community.push(node);
          visited.add(node.id);
        }
      }
    });

    return community;
  }

  getNodeTopics(nodeId, edges) {
    return edges
      .filter(e => e.source === nodeId)
      .map(e => e.target);
  }

  calculateOverlap(topics1, topics2) {
    const set1 = new Set(topics1);
    const set2 = new Set(topics2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  calculateMetrics(graph) {
    const metrics = {
      totalNodes: graph.nodes.length,
      totalEdges: graph.edges.length,
      journalistCount: graph.nodes.filter(n => n.type === 'journalist').length,
      topicCount: graph.nodes.filter(n => n.type === 'topic').length,
      averageConnections: 0,
      topJournalists: [],
      topTopics: [],
      densityClusters: []
    };

    // Calculate average connections
    const connectionCounts = new Map();
    graph.edges.forEach(edge => {
      connectionCounts.set(edge.source, (connectionCounts.get(edge.source) || 0) + 1);
    });

    if (connectionCounts.size > 0) {
      const sum = Array.from(connectionCounts.values()).reduce((a, b) => a + b, 0);
      metrics.averageConnections = sum / connectionCounts.size;
    }

    // Top journalists by connections
    metrics.topJournalists = Array.from(connectionCounts.entries())
      .map(([nodeId, count]) => {
        const node = graph.nodes.find(n => n.id === nodeId);
        return { id: nodeId, label: node?.label, connections: count };
      })
      .sort((a, b) => b.connections - a.connections)
      .slice(0, 10);

    // Top topics by coverage
    const topicConnections = new Map();
    graph.edges.forEach(edge => {
      if (edge.target.startsWith('topic_')) {
        topicConnections.set(edge.target, (topicConnections.get(edge.target) || 0) + edge.weight);
      }
    });

    metrics.topTopics = Array.from(topicConnections.entries())
      .map(([nodeId, weight]) => {
        const node = graph.nodes.find(n => n.id === nodeId);
        return { id: nodeId, label: node?.label, coverage: weight };
      })
      .sort((a, b) => b.coverage - a.coverage)
      .slice(0, 10);

    // Detect communities
    const communities = this.detectCommunities(graph);
    metrics.densityClusters = communities.map((community, index) => ({
      id: `cluster_${index}`,
      size: community.length,
      journalists: community.map(n => n.label),
      topics: this.getClusterTopics(community, graph.edges)
    }));

    return metrics;
  }

  getClusterTopics(community, edges) {
    const topicCounts = new Map();
    
    community.forEach(node => {
      const topics = this.getNodeTopics(node.id, edges);
      topics.forEach(topic => {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      });
    });

    return Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic.replace('topic_', ''));
  }

  exportForVisualization(graph) {
    return {
      nodes: graph.nodes.map(node => ({
        id: node.id,
        label: node.label,
        type: node.type,
        size: Math.max(node.size, 10),
        color: node.type === 'journalist' ? '#3b82f6' : '#ef4444',
        ...node.metadata
      })),
      edges: graph.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        weight: edge.weight,
        color: '#94a3b8'
      }))
    };
  }
}

export default new GraphAnalyzer();


export const {
  buildJournalistTopicGraph,
  calculateMetrics,
  exportForVisualization
} = new GraphAnalyzer();