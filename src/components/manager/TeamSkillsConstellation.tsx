import React, { useRef, useEffect, useState, useMemo } from "react";
import * as d3 from "d3";
import { teamGraduates, statusColors } from "@/data/teamData";
import { getSnapshot, type SkillNode } from "@/data/skillsData";
import { ArrowLeft, Users, AlertTriangle } from "lucide-react";
import SkillsGraph from "@/components/skills/SkillsGraph";

const gradSkillMonths: Record<string, number> = {
  g1: 3, g2: 3, g3: 2, g4: 3, g5: 2, g6: 3,
};

const profJitter: Record<string, number> = {
  g1: 0, g2: 0.8, g3: -0.5, g4: 0.3, g5: -0.3, g6: 0.5,
};

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: "employee" | "skill";
  radius: number;
  initials?: string;
  status?: string;
  role?: string;
  week?: number;
  gradId?: string;
  proficiency?: number;
  cluster?: string;
  sharedBy?: string[];
  skillStatus?: "developed" | "developing" | "seed";
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: GraphNode | string;
  target: GraphNode | string;
}

const clusterColors: Record<string, string> = {
  core: "#6366F1",
  audit: "#3B82F6",
  client: "#EC4899",
  tax: "#F59E0B",
  compliance: "#8B5CF6",
};

/* ── Skill Gap Analysis ── */
interface SkillGap {
  id: string;
  label: string;
  cluster: string;
  missingCount: number; // grads who don't have it or are underdeveloped
  totalGrads: number;
  gradsMissing: string[]; // names
}

function computeSkillGaps(): SkillGap[] {
  // Get all possible skills from month 3 (full set)
  const fullSnap = getSnapshot(3);
  const allSkillIds = fullSnap.nodes.map((n) => ({ id: n.id, label: n.label, cluster: n.cluster }));

  const gaps: SkillGap[] = allSkillIds.map((sk) => {
    const gradsMissing: string[] = [];
    teamGraduates.forEach((g) => {
      const month = gradSkillMonths[g.id] || 3;
      const snap = getSnapshot(month);
      const node = snap.nodes.find((n) => n.id === sk.id);
      const prof = node ? Math.max(0, node.proficiency + (profJitter[g.id] || 0)) : 0;
      if (prof < 3) {
        gradsMissing.push(g.name.split(" ")[0]);
      }
    });
    return {
      id: sk.id,
      label: sk.label,
      cluster: sk.cluster,
      missingCount: gradsMissing.length,
      totalGrads: teamGraduates.length,
      gradsMissing,
    };
  });

  return gaps
    .filter((g) => g.missingCount > 0)
    .sort((a, b) => b.missingCount - a.missingCount)
    .slice(0, 5);
}

const TeamSkillsConstellation: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedGrad, setSelectedGrad] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: GraphNode } | null>(null);
  const [highlightedGap, setHighlightedGap] = useState<string | null>(null);

  // Refs to access D3 selections from outside the effect
  const d3Refs = useRef<{
    nodeSel: d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown> | null;
    linkSel: d3.Selection<SVGLineElement, GraphLink, SVGGElement, unknown> | null;
    nodes: GraphNode[];
    links: GraphLink[];
  }>({ nodeSel: null, linkSel: null, nodes: [], links: [] });

  const skillGaps = useMemo(() => computeSkillGaps(), []);

  useEffect(() => {
    if (selectedGrad) return;
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const width = rect.width || 700;
    const height = rect.height || 600;

    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const skillMap = new Map<string, GraphNode>();
    const skillOwners = new Map<string, string[]>();

    teamGraduates.forEach((g) => {
      const month = gradSkillMonths[g.id] || 3;
      const snap = getSnapshot(month);
      snap.nodes.forEach((sk) => {
        const jp = Math.max(0, Math.min(10, sk.proficiency + (profJitter[g.id] || 0)));
        if (jp > 0) {
          if (!skillOwners.has(sk.id)) skillOwners.set(sk.id, []);
          skillOwners.get(sk.id)!.push(g.id);
        }
      });
    });

    // Pre-compute employee positions in a circle for stable initial layout
    const empCount = teamGraduates.length;
    const cx = width / 2;
    const cy = height / 2;
    const orbitRadius = Math.min(width, height) * 0.38;

    teamGraduates.forEach((g, i) => {
      const angle = (i / empCount) * Math.PI * 2 - Math.PI / 2;
      nodes.push({
        id: `emp-${g.id}`,
        label: g.name,
        type: "employee",
        radius: 32,
        initials: g.initials,
        status: g.status,
        role: g.role,
        week: g.week,
        gradId: g.id,
        x: cx + Math.cos(angle) * orbitRadius,
        y: cy + Math.sin(angle) * orbitRadius,
      });
    });

    teamGraduates.forEach((g, gi) => {
      const month = gradSkillMonths[g.id] || 3;
      const snap = getSnapshot(month);
      const empAngle = (gi / empCount) * Math.PI * 2 - Math.PI / 2;
      const empX = cx + Math.cos(empAngle) * orbitRadius;
      const empY = cy + Math.sin(empAngle) * orbitRadius;

      snap.nodes.forEach((sk, si) => {
        const jp = Math.max(0, Math.min(10, sk.proficiency + (profJitter[g.id] || 0)));
        if (jp <= 0) return;

        if (!skillMap.has(sk.id)) {
          const owners = skillOwners.get(sk.id) || [];
          const isShared = owners.length > 1;
          const status: "developed" | "developing" | "seed" = jp > 6 ? "developed" : "developing";
          // Match individual graph sizing: radius 8-22 based on proficiency
          const baseRadius = isShared
            ? 10 + owners.length * 2 + (jp / 10) * 6
            : 8 + (jp / 10) * 14;

          const skAngle = empAngle + ((si - snap.nodes.length / 2) / snap.nodes.length) * 1.6;
          const skDist = 120 + Math.random() * 60;

          const skillNode: GraphNode = {
            id: `skill-${sk.id}`,
            label: sk.label,
            type: "skill",
            radius: baseRadius,
            proficiency: jp,
            cluster: sk.cluster,
            sharedBy: owners,
            skillStatus: status,
            x: empX + Math.cos(skAngle) * skDist,
            y: empY + Math.sin(skAngle) * skDist,
          };
          skillMap.set(sk.id, skillNode);
          nodes.push(skillNode);
        }

        links.push({ source: `emp-${g.id}`, target: `skill-${sk.id}` });
      });
    });

    const sel = d3.select(svg);
    sel.selectAll("*").remove();

    const defs = sel.append("defs");
    teamGraduates.forEach((g) => {
      const colors = statusColors[g.status];
      const grad = defs.append("radialGradient").attr("id", `tsc-emp-${g.id}`);
      grad.append("stop").attr("offset", "0%").attr("stop-color", colors.line).attr("stop-opacity", 1);
      grad.append("stop").attr("offset", "100%").attr("stop-color", colors.line).attr("stop-opacity", 0.7);
    });

    const gEl = sel.append("g");
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => gEl.attr("transform", event.transform));
    sel.call(zoom);
    sel.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(0.7));

    const linkSel = gEl.append("g")
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(links)
      .join("line")
      .attr("stroke", "#E5E5E5")
      .attr("stroke-width", 0.6)
      .attr("stroke-opacity", 0.3);

    const nodeSel = gEl.append("g")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes, (d) => d.id)
      .join("g")
      .attr("cursor", (d) => d.type === "employee" ? "pointer" : "default");

    nodeSel.each(function (d) {
      const el = d3.select(this);
      if (d.type === "employee") {
        el.append("circle").attr("r", d.radius + 4).attr("fill", "none")
          .attr("stroke", statusColors[d.status!]?.line || "#666")
          .attr("stroke-width", 1.5).attr("stroke-opacity", 0.2).attr("class", "emp-glow");
        el.append("circle").attr("r", d.radius).attr("fill", `url(#tsc-emp-${d.gradId})`)
          .attr("stroke", "#fff").attr("stroke-width", 2.5).attr("class", "main-circle");
        el.append("text").text(d.initials!).attr("text-anchor", "middle").attr("dy", "0.35em")
          .attr("font-size", 14).attr("font-weight", 600).attr("fill", "#fff").attr("pointer-events", "none");
        el.append("text").text(d.label.split(" ")[0]).attr("text-anchor", "middle")
          .attr("dy", d.radius + 18).attr("font-size", 11).attr("font-weight", 500)
          .attr("fill", "#374151").attr("pointer-events", "none").attr("class", "emp-label");
      } else {
        // Match individual constellation node style
        const isShared = (d.sharedBy?.length || 0) > 1;
        if (d.skillStatus === "developed") {
          el.append("circle").attr("r", d.radius)
            .attr("fill", "#22C55E").attr("fill-opacity", 1)
            .attr("stroke", "#FFFFFF").attr("stroke-width", 2)
            .attr("class", "main-circle");
        } else {
          // developing
          el.append("circle").attr("r", d.radius)
            .attr("fill", "#22C55E").attr("fill-opacity", 0.5)
            .attr("stroke", "#22C55E").attr("stroke-width", 1)
            .attr("stroke-opacity", 0.3)
            .attr("class", "main-circle");
        }
        // Show label for shared or larger nodes
        if (isShared || d.radius > 12) {
          el.append("text").text(d.label).attr("text-anchor", "middle")
            .attr("dy", d.radius + 13).attr("font-size", 10).attr("fill", "#6B7280")
            .attr("pointer-events", "none").attr("class", "skill-label").attr("opacity", 0.8);
        }
      }
    });

    // Hover
    nodeSel
      .on("mouseenter", function (event, d) {
        if (d.type === "employee") {
          const empId = d.id;
          const connectedSkills = new Set<string>();
          links.forEach((l) => {
            const sId = typeof l.source === "string" ? l.source : l.source.id;
            const tId = typeof l.target === "string" ? l.target : l.target.id;
            if (sId === empId) connectedSkills.add(tId);
            if (tId === empId) connectedSkills.add(sId);
          });
          linkSel
            .attr("stroke-opacity", (l) => {
              const sId = typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
              const tId = typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
              return sId === empId || tId === empId ? 0.5 : 0.03;
            })
            .attr("stroke-width", (l) => {
              const sId = typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
              const tId = typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
              return sId === empId || tId === empId ? 1.2 : 0.3;
            })
            .attr("stroke", (l) => {
              const sId = typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
              const tId = typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
              return sId === empId || tId === empId ? (statusColors[d.status!]?.line || "#666") : "#E5E5E5";
            });
          nodeSel.selectAll<SVGCircleElement, GraphNode>(".main-circle")
            .attr("fill-opacity", (nd) => {
              if (nd.id === empId || nd.type === "employee") return undefined as any;
              return connectedSkills.has(nd.id) ? 0.8 : 0.06;
            });
          nodeSel.selectAll<SVGTextElement, GraphNode>(".skill-label")
            .attr("opacity", (nd) => connectedSkills.has(nd.id) ? 1 : 0.05);
          d3.select(this).select(".main-circle").transition().duration(150).attr("r", d.radius * 1.12);
          d3.select(this).select(".emp-glow").transition().duration(150).attr("r", (d.radius * 1.12) + 4).attr("stroke-opacity", 0.4);
        }
        const svgRect = svg.getBoundingClientRect();
        setTooltip({ x: event.clientX - svgRect.left, y: event.clientY - svgRect.top - 10, node: d });
      })
      .on("mousemove", (event) => {
        const svgRect = svg.getBoundingClientRect();
        setTooltip((prev) => prev ? { ...prev, x: event.clientX - svgRect.left, y: event.clientY - svgRect.top - 10 } : null);
      })
      .on("mouseleave", function (_event, d) {
        linkSel.attr("stroke", "#E5E5E5").attr("stroke-width", 0.6).attr("stroke-opacity", 0.3);
        nodeSel.selectAll<SVGCircleElement, GraphNode>(".main-circle")
          .attr("fill-opacity", (nd) => {
            if (nd.type === "employee") return undefined as any;
            return (nd.sharedBy?.length || 0) > 1 ? 0.6 : 0.3;
          });
        nodeSel.selectAll<SVGTextElement, GraphNode>(".skill-label").attr("opacity", 0.7);
        if (d.type === "employee") {
          d3.select(this).select(".main-circle").transition().duration(150).attr("r", d.radius);
          d3.select(this).select(".emp-glow").transition().duration(150).attr("r", d.radius + 4).attr("stroke-opacity", 0.2);
        }
        setTooltip(null);
      })
      .on("click", (_event, d) => {
        if (d.type === "employee" && d.gradId) {
          setTooltip(null);
          setSelectedGrad(d.gradId);
        }
      });

    // Simulation — warm start to avoid spasm
    const sim = d3.forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id)
        .distance((l) => {
          const t = typeof l.target === "string" ? nodes.find((n) => n.id === l.target)! : l.target as GraphNode;
          return (t.type === "skill" && (t.sharedBy?.length || 0) > 1) ? 140 : 180;
        })
        .strength((l) => {
          const t = typeof l.target === "string" ? nodes.find((n) => n.id === l.target)! : l.target as GraphNode;
          return (t.type === "skill" && (t.sharedBy?.length || 0) > 1) ? 0.25 : 0.08;
        }))
      .force("charge", d3.forceManyBody<GraphNode>().strength((d) => d.type === "employee" ? -900 : -80))
      .force("center", d3.forceCenter(cx, cy).strength(0.03))
      .force("collide", d3.forceCollide<GraphNode>().radius((d) => d.radius + (d.type === "employee" ? 30 : 12)).strength(0.9));

    // Run simulation silently for 120 ticks to settle before rendering
    sim.stop();
    for (let i = 0; i < 120; i++) sim.tick();

    // Position nodes at settled state
    linkSel
      .attr("x1", (d: any) => d.source.x)
      .attr("y1", (d: any) => d.source.y)
      .attr("x2", (d: any) => d.target.x)
      .attr("y2", (d: any) => d.target.y);
    nodeSel.attr("transform", (d) => `translate(${d.x},${d.y})`);

    // Then restart with low alpha for gentle settling
    sim.alpha(0.15).alphaDecay(0.04)
      .on("tick", () => {
        linkSel
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y);
        nodeSel.attr("transform", (d) => `translate(${d.x},${d.y})`);
      })
      .restart();

    // Drag
    nodeSel.call(
      d3.drag<SVGGElement, GraphNode>()
        .on("start", (event, d) => {
          if (!event.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on("end", (event, d) => {
          if (!event.active) sim.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
    );

    // Store refs for external highlight
    d3Refs.current = { nodeSel: nodeSel as any, linkSel: linkSel as any, nodes, links };

    return () => { sim.stop(); };
  }, [selectedGrad]);

  // Effect to highlight graduates missing a selected gap skill
  useEffect(() => {
    const { nodeSel, linkSel, links } = d3Refs.current;
    if (!nodeSel || !linkSel || selectedGrad) return;

    if (!highlightedGap) {
      // Reset all
      linkSel.attr("stroke", "#E5E5E5").attr("stroke-width", 0.6).attr("stroke-opacity", 0.3);
      nodeSel.selectAll<SVGCircleElement, GraphNode>(".main-circle")
        .attr("fill-opacity", (nd: GraphNode) => {
          if (nd.type === "employee") return undefined as any;
          return (nd.sharedBy?.length || 0) > 1 ? 0.6 : 0.3;
        });
      nodeSel.selectAll<SVGTextElement, GraphNode>(".skill-label").attr("opacity", 0.7);
      nodeSel.selectAll<SVGTextElement, GraphNode>(".emp-label").attr("opacity", 1);
      nodeSel.selectAll<SVGCircleElement, GraphNode>(".emp-glow").attr("stroke-opacity", 0.2);
      nodeSel.transition().duration(200).style("opacity", 1);
      return;
    }

    const gap = skillGaps.find((g) => g.id === highlightedGap);
    if (!gap) return;

    // Find grad IDs missing this skill
    const missingGradIds = new Set<string>();
    teamGraduates.forEach((g) => {
      const month = gradSkillMonths[g.id] || 3;
      const snap = getSnapshot(month);
      const node = snap.nodes.find((n) => n.id === highlightedGap);
      const prof = node ? Math.max(0, node.proficiency + (profJitter[g.id] || 0)) : 0;
      if (prof < 3) missingGradIds.add(g.id);
    });

    const missingEmpIds = new Set([...missingGradIds].map((id) => `emp-${id}`));
    const targetSkillId = `skill-${highlightedGap}`;

    // Dim everything, highlight missing grads and the skill node
    nodeSel.transition().duration(200).style("opacity", (d: GraphNode) => {
      if (missingEmpIds.has(d.id)) return 1;
      if (d.id === targetSkillId) return 1;
      return 0.12;
    });

    linkSel
      .attr("stroke-opacity", (l: GraphLink) => {
        const sId = typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
        const tId = typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
        if ((missingEmpIds.has(sId) && tId === targetSkillId) || (missingEmpIds.has(tId) && sId === targetSkillId)) return 0.6;
        return 0.03;
      })
      .attr("stroke-width", (l: GraphLink) => {
        const sId = typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
        const tId = typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
        if ((missingEmpIds.has(sId) && tId === targetSkillId) || (missingEmpIds.has(tId) && sId === targetSkillId)) return 1.5;
        return 0.3;
      })
      .attr("stroke", (l: GraphLink) => {
        const sId = typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
        const tId = typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
        if ((missingEmpIds.has(sId) && tId === targetSkillId) || (missingEmpIds.has(tId) && sId === targetSkillId)) return "#EF4444";
        return "#E5E5E5";
      });
  }, [highlightedGap, selectedGrad, skillGaps]);

  // Drill-down
  const selectedGradData = selectedGrad ? teamGraduates.find((g) => g.id === selectedGrad) : null;
  if (selectedGrad && selectedGradData) {
    const month = gradSkillMonths[selectedGrad] || 3;
    return (
      <div>
        <button onClick={() => setSelectedGrad(null)} className="flex items-center gap-2 mb-4"
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#6B7280", padding: "4px 0" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#111"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#6B7280"; }}>
          <ArrowLeft size={16} /> Back to Team Constellation
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: statusColors[selectedGradData.status].line, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 600 }}>
            {selectedGradData.initials}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#111" }}>{selectedGradData.name}</div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>{selectedGradData.role} · Week {selectedGradData.week}</div>
          </div>
        </div>
        <div style={{ height: 500, borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", background: "#fff" }}>
          <SkillsGraph nodes={getSnapshot(month).nodes} edges={getSnapshot(month).edges} />
        </div>
      </div>
    );
  }

  // Tooltip
  const renderTooltip = () => {
    if (!tooltip) return null;
    const d = tooltip.node;
    if (d.type === "employee") {
      return (
        <div style={{ position: "absolute", left: tooltip.x + 14, top: tooltip.y - 60, background: "#111", borderRadius: 8, padding: "12px 16px", pointerEvents: "none", zIndex: 20, minWidth: 180 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{d.label}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{d.role} · Week {d.week}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Click to explore their skills</div>
        </div>
      );
    }
    const shared = d.sharedBy || [];
    const gradNames = shared.map((gid) => teamGraduates.find((tg) => tg.id === gid)?.name.split(" ")[0] || gid);
    return (
      <div style={{ position: "absolute", left: tooltip.x + 14, top: tooltip.y - 60, background: "#111", borderRadius: 8, padding: "12px 16px", pointerEvents: "none", zIndex: 20, minWidth: 180 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{d.label}</div>
        <div className="flex items-center gap-1.5" style={{ marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: clusterColors[d.cluster!] || "#6B7280", display: "inline-block" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "capitalize" }}>{d.cluster}</span>
        </div>
        {shared.length > 1 && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>Shared by: {gradNames.join(", ")}</div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <Users size={20} strokeWidth={1.5} style={{ color: "#22C55E" }} />
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111" }}>Team Skills Constellation</h2>
      </div>
      <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
        Employees are central nodes surrounded by their skills. Shared skills naturally cluster between graduates — revealing team strengths and gaps at a glance.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4" style={{ fontSize: 11, color: "#6B7280" }}>
        {Object.entries(clusterColors).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
            <span style={{ textTransform: "capitalize" }}>{key}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-5" style={{ alignItems: "flex-start" }}>
        {/* Graph */}
        <div style={{ position: "relative", flex: 1, height: 650, borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", background: "#fff", overflow: "hidden" }}>
          <svg ref={svgRef} style={{ width: "100%", height: "100%", display: "block" }} />
          {renderTooltip()}
        </div>

        {/* Skill Gap Panel */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", padding: "20px 18px" }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={15} style={{ color: "#F59E0B" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>Team Skill Gaps</span>
            </div>
            <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 16, lineHeight: 1.5 }}>
              Skills where the most graduates are underdeveloped (proficiency below 3/10).
            </p>

            <div className="flex flex-col gap-4">
              {skillGaps.map((gap, i) => (
                <div key={gap.id}
                  onClick={() => setHighlightedGap(highlightedGap === gap.id ? null : gap.id)}
                  style={{
                    cursor: "pointer",
                    borderRadius: 8,
                    padding: "8px 10px",
                    margin: "-8px -10px",
                    background: highlightedGap === gap.id ? "#FEF2F2" : "transparent",
                    border: highlightedGap === gap.id ? "1px solid rgba(239,68,68,0.15)" : "1px solid transparent",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => { if (highlightedGap !== gap.id) e.currentTarget.style.background = "#F9FAFB"; }}
                  onMouseLeave={(e) => { if (highlightedGap !== gap.id) e.currentTarget.style.background = "transparent"; }}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#111", marginBottom: 2 }}>{gap.label}</div>
                      <div className="flex items-center gap-1.5">
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: clusterColors[gap.cluster] || "#6B7280", display: "inline-block" }} />
                        <span style={{ fontSize: 10, color: "#9CA3AF", textTransform: "capitalize" }}>{gap.cluster}</span>
                      </div>
                    </div>
                    <div style={{
                      fontSize: 12, fontWeight: 600,
                      color: gap.missingCount >= 4 ? "#DC2626" : gap.missingCount >= 3 ? "#F59E0B" : "#6B7280",
                      background: gap.missingCount >= 4 ? "#FEF2F2" : gap.missingCount >= 3 ? "#FFFBEB" : "#F3F4F6",
                      borderRadius: 6, padding: "2px 8px",
                      whiteSpace: "nowrap",
                    }}>
                      {gap.missingCount}/{gap.totalGrads}
                    </div>
                  </div>
                  {/* Bar */}
                  <div style={{ height: 4, borderRadius: 2, background: "#F3F4F6", marginBottom: 4 }}>
                    <div style={{
                      height: "100%", borderRadius: 2,
                      width: `${(gap.missingCount / gap.totalGrads) * 100}%`,
                      background: gap.missingCount >= 4 ? "#EF4444" : gap.missingCount >= 3 ? "#F59E0B" : "#9CA3AF",
                      opacity: 0.7,
                    }} />
                  </div>
                  <div style={{ fontSize: 10, color: "#9CA3AF", lineHeight: 1.4 }}>
                    {gap.gradsMissing.join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 11, color: "#9CA3AF", textAlign: "center", lineHeight: 1.5 }}>
            Click any employee node to explore their individual skill constellation
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamSkillsConstellation;
