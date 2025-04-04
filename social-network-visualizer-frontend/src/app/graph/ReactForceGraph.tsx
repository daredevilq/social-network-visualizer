"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";

const ForceGraph2D = dynamic(() => import('react-force-graph').then(mod => mod.ForceGraph2D), {
    ssr: false,
});

const generateGraphData = (numNodes: number, numLinks: number) => {
    const nodes = Array.from({ length: numNodes }, (_, i) => ({
        id: `User${i + 1}`,
        name: `User ${i + 1}`,
        val: Math.floor(Math.random() * 10) + 1,
    }));

    const links = Array.from({ length: numLinks }, () => ({
        source: `User${Math.floor(Math.random() * numNodes) + 1}`,
        target: `User${Math.floor(Math.random() * numNodes) + 1}`,
    }));

    return { nodes, links };
};

export default function ReactForceGraph() {
    const fgRef = useRef(null);
    const [numNodes, setNumNodes] = useState(10); // Domyślna liczba wierzchołków
    const [numLinks, setNumLinks] = useState(15); // Domyślna liczba krawędzi
    const [graphData, setGraphData] = useState(generateGraphData(numNodes, numLinks));
    const [searchQuery, setSearchQuery] = useState(""); // Stan dla zapytania wyszukiwania
    const [highlightedNode, setHighlightedNode] = useState(null); // Stan dla wyróżnionego węzła

    const handleNumNodesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setNumNodes(value);
        setGraphData(generateGraphData(value, numLinks));
    };

    const handleNumLinksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setNumLinks(value);
        setGraphData(generateGraphData(numNodes, value));
    };

    const handleSearch = () => {
        // Znajdź węzeł na podstawie zapytania
        const node = graphData.nodes.find((n) => n.name.toLowerCase() === searchQuery.toLowerCase());

        if (node) {
            setHighlightedNode(node.id); // Wyróżnij węzeł

            // Przyciągnij kamerę do węzła i wycentruj
            fgRef.current?.centerAt(node.x, node.y, 1000); // Wycentruj kamerę na węźle (1000 ms animacji)
            fgRef.current?.zoom(8, 1000); // Przybliż kamerę (8x zoom w ciągu 1000 ms)
        } else {
            setHighlightedNode(null); // Zresetuj wyróżnienie, jeśli węzeł nie został znaleziony
            alert("User not found!"); // Powiadomienie, że użytkownik nie został znaleziony
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {/* Kontrolki do wyboru liczby wierzchołków i krawędzi */}
            <div style={{ marginBottom: '20px' }}>
                <label>
                    Liczba wierzchołków:
                    <input
                        type="number"
                        value={numNodes}
                        onChange={handleNumNodesChange}
                        min={1}
                        max={100}
                        style={{ marginLeft: '10px', borderRadius: '5px', border: '5px solid #ccc' }}
                    />
                </label>
                <label style={{ marginLeft: '20px' }}>
                    Liczba krawędzi:
                    <input
                        type="number"
                        value={numLinks}
                        onChange={handleNumLinksChange}
                        min={1}
                        max={500}
                        style={{ marginLeft: '10px', borderRadius: '5px', border: '5px solid #ccc' }}
                    />
                </label>
            </div>

            {/* Pole wyszukiwania i przycisk */}
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Search user (e.g., User 1)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ marginRight: '10px', borderRadius: '5px', border: '5px solid #ccc', padding: '5px' }}
                />
                <button
                    onClick={handleSearch}
                    style={{ borderRadius: '5px', border: '5px solid #ccc', padding: '5px 10px', cursor: 'pointer' }}
                >
                    Search
                </button>
            </div>

            {/* Kontener dla grafu z rozmytymi krawędziami */}
            <div
                style={{
                    width: '90%',
                    height: '95%',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '30px',
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                    maskImage: 'radial-gradient(circle, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 70%), linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 30%, rgba(0, 0, 0, 0) 0%)'
                }}
            >
                <ForceGraph2D
                    ref={fgRef}
                    graphData={graphData}
                    linkColor={() => '#6E5F85'} // Jaśniejsze krawędzie
                    linkWidth={1} // Grubsze krawędzie
                    linkOpacity={50} // Większa przezroczystość krawędzi
                    nodeLabel="name"
                    nodeAutoColorBy="id"
                    nodeColor={(node) => highlightedNode === node.id ? '#FF0000' : '#7140F4'} // Kolor węzła (czerwony dla wyróżnionego)
                    nodeVal={(node) => node.val} // Rozmiar węzła zależny od wartości
                    nodeRelSize={10} // Większe węzły
                    linkDirectionalArrowLength={10}
                    linkDirectionalArrowRelPos={10}
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const label = node.name;
                        const size = 14; // Większy rozmiar węzła
                        const fontSize = 0 / globalScale; // Większa czcionka
                        const pulseSize = size * (1 + 0.1 * Math.sin(Date.now() * 0.001)); // Animacja pulsowania
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, pulseSize,  0, 2 * Math.PI, false);

// Kolor węzła z przezroczystością
                        ctx.fillStyle = highlightedNode === node.id ? 'rgba(255, 0, 0, 0.8)' : 'rgba(113, 64, 244, 0.8)';

// Cień węzła
                        ctx.shadowBlur = 15;
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;

                        ctx.fill();
                        ctx.strokeStyle = '#7140F4'; // Biała obwódka
                        ctx.lineWidth = 2;
                        ctx.stroke();

// Reset cienia
                        // Etykieta węzła
                        ctx.font = `${fontSize}px Sans-Serif`;
                        ctx.fillStyle = '#FAFAFA'; // Czarny tekst
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(label, node.x, node.y);
                    }}
                    onBackgroundClick={() => {
                        // Resetuj pozycje węzłów po kliknięciu w tło
                        graphData.nodes.forEach((node) => {
                            node.fx = null;
                            node.fy = null;
                        });
                        fgRef.current?.zoomToFit(400);
                    }}
                    onEngineStop={() => {
                        // Zablokuj pozycje węzłów po zatrzymaniu symulacji
                        graphData.nodes.forEach((node) => {
                            node.fx = node.x; // Zablokuj pozycję X
                            node.fy = node.y; // Zablokuj pozycję Y
                        });
                    }}
                />
            </div>
        </div>
    );
}