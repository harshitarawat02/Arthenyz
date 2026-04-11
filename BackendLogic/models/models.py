from dataclasses import dataclass, field
from typing import List, Dict

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
    sentiment_score: float
    uncertainty_terms: List[str]
    risk_terms: List[str]
    timestamp: str

@dataclass
class NFISnapshot:
    timestamp: str
    nfi: float
    components: Dict

@dataclass
class AgentDecision:
    trigger: str
    root_cause: str
    recommended_action: str
    confidence: float
    scenario: str

@dataclass
class ExecutedAction:
    action_id: str
    action_type: str
    description: str
    executed_at: str
    confidence: float
    savings_inr_hourly: float
    savings_inr_monthly: float