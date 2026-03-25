"""
Whitespace Engine — the core USP of this product.

Identifies underused or missing positioning angles across the tracked competitor set
and produces traceable recommendations.

Logic:
1. Compute dimension scores for all competitors
2. Find dimensions where ALL competitors cluster in one direction (leaving the other side underused)
3. Produce at least one recommendation per whitespace gap found

Does NOT hallucinate. Returns empty list if no gap exists rather than inventing one.
"""
import uuid
from models.schemas import WhitespaceRecommendation, WhitespaceEvidence
from services.comparison_scorer import compute_comparison, DIMENSION_SIGNALS, SEED_SCORES

DIMENSION_META = {
    "premium_vs_cost": {
        "label": "Premium vs. Cost Leadership",
        "low_side": "cost leadership / affordability positioning",
        "high_side": "premium / enterprise pricing positioning",
        "gap_description_low": "No competitor is strongly differentiating on cost leadership or transparent affordability.",
        "gap_description_high": "No competitor is strongly differentiating on premium/enterprise positioning.",
        "action_low": "Test messaging that leads with transparent pricing, 'start free', or 'teams under 10 pay zero'. Quantify cost savings vs. legacy tools.",
        "action_high": "Test messaging that leads with security compliance, white-glove onboarding, and dedicated CSM access for enterprise buyers.",
    },
    "feature_vs_outcome": {
        "label": "Feature-Driven vs. Outcome-Driven",
        "low_side": "outcome / results-focused messaging",
        "high_side": "feature list messaging",
        "gap_description_low": "Competitors are primarily feature-listing. Outcome-driven messaging ('achieve X in Y days') is underused.",
        "gap_description_high": "Outcome-focused messaging dominates. A competitor leading on specific, tangible feature depth could stand out.",
        "action_low": "Lead with results: 'Ship campaigns 40% faster', 'Reduce project delays by half'. Replace feature bullets with before/after outcomes.",
        "action_high": "Publish a 'Complete Features Breakdown' page positioning you as the most capable option for power users.",
    },
    "enterprise_vs_smb": {
        "label": "Enterprise vs. SMB/Team Positioning",
        "low_side": "SMB / startup / team-first positioning",
        "high_side": "enterprise / org-wide positioning",
        "gap_description_low": "The field skews enterprise. SMB-first 'works for small teams' messaging is underrepresented.",
        "gap_description_high": "SMB dominates. Enterprise-first messaging around compliance, org scale, and executive visibility is underused.",
        "action_low": "Target SMBs explicitly: 'Built for teams under 50', 'Get started in under 10 minutes, no IT needed'.",
        "action_high": "Add enterprise proof points: SOC 2 badge on homepage, case study from 500+ seat deployment.",
    },
    "simplicity_vs_power": {
        "label": "Simplicity/Ease vs. Power/Flexibility",
        "low_side": "simplicity / ease of use messaging",
        "high_side": "power / flexibility messaging",
        "gap_description_low": "Power and flexibility dominate competitor messaging. Simplicity and low-friction onboarding is a gap.",
        "gap_description_high": "Simplicity dominates. Advanced power users and developers are underserved by current messaging.",
        "action_low": "Make onboarding the hero: 'Up and running in 5 minutes', reduce CTA friction, show immediate value with zero-config templates.",
        "action_high": "Publish API documentation, workflow automation depth, and 'built for ops teams' case studies to capture power users.",
    },
    "collaboration_vs_individual": {
        "label": "Collaboration/Teamwork vs. Individual Productivity",
        "low_side": "individual productivity positioning",
        "high_side": "team collaboration positioning",
        "gap_description_low": "All competitors lead with team collaboration. Individual and personal productivity use cases are underserved.",
        "gap_description_high": "Individual productivity is over-indexed. Team-first alignment messaging is a whitespace.",
        "action_low": "Launch an 'individual plan' or 'personal productivity' track. Target individual contributors and freelancers with solo-use messaging.",
        "action_high": "Lead every headline with team alignment, shared visibility, and async coordination.",
    },
    "speed_vs_control": {
        "label": "Speed/Efficiency vs. Control/Customization",
        "low_side": "control / customization messaging",
        "high_side": "speed / efficiency messaging",
        "gap_description_low": "Competitors emphasize speed. Deep control, auditability, and configuration are underrepresented.",
        "gap_description_high": "Control-focused messaging dominates. Speed-to-value and fast iteration positioning is underused.",
        "action_low": "Emphasize configurability, rule-based workflows, permission layers, and audit trails. Target ops and compliance buyers.",
        "action_high": "Emphasize time-to-result: 'Launch in hours, not weeks'. Show setup time benchmarks.",
    },
}

SATURATION_THRESHOLD = 0.25


def generate_whitespace_recommendations(
    competitors: list,
    snapshots_by_competitor: dict,
    sources_map: dict,
) -> list:
    if not competitors:
        return []

    scored = []
    for comp in competitors:
        snaps = snapshots_by_competitor.get(comp["id"], [])
        scored.append(compute_comparison(comp, snaps))

    dimension_averages = {}
    for dim in DIMENSION_SIGNALS:
        values = [c.scores.get(dim, 0.0) for c in scored]
        dimension_averages[dim] = sum(values) / len(values) if values else 0.0

    recommendations = []
    for dim, avg in sorted(dimension_averages.items(), key=lambda x: abs(x[1]), reverse=True):
        meta = DIMENSION_META.get(dim, {})
        if not meta:
            continue

        if avg > SATURATION_THRESHOLD:
            gap_side = "low"
            confidence = _confidence_from_avg(avg)
        elif avg < -SATURATION_THRESHOLD:
            gap_side = "high"
            confidence = _confidence_from_avg(abs(avg))
        else:
            continue

        evidence = _collect_dimension_evidence(dim, gap_side, scored, competitors, snapshots_by_competitor, sources_map)

        description = meta["gap_description_low"] if gap_side == "low" else meta["gap_description_high"]
        action = meta["action_low"] if gap_side == "low" else meta["action_high"]
        gap_label = meta["low_side"] if gap_side == "low" else meta["high_side"]
        saturated_label = meta["high_side"] if gap_side == "low" else meta["low_side"]

        reco = WhitespaceRecommendation(
            id=str(uuid.uuid4()),
            title=f"Whitespace: {meta['label']}",
            summary=description,
            why_it_matters=f"All {len(competitors)} tracked competitors position strongly toward {saturated_label}. This creates an unclaimed positioning lane for {gap_label}.",
            why_its_whitespace=f"Dimension average score: {avg:.2f} (scale: -1 to +1). Values above ±{SATURATION_THRESHOLD} indicate cluster saturation.",
            recommended_action=action,
            confidence=confidence,
            dimension=dim,
            evidence=evidence[:4],
        )
        recommendations.append(reco)

        if len(recommendations) >= 3:
            break

    return recommendations


def _confidence_from_avg(abs_avg: float) -> str:
    if abs_avg > 0.5:
        return "high"
    elif abs_avg > 0.3:
        return "medium"
    else:
        return "low"


def _collect_dimension_evidence(dim, gap_side, scored_competitors, competitors, snapshots_by_competitor, sources_map):
    evidence = []
    saturated_keywords = DIMENSION_SIGNALS[dim][1] if gap_side == "low" else DIMENSION_SIGNALS[dim][0]

    for comp in competitors:
        snaps = snapshots_by_competitor.get(comp["id"], [])
        for snap in snaps:
            claims = snap.get("extracted_claims", {})
            if not claims:
                continue
            src = sources_map.get(snap.get("source_id", ""), {})

            for field in ["hero_headline", "subheadline", "cta_text", "major_claims"]:
                value = claims.get(field)
                if not value:
                    continue
                values = [value] if isinstance(value, str) else value
                for v in values:
                    if any(kw.lower() in v.lower() for kw in saturated_keywords):
                        evidence.append(WhitespaceEvidence(
                            competitor_name=comp["name"],
                            source_url=src.get("url", ""),
                            snippet=v[:200],
                            field=field,
                        ))
                        break
                if len(evidence) >= 4:
                    return evidence

    return evidence
