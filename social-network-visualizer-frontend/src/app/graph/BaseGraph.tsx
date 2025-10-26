import {
  forwardRef,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
// @ts-ignore
import ForceGraph, { ForceGraphInstance } from "force-graph";
import {
  forceManyBody,
  forceCollide,
  forceX,
  forceY,
  forceLink,
} from "d3-force";
import {
  GraphLink,
  GraphNode,
  GraphProps,
  NodeType,
  SelectionBox,
} from "@/types/GraphTypes";
import { useProject } from "@/app/context/ProjectContext";
import nodeStrategy from "@/app/model/strategies/NodeStrategy";
import NodeColors from "@/app/model/NodeColors";
import { useWorkspace } from "@/app/context/WorkspaceContext";
import { useGraph } from "@/app/context/GraphContext";
import MenuComponent from "@/app/components/graphMenu/MenuComponent";
import { MenuItem, MenuState } from "../interface/Menu";
import { useContextMenuItems } from "@/app/components/graphMenu/ContextMenuItemsProvider";

const BaseGraph = forwardRef((props: GraphProps, ref) => {
  const {
    graphData,
    nodeVal,
    nodeLabel,
    nodeColor,
    linkColor,
    linkWidth,
    linkLabel,
    linkDirectionalArrowLength,
    linkDirectionalArrowRelPos,
    nodeFound,
  } = props;

  const NODE_DISPLAY_LIMIT: number = 1000;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fgInstance = useRef<ForceGraphInstance<GraphNode, GraphLink> | null>(
    null,
  );

  const prevNodeCount = useRef(0);
  const prevLinkCount = useRef(0);

  const unfreezeTimer = useRef<NodeJS.Timeout>(null);
  const forceRampInterval = useRef<NodeJS.Timer | null>(null);

  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<GraphNode[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  const [menu, setMenu] = useState<MenuState>({
    items: [],
    position: { x: 0, y: 0 },
  });

  const {
    setIsSidebarOpen,
    setSelectedUserData,
    setFocusedCommunityId,
    showLabels,
  } = useProject();
  const menuItemsGetters = useContextMenuItems();
  const {
    isInWorkspaceMode,
    saveWorkspaceData,
    hasUnsavedChanges,
    setHasUnsavedChanges,
  } = useWorkspace();
  const { setGraphData, resetGraphData } = useGraph();

  useEffect(() => {
    if (!containerRef.current) return;

    fgInstance.current = new ForceGraph<GraphNode, GraphLink>(
      containerRef.current,
    );
    fgInstance.current.d3Force(
      "charge",
      forceManyBody().distanceMin(10).strength(-200),
    );
    fgInstance.current.d3Force(
      "collide",
      forceCollide()
        .radius((d: any) => nodeStrategy.getRadius(d) + 10)
        .strength(0.3),
    );
    fgInstance.current.d3Force("container_x", forceX(0).strength(0.005));
    fgInstance.current.d3Force("container_y", forceY(0).strength(0.005));
    fgInstance.current.d3Force(
      "link",
      forceLink<GraphNode, GraphLink>()
        .id((d: GraphNode) => d.id)
        .strength(0.7),
    );
    const handleResize = () => {
      if (fgInstance.current && containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        fgInstance.current
          .width(offsetWidth)
          .height(offsetHeight)
          .d3Force("container_x", forceX(offsetWidth / 2).strength(0.01))
          .d3Force("container_y", forceY(offsetHeight / 2).strength(0.01));
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      if (fgInstance.current) {
        fgInstance.current._destructor();
      }
      fgInstance.current = null;
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    displayGraphData();
  }, [graphData, fgInstance]);

  useEffect(() => {
    if (!fgInstance.current || !nodeFound) return;
    const graphCurrentData = fgInstance.current.graphData();
    const node = graphCurrentData.nodes.find(
      (n: GraphNode) =>
        n.id === nodeFound?.id && n.nodeType === nodeFound?.nodeType,
    );

    if (node && "x" in node && "y" in node) {
      fgInstance.current.centerAt(node.x, node.y, 1000);
      fgInstance.current.zoom(6, 1000);
    }
  }, [nodeFound]);

  useEffect(() => {
    if (!fgInstance.current) return;

    fgInstance.current
      .nodeVal(nodeVal)
      .nodeLabel(nodeLabel)
      .nodeColor(nodeColor)
      .linkColor(linkColor)
      .linkWidth(linkWidth)
      .linkLabel(linkLabel)
      .linkDirectionalArrowLength(linkDirectionalArrowLength)
      .linkDirectionalArrowRelPos(linkDirectionalArrowRelPos)
      .onNodeClick(handleNodeLeftClick)
      .onNodeRightClick(handleNodeRightClick)
      .nodeCanvasObject(
        (
          node: GraphNode & { x: number; y: number },
          ctx: CanvasRenderingContext2D,
          globalScale: any,
        ) => {
          if (!isFinite(node.x) || !isFinite(node.y)) {
            return;
          }

          const radius = nodeStrategy.getRadius(node);
          const baseColor = nodeColor
            ? nodeColor(node)
            : NodeColors.getDefaultAuthorColor();

          if (!isFinite(radius) || radius <= 0) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 0.5 / globalScale, 0, 2 * Math.PI, false);
            ctx.fillStyle = baseColor;
            ctx.fill();
            return;
          }

          ctx.save();
          ctx.shadowColor = baseColor;
          ctx.shadowBlur = 10;

          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = baseColor;
          ctx.fill();

          ctx.restore();

          if (selectedNodeIds.includes(node.id)) {
            ctx.save();
            ctx.shadowColor = "white";
            ctx.shadowBlur = 10;

            ctx.lineWidth = 2 / globalScale;
            ctx.strokeStyle = "white";

            ctx.beginPath();
            ctx.arc(
              node.x,
              node.y,
              radius + 1 / globalScale,
              0,
              2 * Math.PI,
              false,
            );
            ctx.stroke();

            ctx.restore();
          }

          const fontSize = 12 / globalScale;
          if (showLabels) {
            const nLabel = nodeLabel(node);
            const textYPosition = node.y + radius + 4;
            ctx.font = `bold ${fontSize}px Inter, sans-serif`;
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(nLabel, node.x, textYPosition);
          }
        },
      );
  }, [
    nodeVal,
    nodeLabel,
    nodeColor,
    linkColor,
    linkWidth,
    linkLabel,
    linkDirectionalArrowLength,
    linkDirectionalArrowRelPos,
    selectedNodeIds,
  ]);

  const handleNodeLeftClick = useCallback((node: GraphNode) => {
    nodeStrategy.handleNodeLeftClick(
      node,
      setSelectedUserData,
      setIsSidebarOpen,
    );
  }, []);

  const handleNodeRightClick = useCallback(
    (node: GraphNode, event: MouseEvent) => {
      if (isInWorkspaceMode) {
        const menuItems: MenuItem[] = nodeStrategy.getContextMenuItems(
          node,
          menuItemsGetters,
        );
        setMenu({
          items: menuItems,
          position: { x: event.clientX, y: event.clientY },
        });
      }
    },
    [isInWorkspaceMode],
  );

  const handleCloseMenu = useCallback(() => {
    setMenu((prev: MenuState) => ({ ...prev, items: [] }));
  }, []);

  const analyzeSelectedNodes = () => {
    setIsSidebarOpen(false);

    if (selectedNodeIds.length !== 0) {
      const nodes = selectedNodes;
      const links = graphData.links.filter(
        (l) =>
          selectedNodes.find((n) => n.id === l.source) &&
          selectedNodes.find((n) => n.id === l.target),
      );

      setGraphData({ nodes: nodes, links: links });
      setSelectedNodeIds([]);
      setHasUnsavedChanges(true);
    }
  };

  const resetGraph = () => {
    setIsSidebarOpen(false);
    setSelectedNodes([]);
    setSelectedNodeIds([]);
    resetGraphData();
    setFocusedCommunityId(undefined);
  };

  const displayGraphData = () => {
    if (!fgInstance.current) return;

    if (
        graphData.nodes.length === prevNodeCount.current &&
        graphData.links.length === prevLinkCount.current
    ) {
      console.log("Optymalizacja: Liczba węzłów i linków bez zmian. Pomijam.");
      return; // Zatrzymaj funkcję tutaj
    }

    // KROK 4 (Odmrażanie): Wyczyść poprzedni timer, jeśli istnieje
    if (unfreezeTimer.current) {
      clearTimeout(unfreezeTimer.current);
    }

    // --- LOGIKA WYKRYWANIA I MROŻENIA ---

    // 1. Pobierz aktualne węzły *z symulacji* (mają pozycje x, y)
    const currentNodesInGraph: (GraphNode & { x?: number, y?: number, fx?: number, fy?: number })[] = fgInstance.current.graphData().nodes;
    const currentNodesMap = new Map(currentNodesInGraph.map(node => [node.id, node]));

    // 2. KROK 1 (Wykrywanie): Sprawdź, czy dodajemy węzły
    const isAddingNodes = graphData.nodes.length > prevNodeCount.current && prevNodeCount.current > 0;

    // 3. KROK 3 (Pozycja startowa): Znajdź pozycję "rodzica"
    let sourceNodePosition = { x: 0, y: 0 };
    if (isAddingNodes) {
      const firstNewNode = graphData.nodes.find(n => !currentNodesMap.has(n.id));
      if (firstNewNode) {
        const link = graphData.links.find(l => l.source === firstNewNode.id || l.target === firstNewNode.id);
        if (link) {
          const parentId = link.source === firstNewNode.id ? link.target : link.source;
          const parentNode = currentNodesMap.get(parentId);
          // Sprawdzamy, czy rodzic ma poprawną pozycję
          if (parentNode && typeof parentNode.x === 'number' && typeof parentNode.y === 'number' && isFinite(parentNode.x) && isFinite(parentNode.y)) {
            sourceNodePosition = { x: parentNode.x, y: parentNode.y };
          }
        }
      }
    }

    // --- TWOJA OBECNA LOGIKA FILTROWANIA (bez zmian) ---

    const nodesByType = new Map<NodeType, GraphNode[]>();
    graphData.nodes.forEach((node) => {
      if (!nodesByType.has(node.nodeType)) {
        nodesByType.set(node.nodeType, []);
      }
      nodesByType.get(node.nodeType)!.push(node);
    });

    const nodeTypes = Array.from(nodesByType.keys());
    const nodesPerType = Math.floor(NODE_DISPLAY_LIMIT / nodeTypes.length);

    const topNodes: GraphNode[] = [];
    nodesByType.forEach((nodes) => {
      topNodes.push(...nodes.slice(0, nodesPerType).map((n) => ({ ...n })));
    });

    // --- NOWA LOGIKA TWORZENIA FINALNEJ LISTY WĘZŁÓW ---

    const finalNodes = topNodes.map(node => {
      const existingNode = currentNodesMap.get(node.id);

      if (isAddingNodes) {
        // POPRAWKA 2: Bardziej rygorystyczne mrożenie
        // Mrozimy (fx, fy) TYLKO WTEDY, gdy stary węzeł ma już poprawną pozycję.
        if (existingNode &&
            typeof existingNode.x === 'number' && isFinite(existingNode.x) &&
            typeof existingNode.y === 'number' && isFinite(existingNode.y)
        ) {
          // KROK 2 (Mrożenie): To STARY węzeł z poprawną pozycją. Zamroź go.
          return { ...node, fx: existingNode.x, fy: existingNode.y };
        } else if (!existingNode) {
          // KROK 3 (Pozycja startowa): To NOWY węzeł. Ustaw go blisko rodzica.
          return {
            ...node,
            x: sourceNodePosition.x + (Math.random() - 0.5) * 5, // Mały losowy rozrzut
            y: sourceNodePosition.y + (Math.random() - 0.5) * 5
          };
        }
        // Jeśli to stary węzeł, ale bez poprawnej pozycji (np. jeszcze się ładuje),
        // to po prostu zwróć `node` i pozwól symulacji go ułożyć.
      }

      // Domyślne zachowanie (np. pierwsze ładowanie lub stary węzeł bez pozycji)
      return node;
    });

    // --- KONIEC TWOJEJ OBECNEJ LOGIKI ---

    const topNodesIds = new Set(finalNodes.map((n) => n.id));
    const relevantLinks = graphData.links
        .filter(
            (link: GraphLink) =>
                topNodesIds.has(link.source) && topNodesIds.has(link.target),
        )
        .map((link: GraphLink) => ({ ...link }));

    // Zaktualizuj licznik węzłów na potrzeby następnego renderowania
    prevNodeCount.current = finalNodes.length;
    prevLinkCount.current = relevantLinks.length;

    // Przekaż finalne dane do grafu
    fgInstance.current.graphData({ nodes: finalNodes, links: relevantLinks });

    // KROK 4: PŁYNNE ODMRAŻANIE (WERSJA OSTATECZNA)
    if (isAddingNodes) {
      // @ts-ignore
      unfreezeTimer.current = setTimeout(() => {
        if (!fgInstance.current) return;

        // 1. Odmrożenie WSZYSTKICH węzłów
        fgInstance.current.graphData().nodes.forEach((node: GraphNode & { fx?: number, fy?: number }) => {
          node.fx = undefined;
          node.fy = undefined;
        });

        // 2. Rozpocznij PŁYNNĄ RAMPĘ WSZYSTKICH SIŁ

        // --- Definicje sił ---
        const startCharge = 0;         // Zaczynamy od braku odpychania
        const endCharge = -200;        // Docelowa siła

        const startLink = 0.01;        // Prawie zerowe przyciąganie linków
        const endLink = 0.7;           // Docelowa siła

        const startCollide = 0.01;     // Prawie zerowa kolizja
        const endCollide = 0.3;        // Docelowa siła

        const duration = 1500;     // Czas animacji (1.5 sekundy)
        const steps = 30;          // Liczba kroków (płynność)
        const stepDuration = duration / steps;
        let currentStep = 0;

        // --- Funkcja "easing" (dla naturalnego ruchu) ---
        // To jest "ease-in-out": wolno rusza, przyspiesza w środku, wolno zwalnia
        const easeInOutQuad = (t: number) => {
          return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        };

        // --- "Obudź" symulację z minimalnymi siłami ---
        // Ważne: musimy re-definiować całą siłę, łącznie z jej parametrami (.id, .radius)
        fgInstance.current.d3Force(
            "charge",
            forceManyBody().distanceMin(10).strength(startCharge)
        );
        fgInstance.current.d3Force(
            "link",
            forceLink<GraphNode, GraphLink>()
                .id((d: GraphNode) => d.id)
                .strength(startLink)
        );
        fgInstance.current.d3Force(
            "collide",
            forceCollide()
                .radius((d: any) => nodeStrategy.getRadius(d) + 10)
                .strength(startCollide)
        );

        // --- Rozpocznij interwał, który będzie zwiększał siłę ---
        // @ts-ignore
        forceRampInterval.current = setInterval(() => {
          if (!fgInstance.current) {
            // @ts-ignore
            if (forceRampInterval.current) clearInterval(forceRampInterval.current);
            return;
          }

          currentStep++;
          const t = currentStep / steps; // Progres liniowy (0.0 do 1.0)
          const easedT = easeInOutQuad(t); // Progres z "easingiem"

          // Oblicz nowe siły na podstawie "easingu"
          const newCharge = startCharge + (endCharge - startCharge) * easedT;
          const newLink = startLink + (endLink - startLink) * easedT;
          const newCollide = startCollide + (endCollide - startCollide) * easedT;

          // Zastosuj WSZYSTKIE trzy siły
          fgInstance.current.d3Force(
              "charge",
              forceManyBody().distanceMin(10).strength(newCharge)
          );
          fgInstance.current.d3Force(
              "link",
              forceLink<GraphNode, GraphLink>()
                  .id((d: GraphNode) => d.id)
                  .strength(newLink)
          );
          fgInstance.current.d3Force(
              "collide",
              forceCollide()
                  .radius((d: any) => nodeStrategy.getRadius(d) + 10)
                  .strength(newCollide)
          );

          // Zakończ interwał po osiągnięciu celu
          if (currentStep >= steps) {
            // @ts-ignore
            if (forceRampInterval.current) clearInterval(forceRampInterval.current);
            // Na wszelki wypadek ustaw finalne siły
            fgInstance.current.d3Force(
                "charge",
                forceManyBody().distanceMin(10).strength(endCharge)
            );
            fgInstance.current.d3Force(
                "link",
                forceLink<GraphNode, GraphLink>()
                    .id((d: GraphNode) => d.id)
                    .strength(endLink)
            );
            fgInstance.current.d3Force(
                "collide",
                forceCollide()
                    .radius((d: any) => nodeStrategy.getRadius(d) + 10)
                    .strength(endCollide)
            );
          }
        }, stepDuration) as unknown as NodeJS.Timeout;

      }, 3000); // Odmroź po 3 sekundach
    }
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsSidebarOpen(false);
    e.preventDefault();
    e.stopPropagation();
    setIsSelecting(true);
    setSelectionBox({
      startX: e.clientX,
      startY: e.clientY,
      endX: e.clientX,
      endY: e.clientY,
    });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSelecting) {
      setSelectionBox((prev) =>
        prev ? { ...prev, endX: e.clientX, endY: e.clientY } : null,
      );
    }
  };

  const handleMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSelecting && selectionBox) {
      setIsSelecting(false);
      checkNodesInBox(selectionBox);
      setSelectionBox(null);
    }
  };

  const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const checkNodesInBox = (box: SelectionBox) => {
    if (!fgInstance.current || !fgInstance.current.screen2GraphCoords) return;

    const startCoords = fgInstance.current.screen2GraphCoords(
      box.startX,
      box.startY,
    );
    const endCoords = fgInstance.current.screen2GraphCoords(box.endX, box.endY);

    const nodes: GraphNode[] = fgInstance.current.graphData().nodes;
    const selectedNodes = nodes.filter((node: GraphNode) => {
      if (typeof node.x !== "number" || typeof node.y !== "number")
        return false;
      return (
        node.x >= Math.min(startCoords.x, endCoords.x) &&
        node.x <= Math.max(startCoords.x, endCoords.x) &&
        node.y >= Math.min(startCoords.y, endCoords.y) &&
        node.y <= Math.max(startCoords.y, endCoords.y)
      );
    });

    setSelectedNodeIds(selectedNodes.map((n) => n.id));
    setSelectedNodes(selectedNodes);
  };

  return (
    <div className="w-full h-full relative">
      <div
        ref={containerRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
      />

      <MenuComponent
        items={menu.items}
        position={menu.position}
        onClose={handleCloseMenu}
      />
      {selectionBox && (
        <div
          className="absolute border-2 border-dashed border-[#783CDC] bg-[#783CDC33] pointer-events-none z-10"
          style={{
            left: `${Math.min(selectionBox.startX, selectionBox.endX)}px`,
            top: `${Math.min(selectionBox.startY, selectionBox.endY)}px`,
            width: `${Math.abs(selectionBox.endX - selectionBox.startX)}px`,
            height: `${Math.abs(selectionBox.endY - selectionBox.startY)}px`,
          }}
        />
      )}

      <div className="absolute bottom-2 right-2 flex flex-col gap-2 p-2 z-30 w-[180px]">
        {selectedNodeIds.length > 0 && (
          <button
            onClick={() => analyzeSelectedNodes()}
            className="px-3 py-2 bg-[#384EB3] text-white border-none rounded-md cursor-pointer"
          >
            Analyze
          </button>
        )}
        {isInWorkspaceMode && hasUnsavedChanges && (
          <button
            onClick={() => saveWorkspaceData(graphData)}
            className="px-3 py-2 bg-[green] text-white border-none rounded-md cursor-pointer"
          >
            Save workspace
          </button>
        )}
        <button
          onClick={() => resetGraph()}
          className="px-3 py-2 bg-[#8B0000] text-white border-none rounded-md cursor-pointer"
        >
          Reset graph
        </button>
      </div>
    </div>
  );
});

export default BaseGraph;
