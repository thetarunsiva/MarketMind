"""
Comparison scorer service.
Computes -1 to +1 positioning scores on fixed dimensions from extracted claim keywords.
Logic is deterministic and explainable — keyword signal counting, not ML.
"""
from models.schemas import CompetitorComparison

# Keyword signals for each dimension pole
# Format: { dimension: (negative_keywords, positive_keywords) }
DIMENSION_SIGNALS = {
    "premium_vs_cost": (
        ["free", "affordable", "cheap", "low cost", "save money", "budget", "no credit card"],
        ["enterprise", "premium", "white glove", "dedicated support", "security", "compliance", "soc 2"],
    ),
    "feature_vs_outcome": (
        ["achieve", "results", "outcomes", "grow", "win", "performance", "success", "ROI", "impact"],
        ["features", "tools", "capabilities", "views", "automations", "integrations", "fields", "templates"],
    ),
    "enterprise_vs_smb": (
        ["team", "small business", "startup", "personal", "freelance", "individuals", "smb"],
        ["enterprise", "organization", "compliance", "sso", "soc 2", "admin controls", "audit", "scale"],
    ),
    "simplicity_vs_power": (
        ["simple", "easy", "intuitive", "no code", "drag", "minutes", "onboard"],
        ["powerful", "flexible", "customizable", "advanced", "complex workflows", "full control"],
    ),
    "collaboration_vs_individual": (
        ["personal", "individual", "your work", "focus", "productivity", "alone"],
        ["teams", "collaborate", "together", "cross-functional", "async", "aligned", "shared"],
    ),
    "speed_vs_control": (
        ["control", "custom", "configure", "manage", "admin", "rules", "permissions"],
        ["fast", "quick", "instant", "speed", "momentum", "move fast", "launch"],
    ),
}

# Seeded fallback scores per competitor when no snapshot data is available
SEED_SCORES = {
    "Notion": {
        "premium_vs_cost": 0.1, "feature_vs_outcome": 0.6, "enterprise_vs_smb": -0.2,
        "simplicity_vs_power": 0.5, "collaboration_vs_individual": 0.4, "speed_vs_control": 0.2,
    },
    "ClickUp": {
        "premium_vs_cost": -0.2, "feature_vs_outcome": 0.8, "enterprise_vs_smb": 0.1,
        "simplicity_vs_power": 0.7, "collaboration_vs_individual": 0.6, "speed_vs_control": 0.5,
    },
    "Monday.com": {
        "premium_vs_cost": 0.3, "feature_vs_outcome": -0.3, "enterprise_vs_smb": 0.4,
        "simplicity_vs_power": 0.2, "collaboration_vs_individual": 0.7, "speed_vs_control": 0.4,
    },
    "Airtable": {
        "premium_vs_cost": 0.2, "feature_vs_outcome": 0.4, "enterprise_vs_smb": 0.3,
        "simplicity_vs_power": 0.6, "collaboration_vs_individual": 0.3, "speed_vs_control": -0.1,
    },
    "Asana": {
        "premium_vs_cost": 0.0, "feature_vs_outcome": -0.5, "enterprise_vs_smb": 0.5,
        "simplicity_vs_power": 0.1, "collaboration_vs_individual": 0.8, "speed_vs_control": 0.3,
    },
}

SEED_TAGS = {
    "Notion": ["connected workspace", "docs + wiki", "flexible blocks", "SMB friendly"],
    "ClickUp": ["all-in-one", "feature-rich", "customizable views", "productivity"],
    "Monday.com": ["visual workflows", "team collaboration", "outcome-first", "enterprise"],
    "Airtable": ["no-code database", "flexible structure", "builders", "data-centric"],
    "Asana": ["project clarity", "team alignment", "goal tracking", "work management"],
}

SEED_TOP_CLAIMS = {
    "Notion": ["One workspace for your notes, docs, and projects", "Build your perfect workflow"],
    "ClickUp": ["One app to replace them all", "Every feature your team needs"],
    "Monday.com": ["A platform built for the way your team works", "See progress at a glance"],
    "Airtable": ["Build powerful apps without code", "Connect your data, workflow, and teams"],
    "Asana": ["Great teams are built on clarity", "Make work flow"],
}


def _score_from_claims(claims_list: list) -> dict:
    all_text = []
    for claims in claims_list:
        if not claims:
            continue
        for field in ["hero_headline", "subheadline", "cta_text", "pricing_text"]:
            v = claims.get(field)
            if v:
                all_text.append(v.lower())
        for field in ["feature_bullets", "social_proof", "audience_terms", "major_claims"]:
            for item in claims.get(field, []):
                all_text.append(item.lower())

    combined = " ".join(all_text)
    scores = {}
    for dim, (neg_kws, pos_kws) in DIMENSION_SIGNALS.items():
        pos_count = sum(combined.count(kw.lower()) for kw in pos_kws)
        neg_count = sum(combined.count(kw.lower()) for kw in neg_kws)
        total = pos_count + neg_count
        if total == 0:
            scores[dim] = 0.0
        else:
            scores[dim] = round((pos_count - neg_count) / max(total, 1), 2)
    return scores


def compute_comparison(competitor: dict, snapshots: list) -> CompetitorComparison:
    name = competitor["name"]
    claims_list = [s.get("extracted_claims", {}) for s in snapshots if s.get("extracted_claims")]

    if claims_list:
        scores = _score_from_claims(claims_list)
        seed = SEED_SCORES.get(name, {})
        for dim in DIMENSION_SIGNALS:
            if scores.get(dim) == 0.0 and dim in seed:
                scores[dim] = seed[dim]
    else:
        scores = SEED_SCORES.get(name, {d: 0.0 for d in DIMENSION_SIGNALS})

    top_claims = list(SEED_TOP_CLAIMS.get(name, []))
    if claims_list and claims_list[0].get("hero_headline"):
        headline = claims_list[0]["hero_headline"]
        if headline not in top_claims:
            top_claims = [headline] + top_claims[:1]

    tags = SEED_TAGS.get(name, [])

    return CompetitorComparison(
        id=competitor["id"],
        name=name,
        scores=scores,
        top_claims=top_claims[:3],
        positioning_tags=tags,
    )
