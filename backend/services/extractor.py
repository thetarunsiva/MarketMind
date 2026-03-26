"""
Source Normalization Pipeline — V2
Extracts structured intelligence from official SaaS pages (homepage, pricing, features).
Filters noise, retains evidence snippets, and produces clean downstream objects.
"""
import re
from bs4 import BeautifulSoup, Tag
from typing import Optional

# ─── Noise filtering ────────────────────────────────────────────────────────

# Common nav/footer/cookie text that pollutes feature bullets
_NOISE_PATTERNS = re.compile(
    r"(cookie|privacy|terms of service|log\s*in|sign\s*in|careers|blog|contact us|"
    r"all rights reserved|©|loading|skip to|accept\b|decline\b|menu|toggle)",
    re.I,
)

# Minimum meaningful text length for bullets/claims
_MIN_BULLET_LEN = 12
_MAX_BULLET_LEN = 200  # Very long bullets are usually paragraphs, not features


def _is_noise(text: str) -> bool:
    """Returns True if text is likely nav, footer, or cookie noise."""
    if len(text) < _MIN_BULLET_LEN or len(text) > _MAX_BULLET_LEN:
        return True
    return bool(_NOISE_PATTERNS.search(text))


def _clean_text(text: str) -> str:
    """Collapse whitespace and strip."""
    return re.sub(r"\s+", " ", text).strip()


# ─── Raw extraction (stage 1) ───────────────────────────────────────────────

def extract_claims_from_html(html: str) -> dict:
    """
    Stage 1: Extracts raw structured messaging, pricing, and claims from
    official page HTML. Optimized for SaaS landing, pricing, and feature pages.
    Returns raw ExtractedClaims dict.
    """
    if not html:
        return {
            "hero_headline": None, "subheadline": None, "cta_text": None,
            "cta_secondary": None, "pricing_text": None, "pricing_tiers": [],
            "feature_bullets": [], "social_proof": [], "audience_terms": [],
            "major_claims": [], "meta_description": None,
        }

    soup = BeautifulSoup(html, "lxml")

    # Remove noisy elements before extraction
    for tag in soup.find_all(["nav", "footer", "header", "script", "style", "noscript", "iframe"]):
        tag.decompose()

    text_content = soup.get_text(" ", strip=True).lower()

    # ── Hero headline (first H1) ──
    h1 = soup.find("h1")
    hero_headline = _clean_text(h1.get_text(strip=True)) if h1 else None

    # ── Subheadline (first p after H1, or first p > 20 chars) ──
    subheadline = None
    if h1:
        p = h1.find_next_sibling("p")
        if p and len(p.get_text(strip=True)) > 15:
            subheadline = _clean_text(p.get_text(strip=True))
    if not subheadline:
        for p_tag in soup.find_all("p"):
            t = _clean_text(p_tag.get_text(strip=True))
            if len(t) > 20 and not _is_noise(t):
                subheadline = t
                break

    # ── CTA extraction (primary + secondary) ──
    cta_text = None
    cta_secondary = None
    cta_candidates = soup.find_all(
        ["a", "button"],
        class_=re.compile(r"btn|button|cta|primary|hero|action", re.I),
    )
    # Also check role="button" and data-cta
    cta_candidates += soup.find_all(attrs={"role": "button"})
    seen_ctas = set()
    for el in cta_candidates:
        t = _clean_text(el.get_text(strip=True))
        if t and len(t) > 2 and len(t) < 60 and t.lower() not in seen_ctas and not _is_noise(t):
            seen_ctas.add(t.lower())
            if not cta_text:
                cta_text = t
            elif not cta_secondary:
                cta_secondary = t

    # ── Pricing tiers (structured) ──
    pricing_text = None
    pricing_tiers: list[str] = []
    # Look for explicit price strings
    price_pattern = re.compile(
        r"\$\d+(?:\.\d{2})?(?:\s*/\s*(?:mo|month|year|yr|user|seat))?"
        r"|free\s*(?:plan|tier|forever)?"
        r"|custom\s*(?:pricing|plan)?"
        r"|contact\s*(?:us|sales)?(?:\s*for\s*pricing)?",
        re.I,
    )
    price_tags = soup.find_all(string=price_pattern)
    for pt in price_tags[:6]:
        raw = _clean_text(str(pt))
        if raw and len(raw) > 3:
            pricing_tiers.append(raw)
    if pricing_tiers:
        pricing_text = pricing_tiers[0]

    # ── Feature bullets (noise-filtered) ──
    raw_lis = soup.find_all("li")
    feature_bullets = []
    for li in raw_lis:
        t = _clean_text(li.get_text(strip=True))
        if not _is_noise(t):
            feature_bullets.append(t)
        if len(feature_bullets) >= 10:
            break

    # ── Social proof / trust signals ──
    social_proof: list[str] = []
    trust_pattern = re.compile(
        r"\b\d+[KMkm]\+?\b|million|billion|\d+,\d{3}|"
        r"\d+%\s*(?:faster|better|more|increase|growth)|"
        r"trusted\s*by|used\s*by|loved\s*by|"
        r"Fortune\s*\d+|Forbes|Gartner|G2|SOC\s*2|ISO\s*\d+",
        re.I,
    )
    social_tags = soup.find_all(string=trust_pattern)
    seen_social = set()
    for st in social_tags:
        t = _clean_text(str(st))
        if len(t) > 5 and t.lower() not in seen_social and not _is_noise(t):
            seen_social.add(t.lower())
            social_proof.append(t)
        if len(social_proof) >= 5:
            break

    # ── Audience / segment keywords ──
    audience_kws = [
        "teams", "enterprise", "startups", "individuals", "developers",
        "agencies", "small business", "mid-market", "smb", "freelancers",
        "product managers", "designers", "marketers", "remote teams",
    ]
    found_audience = [kw for kw in audience_kws if kw in text_content]

    # ── Major claims / differentiation pillars (H2s, H3s) ──
    major_claims = []
    for tag_name in ["h2", "h3"]:
        for h in soup.find_all(tag_name):
            t = _clean_text(h.get_text(strip=True))
            if len(t) > 10 and not _is_noise(t):
                major_claims.append(t)
            if len(major_claims) >= 6:
                break
        if len(major_claims) >= 6:
            break

    # ── Meta description ──
    meta_desc = None
    meta_tag = soup.find("meta", attrs={"name": "description"})
    if meta_tag and isinstance(meta_tag, Tag):
        meta_desc = meta_tag.get("content")
        if isinstance(meta_desc, list):
            meta_desc = meta_desc[0] if meta_desc else None

    return {
        "hero_headline": hero_headline,
        "subheadline": subheadline,
        "cta_text": cta_text,
        "cta_secondary": cta_secondary,
        "pricing_text": pricing_text,
        "pricing_tiers": pricing_tiers,
        "feature_bullets": feature_bullets,
        "social_proof": social_proof,
        "audience_terms": found_audience,
        "major_claims": major_claims,
        "meta_description": meta_desc,
    }


# ─── Normalization (stage 2) ────────────────────────────────────────────────

def normalize_claims(claims: dict, competitor_id: str, competitor_name: str) -> dict:
    """
    Stage 2: Converts raw ExtractedClaims into structured business intelligence.
    Returns a NormalizedIntel dict ready for recommendation and comparison engines.
    """
    hero = claims.get("hero_headline") or ""
    sub = claims.get("subheadline") or ""
    cta = claims.get("cta_text") or ""
    cta2 = claims.get("cta_secondary") or ""
    pricing = claims.get("pricing_text") or ""
    tiers = claims.get("pricing_tiers") or []
    bullets = claims.get("feature_bullets") or []
    audience = claims.get("audience_terms") or []
    social = claims.get("social_proof") or []
    h2s = claims.get("major_claims") or []
    meta = claims.get("meta_description") or ""

    # ── Pricing posture ──
    pricing_posture = _classify_pricing(pricing, tiers)

    # ── Target segment ──
    target_segment = _classify_segment(audience)

    # ── Value proposition (hero + sub + meta fallback) ──
    vp_parts = [p for p in [hero, sub] if p]
    value_proposition = ". ".join(vp_parts) if vp_parts else (meta or None)

    # ── CTA strategy ──
    cta_strategy = _classify_cta(cta)
    cta_secondary_strategy = _classify_cta(cta2) if cta2 else None

    # ── Feature themes (top noise-filtered bullets) ──
    feature_themes = bullets[:6]

    # ── Trust signals (social proof, cleaned) ──
    trust_signals = social[:5]

    # ── Differentiation phrases (H2/H3 claims, cleaned) ──
    differentiation_phrases = h2s[:5]

    # ── Evidence snippets (for recommendation traceability) ──
    evidence_snippets = _build_evidence_snippets(
        competitor_name, hero, sub, cta, pricing, tiers, bullets, social, h2s, meta
    )

    return {
        "competitor_id": competitor_id,
        "competitor_name": competitor_name,
        "pricing_posture": pricing_posture,
        "pricing_tiers_raw": tiers[:4],
        "target_segment": target_segment,
        "value_proposition": value_proposition,
        "cta_strategy": cta_strategy,
        "cta_secondary_strategy": cta_secondary_strategy,
        "cta_raw": cta,
        "feature_themes": feature_themes,
        "trust_signals": trust_signals,
        "differentiation_phrases": differentiation_phrases,
        "evidence_snippets": evidence_snippets,
        "meta_description": meta or None,
    }


# ─── Classification helpers ─────────────────────────────────────────────────

def _classify_pricing(pricing: str, tiers: list[str]) -> str:
    """Classifies pricing posture from raw pricing text and tier strings."""
    combined = (pricing + " " + " ".join(tiers)).lower()
    if not combined.strip():
        return "unknown"
    if "contact" in combined or "custom" in combined or "talk to sales" in combined:
        return "enterprise"
    if "free" in combined and "$" in combined:
        return "freemium"
    if "free" in combined:
        return "free"
    if "$" in combined:
        return "transparent"
    return "unknown"


def _classify_segment(audience: list[str]) -> str:
    """Determines the primary target segment from audience keywords."""
    priority = [
        ("enterprise", "enterprise"), ("mid-market", "mid_market"),
        ("startups", "startup"), ("smb", "smb"), ("small business", "smb"),
        ("teams", "team"), ("remote teams", "remote_team"),
        ("developers", "developer"), ("designers", "designer"),
        ("product managers", "product_manager"), ("marketers", "marketer"),
        ("agencies", "agency"), ("freelancers", "freelancer"),
        ("individuals", "individual"),
    ]
    for kw, seg in priority:
        if kw in audience:
            return seg
    return "general"


def _classify_cta(cta: str) -> str:
    """Classifies CTA strategy from button/link text."""
    if not cta:
        return "none"
    c = cta.lower()
    if any(w in c for w in ["free trial", "try free", "try for free", "start free"]):
        return "free_trial"
    if any(w in c for w in ["free", "try"]):
        return "free_trial"
    if any(w in c for w in ["demo", "talk to", "contact", "book a", "schedule"]):
        return "sales_led"
    if any(w in c for w in ["sign up", "get started", "start now", "create"]):
        return "self_serve"
    if any(w in c for w in ["download", "install"]):
        return "download"
    return "other"


def _build_evidence_snippets(
    competitor_name: str,
    hero: str, sub: str, cta: str, pricing: str,
    tiers: list[str], bullets: list[str], social: list[str],
    claims: list[str], meta: str,
) -> list[dict]:
    """
    Builds traceable evidence snippets for downstream recommendation engines.
    Each snippet has: field, snippet text, and source label.
    """
    items: list[dict] = []

    if hero:
        items.append({
            "field": "hero_headline",
            "snippet": hero,
            "source_label": f"{competitor_name} homepage — H1",
        })
    if sub:
        items.append({
            "field": "subheadline",
            "snippet": sub,
            "source_label": f"{competitor_name} homepage — subheadline",
        })
    if cta:
        items.append({
            "field": "cta_text",
            "snippet": cta,
            "source_label": f"{competitor_name} homepage — primary CTA",
        })
    if pricing:
        items.append({
            "field": "pricing_text",
            "snippet": pricing,
            "source_label": f"{competitor_name} pricing page",
        })
    for i, tier in enumerate(tiers[:3]):
        items.append({
            "field": "pricing_tier",
            "snippet": tier,
            "source_label": f"{competitor_name} pricing — tier {i + 1}",
        })
    for bullet in bullets[:3]:
        items.append({
            "field": "feature_bullet",
            "snippet": bullet,
            "source_label": f"{competitor_name} features list",
        })
    for sp in social[:2]:
        items.append({
            "field": "social_proof",
            "snippet": sp,
            "source_label": f"{competitor_name} homepage — trust signal",
        })
    for claim in claims[:2]:
        items.append({
            "field": "differentiation_claim",
            "snippet": claim,
            "source_label": f"{competitor_name} homepage — H2/H3 pillar",
        })
    if meta:
        items.append({
            "field": "meta_description",
            "snippet": meta,
            "source_label": f"{competitor_name} page — meta description",
        })

    return items
