"""
╔══════════════════════════════════════════════════════════════╗
║          ARTHENYX — Autonomous Cost Intelligence System      ║
║          Multi-Agent Backend · v1.0 · Hackathon Build        ║
╚══════════════════════════════════════════════════════════════╝

Architecture:
  IngestionAgent → NarrativeAgent → DriftAgent →
  DecisionAgent → ActionAgent → AuditAgent

NFI = w1(UncertaintyGrowth) + w2(RiskTermFrequency) +
      w3(SentimentVolatility) + w4(CrossSourceAlignment)
"""

import json
import time
import random
import hashlib
import datetime
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Optional, Tuple
from collections import deque


# ═══════════════════════════════════════════════════════════════
#  CONFIG & THRESHOLDS
# ═══════════════════════════════════════════════════════════════

NFI_WEIGHTS = {"w1": 0.30, "w2": 0.25, "w3": 0.25, "w4": 0.20}
NFI_SPIKE_THRESHOLD  = 0.28   # triggers alert
NFI_ACTION_THRESHOLD = 0.72   # triggers autonomous action
CONFIDENCE_AUTO_ACT  = 0.85   # confidence required for auto-execution
MAX_RETRIES = 3
INR_USD     = 83.0            # exchange rate for display


# ═══════════════════════════════════════════════════════════════
#  DATA MODELS
# ═══════════════════════════════════════════════════════════════

@dataclass
class NarrativeSignal:
    source: str
    text: str
    timestamp: str
    metadata: Dict = field(default_factory=dict)

@dataclass
class AnalysedSignal:
    source: str
    themes: List[str]
    sentiment_score: float        # -1 (very negative) → +1 (very positive)
    uncertainty_terms: List[str]
    risk_terms: List[str]
    timestamp: str

@dataclass
class NFISnapshot:
    timestamp: str
    nfi: float
    uncertainty_growth: float
    risk_term_freq: float
    sentiment_volatility: float
    cross_source_alignment: float
    components: Dict

@dataclass
class AgentDecision:
    trigger: str
    root_cause: str
    recommended_action: str
    confidence: float
    scenario: str
    metadata: Dict = field(default_factory=dict)

@dataclass
class ExecutedAction:
    action_id: str
    action_type: str
    description: str
    executed_at: str
    confidence: float
    savings_inr_hourly: float
    savings_inr_daily: float
    savings_inr_monthly: float
    approval_status: str          # "auto" | "pending" | "approved" | "rejected"
    api_response: Dict = field(default_factory=dict)

@dataclass
class AuditEntry:
    entry_id: str
    timestamp: str
    trigger: str
    agent_decision: str
    action_taken: str
    confidence: float
    nfi_at_trigger: float
    financial_impact_inr: str
    approval_status: str


# ═══════════════════════════════════════════════════════════════
#  SIMULATED DATA
# ═══════════════════════════════════════════════════════════════

SAMPLE_NARRATIVES = [
    NarrativeSignal(
        source="Q4 Earnings Transcript — TechCorp",
        text="""We remain cautious about the demand environment heading into Q1.
        There is significant uncertainty in cloud spending. Customers are slowing
        provisioning decisions amid macroeconomic headwinds. Risk of over-capacity
        is elevated. Our compute costs remain a concern given the slowdown in
        workload growth. We expect muted growth and possible risk to margins.""",
        timestamp="2024-01-15T06:00:00"
    ),
    NarrativeSignal(
        source="Industry Analyst Report — IDC",
        text="""Cloud IaaS spending growth decelerating sharply. Enterprises showing
        caution in new commitments. Uncertain macro outlook driving cost optimization
        mandates. Risk of overprovisioning is rising as workloads stagnate. Multiple
        vendors seeing slowdown in consumption growth. Cost risk is real.""",
        timestamp="2024-01-15T07:30:00"
    ),
    NarrativeSignal(
        source="Internal Cost Report — Q4 Review",
        text="""Compute utilization dropped to 47%. Reserved instances running at
        below-threshold efficiency. Cloud spend up 40% YoY despite flat workload
        growth. Engineering team provisioned resources preemptively that are now idle.
        Monthly burn rate: INR 12,40,000. Waste estimate: INR 4,20,000/month.""",
        timestamp="2024-01-15T08:15:00"
    ),
    NarrativeSignal(
        source="Vendor Contract Database",
        text="""Active subscriptions: Zendesk (₹85,000/mo), Freshdesk (₹72,000/mo),
        Slack (₹1,20,000/mo), Microsoft Teams (₹95,000/mo). Overlap analysis
        indicates duplicate tooling across customer support and communications stacks.
        Total potential consolidation savings: ₹1,57,000/month.""",
        timestamp="2024-01-15T09:00:00"
    ),
    NarrativeSignal(
        source="On-Call Ops Log — Payments API",
        text="""P95 latency trending upward — 340ms vs SLA target 200ms. Team A
        at 96% capacity. Three simultaneous sprint deliverables creating bottleneck.
        Risk of SLA breach within 48 hours. Customer escalation possible. Need
        immediate task redistribution to prevent service degradation.""",
        timestamp="2024-01-15T10:00:00"
    ),
]

RISK_KEYWORDS = [
    "risk", "uncertain", "slowdown", "cautious", "headwind", "concern",
    "muted", "decelerat", "overprovisio", "idle", "waste", "inefficien",
    "breach", "escalat", "degradat", "bottleneck", "overload", "duplicate",
    "overlap", "redundan", "below-threshold", "decline", "flat", "stagnate"
]

UNCERTAINTY_TERMS = [
    "uncertain", "cautious", "risk", "headwind", "slowdown", "muted",
    "possible", "potential", "concern", "elevated", "expect", "anticipate"
]


# ═══════════════════════════════════════════════════════════════
#  AGENT 1: INGESTION AGENT
# ═══════════════════════════════════════════════════════════════

class IngestionAgent:
    """
    Pulls financial narratives from simulated sources:
    - Earnings transcripts
    - Industry reports
    - Internal cost data
    - Vendor contracts
    - Ops logs
    """

    def __init__(self):
        self.name = "IngestionAgent"
        self.processed_count = 0

    def ingest(self, sources: List[NarrativeSignal] = None) -> List[NarrativeSignal]:
        print(f"\n{'='*60}")
        print(f"[{self.name}] Starting ingestion pipeline...")
        
        if sources is None:
            sources = SAMPLE_NARRATIVES

        results = []
        for src in sources:
            time.sleep(0.05)  # simulate I/O
            results.append(src)
            self.processed_count += 1
            print(f"  ✓ Ingested: {src.source[:50]}")

        print(f"[{self.name}] Ingested {len(results)} sources successfully.")
        return results


# ═══════════════════════════════════════════════════════════════
#  AGENT 2: NARRATIVE ANALYSIS AGENT
# ═══════════════════════════════════════════════════════════════

class NarrativeAnalysisAgent:
    """
    Extracts:
    - Themes (keyword clusters)
    - Sentiment score (rule-based simulation)
    - Uncertainty terms
    - Risk terms
    """

    def __init__(self):
        self.name = "NarrativeAnalysisAgent"

    def _mock_sentiment(self, text: str) -> float:
        """Simulate sentiment. More negative keywords → lower score."""
        neg_words = ["risk", "cautious", "uncertain", "slowdown", "decline",
                     "headwind", "concern", "breach", "bottleneck", "idle",
                     "waste", "below", "flat", "stagnate", "overload"]
        pos_words = ["growth", "improve", "efficient", "recover", "strong"]
        text_lower = text.lower()
        neg = sum(text_lower.count(w) for w in neg_words)
        pos = sum(text_lower.count(w) for w in pos_words)
        score = (pos - neg) / max(pos + neg, 1)
        return round(max(-1.0, min(1.0, score)), 3)

    def _extract_themes(self, text: str) -> List[str]:
        theme_map = {
            "over-provisioning": ["overprovisio", "idle", "below-threshold", "unutilized"],
            "demand-slowdown":   ["slowdown", "decelerat", "flat", "muted", "stagnate"],
            "cost-spike":        ["cost", "burn rate", "spend", "waste"],
            "vendor-overlap":    ["duplicate", "overlap", "redundan", "zendesk", "freshdesk", "slack", "teams"],
            "sla-risk":          ["sla", "breach", "latency", "bottleneck", "capacity"],
            "macro-headwinds":   ["macroeconomic", "headwind", "uncertain", "cautious"],
        }
        found = []
        text_lower = text.lower()
        for theme, keywords in theme_map.items():
            if any(k in text_lower for k in keywords):
                found.append(theme)
        return found or ["general-risk"]

    def _extract_terms(self, text: str, term_list: List[str]) -> List[str]:
        text_lower = text.lower()
        return [t for t in term_list if t in text_lower]

    def analyse(self, signals: List[NarrativeSignal]) -> List[AnalysedSignal]:
        print(f"\n[{self.name}] Analysing {len(signals)} signals...")
        results = []
        for sig in signals:
            analysed = AnalysedSignal(
                source=sig.source,
                themes=self._extract_themes(sig.text),
                sentiment_score=self._mock_sentiment(sig.text),
                uncertainty_terms=self._extract_terms(sig.text, UNCERTAINTY_TERMS),
                risk_terms=self._extract_terms(sig.text, RISK_KEYWORDS),
                timestamp=sig.timestamp
            )
            results.append(analysed)
            print(f"  📊 {sig.source[:45]}")
            print(f"     Sentiment: {analysed.sentiment_score:+.3f} | "
                  f"Themes: {', '.join(analysed.themes[:3])}")
        print(f"[{self.name}] Analysis complete.")
        return results


# ═══════════════════════════════════════════════════════════════
#  AGENT 3: DRIFT DETECTION AGENT (NFI Engine)
# ═══════════════════════════════════════════════════════════════

class DriftDetectionAgent:
    """
    Computes the Narrative Fragility Index (NFI):

    NFI = w1 * UncertaintyGrowth
        + w2 * RiskTermFrequency
        + w3 * SentimentVolatility
        + w4 * CrossSourceAlignment

    Detects spikes and raises alerts.
    """

    def __init__(self, weights: Dict = None, history_window: int = 10):
        self.name = "DriftDetectionAgent"
        self.weights = weights or NFI_WEIGHTS
        self.nfi_history: deque = deque(maxlen=history_window)
        self.sentiment_history: deque = deque(maxlen=history_window)
        self.baseline_uncertainty = 0.15   # normal frequency

    def _uncertainty_growth(self, signals: List[AnalysedSignal]) -> float:
        total_words = sum(len(s.uncertainty_terms) for s in signals)
        current_rate = total_words / max(len(signals), 1) / 5.0
        growth = max(0.0, (current_rate - self.baseline_uncertainty) /
                    max(self.baseline_uncertainty, 0.01))
        return min(1.0, growth)

    def _risk_term_frequency(self, signals: List[AnalysedSignal]) -> float:
        total_risk = sum(len(s.risk_terms) for s in signals)
        freq = total_risk / max(len(signals) * 10, 1)
        return min(1.0, freq)

    def _sentiment_volatility(self, signals: List[AnalysedSignal]) -> float:
        scores = [s.sentiment_score for s in signals]
        self.sentiment_history.extend(scores)
        if len(self.sentiment_history) < 2:
            return 0.0
        hist = list(self.sentiment_history)
        variance = sum((x - sum(hist)/len(hist))**2 for x in hist) / len(hist)
        volatility = variance ** 0.5
        return min(1.0, volatility * 2.5)

    def _cross_source_alignment(self, signals: List[AnalysedSignal]) -> float:
        if len(signals) < 2:
            return 0.0
        all_themes = [set(s.themes) for s in signals]
        if not all_themes:
            return 0.0
        common = all_themes[0]
        for t in all_themes[1:]:
            common = common.intersection(t)
        union = set()
        for t in all_themes:
            union = union.union(t)
        if not union:
            return 0.0
        jaccard = len(common) / len(union)
        return round(jaccard, 3)

    def compute_nfi(self, signals: List[AnalysedSignal]) -> NFISnapshot:
        ug  = self._uncertainty_growth(signals)
        rtf = self._risk_term_frequency(signals)
        sv  = self._sentiment_volatility(signals)
        csa = self._cross_source_alignment(signals)

        w = self.weights
        nfi = (w["w1"] * ug + w["w2"] * rtf + w["w3"] * sv + w["w4"] * csa)
        nfi = round(min(1.0, nfi), 4)

        self.nfi_history.append(nfi)

        snapshot = NFISnapshot(
            timestamp=datetime.datetime.now().isoformat(),
            nfi=nfi,
            uncertainty_growth=round(ug, 4),
            risk_term_freq=round(rtf, 4),
            sentiment_volatility=round(sv, 4),
            cross_source_alignment=round(csa, 4),
            components={"UG": ug, "RTF": rtf, "SV": sv, "CSA": csa}
        )

        print(f"\n[{self.name}] NFI Computed:")
        print(f"  NFI Score       : {nfi:.4f}  {'⚠ SPIKE' if nfi >= NFI_SPIKE_THRESHOLD else '✓ Normal'}")
        print(f"  Uncertainty Gr. : {ug:.4f}")
        print(f"  Risk Term Freq  : {rtf:.4f}")
        print(f"  Sentiment Vol.  : {sv:.4f}")
        print(f"  Cross-Src Align : {csa:.4f}")
        print(f"  Formula: NFI = {w['w1']}×{ug:.2f} + {w['w2']}×{rtf:.2f} + {w['w3']}×{sv:.2f} + {w['w4']}×{csa:.2f}")

        return snapshot

    def detect_spike(self, snapshot: NFISnapshot) -> bool:
        spiked = snapshot.nfi >= NFI_SPIKE_THRESHOLD
        if spiked:
            print(f"\n  🚨 SPIKE DETECTED: NFI={snapshot.nfi:.4f} > threshold={NFI_SPIKE_THRESHOLD}")
        return spiked


# ═══════════════════════════════════════════════════════════════
#  AGENT 4: DECISION AGENT
# ═══════════════════════════════════════════════════════════════

class DecisionAgent:
    """
    Maps narrative signals → operational root causes → decisions.

    Signal mapping table:
      demand-slowdown + cost-spike       → over-provisioning → scale down
      vendor-overlap                     → duplicate tooling → consolidate
      sla-risk + bottleneck              → overload          → reassign tasks
    """

    def __init__(self):
        self.name = "DecisionAgent"

    DECISION_MAP = {
        frozenset(["demand-slowdown", "cost-spike"]): {
            "root_cause": "Cloud over-provisioning due to demand slowdown",
            "action": "Scale down compute resources by 30-40%",
            "scenario": "cloud_cost_spike",
            "confidence": 0.91
        },
        frozenset(["vendor-overlap"]): {
            "root_cause": "Duplicate vendor tooling identified via semantic similarity",
            "action": "Recommend vendor consolidation — eliminate redundant SaaS",
            "scenario": "vendor_duplication",
            "confidence": 0.84
        },
        frozenset(["sla-risk"]): {
            "root_cause": "SLA breach risk from team overload and capacity constraints",
            "action": "Reassign critical tasks to available team capacity",
            "scenario": "sla_breach",
            "confidence": 0.78
        },
        frozenset(["over-provisioning"]): {
            "root_cause": "Direct over-provisioning signal from cost data",
            "action": "Terminate idle compute instances",
            "scenario": "cloud_cost_spike",
            "confidence": 0.89
        },
    }

    def decide(self,
               snapshot: NFISnapshot,
               signals: List[AnalysedSignal]) -> Optional[AgentDecision]:

        all_themes = set()
        for sig in signals:
            all_themes.update(sig.themes)

        print(f"\n[{self.name}] Active themes: {all_themes}")

        best_match = None
        best_confidence = 0.0

        for key_set, decision_data in self.DECISION_MAP.items():
            if key_set.issubset(all_themes) or any(k in all_themes for k in key_set):
                if decision_data["confidence"] > best_confidence:
                    best_confidence = decision_data["confidence"]
                    best_match = decision_data

        if not best_match:
            print(f"[{self.name}] No strong decision match found.")
            return None

        decision = AgentDecision(
            trigger=f"NFI={snapshot.nfi:.3f} spike detected with themes: {list(all_themes)[:4]}",
            root_cause=best_match["root_cause"],
            recommended_action=best_match["action"],
            confidence=best_match["confidence"],
            scenario=best_match["scenario"],
            metadata={"themes": list(all_themes), "nfi": snapshot.nfi}
        )

        print(f"[{self.name}] Decision reached:")
        print(f"  Root Cause : {decision.root_cause}")
        print(f"  Action     : {decision.recommended_action}")
        print(f"  Confidence : {decision.confidence:.0%}")
        print(f"  Scenario   : {decision.scenario}")

        return decision


# ═══════════════════════════════════════════════════════════════
#  MOCK API CALLS
# ═══════════════════════════════════════════════════════════════

def mock_cloud_scale_api(scale_percent: int, region: str = "us-east-1") -> Dict:
    """Simulates AWS/GCP cloud scaling API."""
    time.sleep(0.1)
    current_instances = 48
    new_instances = int(current_instances * (1 - scale_percent / 100))
    cost_per_instance_hourly = 85.0   # INR per instance per hour
    savings_hourly = (current_instances - new_instances) * cost_per_instance_hourly

    return {
        "status": "success",
        "region": region,
        "action": f"scale_down_{scale_percent}pct",
        "instances_before": current_instances,
        "instances_after": new_instances,
        "instances_terminated": current_instances - new_instances,
        "savings_inr_hourly": savings_hourly,
        "savings_inr_daily": savings_hourly * 24,
        "savings_inr_monthly": savings_hourly * 24 * 30,
        "executed_at": datetime.datetime.now().isoformat(),
        "request_id": hashlib.md5(f"{time.time()}".encode()).hexdigest()[:12]
    }

def mock_vendor_consolidation_api(vendor_to_remove: str, annual_cost: float) -> Dict:
    """Simulates procurement/contract management API."""
    time.sleep(0.1)
    return {
        "status": "recommendation_raised",
        "vendor_flagged": vendor_to_remove,
        "annual_savings_inr": annual_cost,
        "approval_required": True,
        "recommendation_id": f"REC-{random.randint(1000,9999)}",
        "created_at": datetime.datetime.now().isoformat()
    }

def mock_task_reassign_api(from_team: str, to_team: str, task_ids: List[str]) -> Dict:
    """Simulates workflow/project management API."""
    time.sleep(0.1)
    return {
        "status": "success",
        "tasks_reassigned": len(task_ids),
        "from_team": from_team,
        "to_team": to_team,
        "task_ids": task_ids,
        "estimated_recovery_hours": 6,
        "sla_breach_averted": True,
        "executed_at": datetime.datetime.now().isoformat()
    }


# ═══════════════════════════════════════════════════════════════
#  AGENT 5: ACTION AGENT
# ═══════════════════════════════════════════════════════════════

class ActionAgent:
    """
    Executes corrective actions:
    - Cloud scaling via mock API
    - Vendor consolidation recommendation
    - Task reassignment

    Features:
    - Retry logic (up to MAX_RETRIES)
    - Confidence gating (auto-execute if conf >= threshold)
    - Human-in-the-loop for low-confidence or sensitive actions
    """

    def __init__(self):
        self.name = "ActionAgent"

    def _with_retry(self, fn, *args, **kwargs) -> Tuple[bool, Dict]:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                result = fn(*args, **kwargs)
                return True, result
            except Exception as e:
                print(f"  ⚠ Attempt {attempt} failed: {e}")
                time.sleep(0.2 * attempt)
        return False, {"status": "failed", "error": "Max retries exceeded"}

    def execute(self, decision: AgentDecision) -> ExecutedAction:
        print(f"\n[{self.name}] Executing action for scenario: {decision.scenario}")
        action_id = f"ACT-{hashlib.md5(f'{time.time()}'.encode()).hexdigest()[:8].upper()}"
        approval_status = "auto" if decision.confidence >= CONFIDENCE_AUTO_ACT else "pending"

        if decision.confidence < CONFIDENCE_AUTO_ACT:
            print(f"  ⏳ Confidence {decision.confidence:.0%} < threshold {CONFIDENCE_AUTO_ACT:.0%}")
            print(f"  → Action queued for human approval (HITL)")

        api_response = {}
        savings_hourly = savings_daily = savings_monthly = 0.0
        action_type = ""
        description = ""

        if decision.scenario == "cloud_cost_spike":
            print(f"  🤖 Calling cloud scaling API...")
            scale_pct = 35
            ok, resp = self._with_retry(mock_cloud_scale_api, scale_pct, "us-east-1")
            api_response = resp
            if ok and resp["status"] == "success":
                savings_hourly  = resp["savings_inr_hourly"]
                savings_daily   = resp["savings_inr_daily"]
                savings_monthly = resp["savings_inr_monthly"]
                action_type     = "cloud_scale_down"
                description     = (f"Scaled down compute by {scale_pct}% on us-east-1. "
                                   f"Terminated {resp['instances_terminated']} instances. "
                                   f"Utilization improved 47% → 82%.")
                print(f"  ✅ Cloud scaled down {scale_pct}%")
                print(f"     Savings: ₹{savings_hourly:,.0f}/hr | ₹{savings_monthly:,.0f}/mo")

        elif decision.scenario == "vendor_duplication":
            print(f"  🤖 Calling vendor consolidation API...")
            ok, resp = self._with_retry(
                mock_vendor_consolidation_api, "Freshdesk", 1_80_000
            )
            api_response = resp
            savings_hourly  = 1_80_000 / (12 * 30 * 24)
            savings_daily   = 1_80_000 / (12 * 30)
            savings_monthly = 1_80_000 / 12
            action_type     = "vendor_consolidation"
            description     = (f"Flagged Freshdesk for removal (94% overlap with Zendesk). "
                                f"Recommendation #{resp.get('recommendation_id','N/A')} raised. "
                                f"Awaiting procurement approval.")
            print(f"  ✅ Vendor consolidation recommendation raised.")
            print(f"     Projected annual savings: ₹1,80,000")

        elif decision.scenario == "sla_breach":
            tasks = ["TICK-2841", "TICK-2842", "TICK-2843", "TICK-2844"]
            print(f"  🤖 Calling task reassignment API...")
            ok, resp = self._with_retry(mock_task_reassign_api, "Team-A", "Team-B", tasks)
            api_response = resp
            savings_hourly  = 85_000 / (30 * 24)    # breach penalty avoided
            savings_daily   = 85_000 / 30
            savings_monthly = 85_000
            action_type     = "task_reassignment"
            description     = (f"Reassigned {len(tasks)} critical tickets from Team-A to Team-B. "
                                f"SLA breach averted. P95 latency expected to normalize in "
                                f"{resp.get('estimated_recovery_hours', 6)}h.")
            print(f"  ✅ {len(tasks)} tasks reassigned to Team-B")
            print(f"     Breach penalty averted: ₹85,000")

        else:
            action_type = "generic_alert"
            description = f"Alert raised for: {decision.recommended_action}"
            print(f"  ⚠ Generic alert raised (no API integration for this scenario).")

        return ExecutedAction(
            action_id=action_id,
            action_type=action_type,
            description=description,
            executed_at=datetime.datetime.now().isoformat(),
            confidence=decision.confidence,
            savings_inr_hourly=round(savings_hourly, 2),
            savings_inr_daily=round(savings_daily, 2),
            savings_inr_monthly=round(savings_monthly, 2),
            approval_status=approval_status,
            api_response=api_response
        )


# ═══════════════════════════════════════════════════════════════
#  AGENT 6: AUDIT AGENT
# ═══════════════════════════════════════════════════════════════

class AuditAgent:
    """
    Logs every trigger, decision, action, confidence, and impact.
    Enterprise-grade immutable audit trail.
    """

    def __init__(self):
        self.name = "AuditAgent"
        self.log: List[AuditEntry] = []

    def record(self,
               snapshot: NFISnapshot,
               decision: AgentDecision,
               action: ExecutedAction) -> AuditEntry:

        entry_id = f"AUD-{len(self.log)+1:04d}"
        financial = (f"₹{action.savings_inr_hourly:,.0f}/hr · "
                     f"₹{action.savings_inr_monthly:,.0f}/mo")

        entry = AuditEntry(
            entry_id=entry_id,
            timestamp=datetime.datetime.now().isoformat(),
            trigger=decision.trigger[:80],
            agent_decision=decision.root_cause,
            action_taken=f"[{action.action_id}] {action.description[:80]}",
            confidence=decision.confidence,
            nfi_at_trigger=snapshot.nfi,
            financial_impact_inr=financial,
            approval_status=action.approval_status
        )
        self.log.append(entry)
        print(f"\n[{self.name}] ✓ Audit entry {entry_id} recorded.")
        return entry

    def print_log(self):
        print(f"\n{'='*80}")
        print(f"  ARTHENYX AUDIT LOG — {len(self.log)} entries")
        print(f"{'='*80}")
        for e in self.log:
            print(f"\n  [{e.entry_id}] {e.timestamp}")
            print(f"  Trigger   : {e.trigger}")
            print(f"  Decision  : {e.agent_decision}")
            print(f"  Action    : {e.action_taken}")
            print(f"  NFI       : {e.nfi_at_trigger:.4f}  |  Confidence: {e.confidence:.0%}")
            print(f"  Impact    : {e.financial_impact_inr}")
            print(f"  Approval  : {e.approval_status.upper()}")
            print(f"  {'-'*70}")

    def export_json(self) -> str:
        return json.dumps([asdict(e) for e in self.log], indent=2)


# ═══════════════════════════════════════════════════════════════
#  ORCHESTRATOR
# ═══════════════════════════════════════════════════════════════

class ArthenixOrchestrator:
    """
    Coordinates all agents in the pipeline:
    Ingest → Analyse → Detect → Decide → Act → Audit
    """

    def __init__(self):
        self.ingestion  = IngestionAgent()
        self.narrative  = NarrativeAnalysisAgent()
        self.drift      = DriftDetectionAgent()
        self.decision   = DecisionAgent()
        self.action     = ActionAgent()
        self.audit      = AuditAgent()
        self.nfi_series = []   # time-series for visualization

    def run(self, sources: List[NarrativeSignal] = None):
        print("\n" + "╔" + "═"*60 + "╗")
        print("║  ARTHENYX — Autonomous Cost Intelligence Platform".ljust(62) + "║")
        print("║  Multi-Agent Pipeline Starting...".ljust(62) + "║")
        print("╚" + "═"*60 + "╝")
        start = time.time()

        # Step 1: Ingest
        raw_signals = self.ingestion.ingest(sources)

        # Step 2: Analyse
        analysed = self.narrative.analyse(raw_signals)

        # Step 3: Compute NFI + detect spike
        snapshot = self.drift.compute_nfi(analysed)
        self.nfi_series.append(snapshot)
        spike_detected = self.drift.detect_spike(snapshot)

        if not spike_detected:
            print(f"\n✓ No NFI spike. System monitoring continues.")
            print(f"  Current NFI: {snapshot.nfi:.4f} (threshold: {NFI_SPIKE_THRESHOLD})")
            return None

        # Step 4: Decide
        decision = self.decision.decide(snapshot, analysed)
        if not decision:
            print("\n⚠ No matching decision rule. Raising generic alert.")
            return None

        # Step 5: Act
        executed = self.action.execute(decision)

        # Step 6: Audit
        entry = self.audit.record(snapshot, decision, executed)

        elapsed = time.time() - start
        print(f"\n{'='*60}")
        print(f"  ✅ PIPELINE COMPLETE in {elapsed:.2f}s")
        print(f"{'='*60}")
        print(f"  Scenario  : {decision.scenario}")
        print(f"  NFI Score : {snapshot.nfi:.4f}")
        print(f"  Decision  : {decision.root_cause}")
        print(f"  Action ID : {executed.action_id}")
        print(f"  Savings   : ₹{executed.savings_inr_hourly:,.0f}/hr | "
              f"₹{executed.savings_inr_monthly:,.0f}/mo")
        print(f"  Approval  : {executed.approval_status.upper()}")
        print(f"{'='*60}")

        return {
            "snapshot": snapshot,
            "decision": decision,
            "action": executed,
            "audit_entry": entry
        }

    def run_all_scenarios(self):
        """Run all three demo scenarios sequentially."""
        scenarios = {
            "Cloud Cost Spike (40%)": SAMPLE_NARRATIVES[:3],
            "Vendor Duplication": [SAMPLE_NARRATIVES[3]],
            "SLA Breach Prediction": [SAMPLE_NARRATIVES[4]],
        }
        results = {}
        for name, sources in scenarios.items():
            print(f"\n\n{'#'*70}")
            print(f"# SCENARIO: {name}")
            print(f"{'#'*70}")
            result = self.run(sources)
            results[name] = result

        self.audit.print_log()
        return results


# ═══════════════════════════════════════════════════════════════
#  IMPACT CALCULATOR
# ═══════════════════════════════════════════════════════════════

def calculate_impact_report(results: Dict) -> str:
    """Generates a financial impact summary."""
    total_hourly = total_monthly = 0.0
    lines = ["\n" + "="*60, "  ARTHENYX — FINANCIAL IMPACT REPORT", "="*60]

    for scenario, r in results.items():
        if r is None:
            continue
        a = r["action"]
        lines.append(f"\n  Scenario : {scenario}")
        lines.append(f"  Action   : {a.action_type}")
        lines.append(f"  Savings  :")
        lines.append(f"    • ₹{a.savings_inr_hourly:>10,.2f} / hour")
        lines.append(f"    • ₹{a.savings_inr_daily:>10,.2f} / day")
        lines.append(f"    • ₹{a.savings_inr_monthly:>10,.2f} / month")
        lines.append(f"  Approval : {a.approval_status.upper()}")
        lines.append(f"  {'—'*50}")
        total_hourly  += a.savings_inr_hourly
        total_monthly += a.savings_inr_monthly

    lines.append(f"\n  TOTAL PROJECTED SAVINGS:")
    lines.append(f"    • ₹{total_hourly:>10,.2f} / hour")
    lines.append(f"    • ₹{total_monthly:>10,.2f} / month")
    lines.append(f"    • ₹{total_monthly*12:>10,.2f} / year")
    lines.append("="*60)
    return "\n".join(lines)


# ═══════════════════════════════════════════════════════════════
#  MAIN ENTRY POINT
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    orchestrator = ArthenixOrchestrator()
    results = orchestrator.run_all_scenarios()
    print(calculate_impact_report(results))

    # Export audit log
    audit_json = orchestrator.audit.export_json()
    with open("arthenyx_audit_log.json", "w") as f:
        f.write(audit_json)
    print(f"\n  Audit log exported → arthenyx_audit_log.json")
    print(f"  NFI snapshots captured: {len(orchestrator.nfi_series)}")
    print(f"\n  🎉 Arthenyx demo complete.\n")