import { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import 'vis-network/styles/vis-network.min.css';

interface OutrankingGraphProps {
  outrankingMatrix: boolean[][];
}

export default function OutrankingGraph({ outrankingMatrix }: OutrankingGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const n = outrankingMatrix.length;

    const nodes = Array.from({ length: n }, (_, i) => ({
      id: i,
      label: `A${i + 1}`,
      title: `Alternative ${i + 1}`,
      shape: 'box',
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      widthConstraint: { minimum: 50 },
      color: {
        background: '#3b82f6',
        border: '#1e40af',
        highlight: {
          background: '#60a5fa',
          border: '#1e40af',
        },
      },
      font: {
        color: '#ffffff',
        size: 16,
        face: 'Tahoma',
        bold: {
          color: '#ffffff',
          size: 18,
        },
      },
    } as any));

    const edges: any[] = [];
    for (let a = 0; a < n; a++) {
      for (let b = 0; b < n; b++) {
        if (a !== b && outrankingMatrix[a][b]) {
          edges.push({
            from: a,
            to: b,
            arrows: 'to',
            color: {
              color: '#10b981',
              highlight: '#059669',
            },
            width: 2,
            smooth: {
              type: 'continuous',
              roundness: 0.5,
            },
            title: `L'alternative A${a + 1} surclasse A${b + 1}`,
          });
        }
      }
    }

    const data = { nodes, edges } as any;

    const options = {
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -15000,
          centralGravity: 0.3,
          springLength: 200,
          springConstant: 0.04,
        },
        forceAtlas2Based: {
          gravitationalConstant: -26,
          centralGravity: 0.005,
          springLength: 200,
          springConstant: 0.08,
        },
        maxVelocity: 50,
        stabilization: {
          iterations: 200,
        },
      },
      interaction: {
        navigationButtons: true,
        keyboard: true,
        zoomView: true,
        dragView: true,
      },
      layout: {
        randomSeed: 42,
      },
    };

    const network = new Network(containerRef.current, data, options);

    // Fit the graph to the container on load
    setTimeout(() => network.fit(), 100);

    return () => {
      network.destroy();
    };
  }, [outrankingMatrix]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-semibold mb-3 text-gray-700 flex items-center">
        <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">
          G
        </span>
        Graphique de surclassement
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Visualisation des relations de surclassement. Les flèches indiquent quelle alternative surclasse
        l'autre. Une alternative sans flèche entrante n'est pas surclassée par d'autres.
      </p>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '400px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
        }}
      />
    </div>
  );
}
