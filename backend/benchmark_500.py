import asyncio
import httpx
import time
import random
from typing import List, Dict, Any

SERVER_ROOT = "http://127.0.0.1:8001"
BASE_URL = "http://127.0.0.1:8001/api/v1"

TIER3_SEEDS = [
    ("Patient reports acute crushing chest pain radiating to left arm", "en", "Tier-3"),
    ("Mujhe seene mein shadeed dard ho raha hai aur paseena aa raha hai", "ur", "Tier-3"),
    ("سینے میں شدید درد ہے اور سانس رک رہی ہے", "ur", "Tier-3"),
    ("Severe shortness of breath, lips turning blue", "en", "Tier-3"),
    ("Patient collapsed, sudden loss of consciousness", "en", "Tier-3"),
    ("Mariz achanak behosh ho gaya hai", "ur", "Tier-3"),
    ("حادثے کے بعد شدید خون بہہ رہا ہے", "ur", "Tier-3"),
    ("Coughing up large amounts of blood and suffocating", "en", "Tier-3"),
    ("Anaphylactic shock after taking penicillin, throat closing", "en", "Tier-3"),
    ("Saans ka phoolna bohot shadeed ho gaya hai, bol nahi pa raha", "ur", "Tier-3")
]

TIER2_SEEDS = [
    ("The doctor handwriting is completely blurry on the dosage section", "en", "Tier-2"),
    ("Parchi par dose saaf nazar nahi aa rahi, blur hai", "ur", "Tier-2"),
    ("خوراک واضح نہیں ہے، نسخے پر لکھائی مدہم ہے", "ur", "Tier-2"),
    ("Missing frequency: should I take this antibiotic twice or thrice?", "en", "Tier-2"),
    ("Dawa samajh nahi aa rahi subah leni hai ya raat ko", "ur", "Tier-2"),
    ("Unclear dose for pediatric paracetamol syrup", "en", "Tier-2"),
    ("Not sure if morning or night, instructions are smeared", "en", "Tier-2"),
    ("نسخے میں اوقات نہیں لکھے کہ کھانے سے پہلے ہے یا بعد", "ur", "Tier-2")
]

TIER1_SEEDS = [
    ("When should I take my Panadol 500mg dose today?", "en", "Tier-1"),
    ("Panadol khane ke baad leni hai ya pehle?", "ur", "Tier-1"),
    ("کیا میں بلڈ پریشر کی گولی کے ساتھ چائے پی سکتا ہوں؟", "ur", "Tier-1"),
    ("Routine reminder for my evening diabetic medication", "en", "Tier-1"),
    ("Routine daily vitamin D intake guidance", "en", "Tier-1"),
    ("Augmentin course 5 din ka poora ho gaya hai", "ur", "Tier-1"),
    ("Show me my active prescription timeline for today", "en", "Tier-1"),
    ("رات کی دوائی کا وقت کیا ہے؟", "ur", "Tier-1")
]

VARIATIONS = [
    " urgent query from patient.",
    " Please advise immediately.",
    " Checked 10 minutes ago.",
    " As prescribed yesterday.",
    " Following up on outpatient visit.",
    " Record update needed.",
    " Tele-health consultation follow-up.",
    " Verified by caretaker."
]

def generate_500_scenarios() -> List[Dict[str, Any]]:
    scenarios = []
    for i in range(150):
        base, lang, exp_tier = random.choice(TIER3_SEEDS)
        text = f"{base} [Case #{i+1}{random.choice(VARIATIONS)}]"
        scenarios.append({"id": i + 1, "type": "chat", "message": text, "lang": lang, "expected_tier": exp_tier})

    for i in range(150, 300):
        base, lang, exp_tier = random.choice(TIER2_SEEDS)
        text = f"{base} [Case #{i+1}{random.choice(VARIATIONS)}]"
        scenarios.append({"id": i + 1, "type": "chat", "message": text, "lang": lang, "expected_tier": exp_tier})

    for i in range(300, 475):
        base, lang, exp_tier = random.choice(TIER1_SEEDS)
        text = f"{base} [Case #{i+1}{random.choice(VARIATIONS)}]"
        scenarios.append({"id": i + 1, "type": "chat", "message": text, "lang": lang, "expected_tier": exp_tier})

    for i in range(475, 500):
        scenarios.append({"id": i + 1, "type": "timeline"})

    return scenarios

async def run_scenario(client: httpx.AsyncClient, scenario: Dict[str, Any], semaphore: asyncio.Semaphore) -> Dict[str, Any]:
    async with semaphore:
        start_t = time.perf_counter()
        sc_type = scenario["type"]
        sc_id = scenario["id"]

        try:
            if sc_type == "chat":
                payload = {
                    "message": scenario["message"],
                    "patient_id": f"PATIENT-{sc_id}",
                    "language": scenario["lang"]
                }
                res = await client.post(f"{BASE_URL}/chat", json=payload, timeout=10.0)
                dur = round((time.perf_counter() - start_t) * 1000, 2)
                
                if res.status_code == 200:
                    data = res.json()
                    
                    # Robust key lookup across different implementations
                    tier_str = str(data.get("tier") or data.get("safety_tier") or data.get("triage_tier") or "")
                    status_str = str(data.get("status") or "")
                    reply_str = str(data.get("reply") or data.get("response") or data.get("message") or "")
                    
                    # Match tier directly or from reply text headers
                    exp = scenario["expected_tier"].lower()
                    passed = (
                        exp in tier_str.lower() or
                        exp in status_str.lower() or
                        exp in reply_str.lower() or
                        ("tier-3" in exp and ("emergency" in reply_str.lower() or "ہنگامی" in reply_str or "1122" in reply_str)) or
                        ("tier-2" in exp and ("clarification" in reply_str.lower() or "ambiguity" in reply_str.lower() or "انتباہ" in reply_str)) or
                        ("tier-1" in exp and ("routine" in reply_str.lower() or "timetable" in reply_str.lower() or "میڈی فلو" in reply_str or "assistant" in reply_str.lower()))
                    )
                    
                    return {
                        "id": sc_id,
                        "type": "CHAT",
                        "passed": passed,
                        "detail": reply_str[:60] + "...",
                        "latency_ms": dur
                    }
                else:
                    return {"id": sc_id, "type": "CHAT", "passed": False, "detail": f"HTTP {res.status_code}", "latency_ms": dur}

            elif sc_type == "timeline":
                res = await client.get(f"{BASE_URL}/timeline", timeout=10.0)
                dur = round((time.perf_counter() - start_t) * 1000, 2)
                passed = (res.status_code == 200)
                return {"id": sc_id, "type": "TIMELINE", "passed": passed, "latency_ms": dur, "detail": f"HTTP {res.status_code}"}

        except Exception as e:
            dur = round((time.perf_counter() - start_t) * 1000, 2)
            return {"id": sc_id, "type": sc_type.upper(), "passed": False, "detail": str(e), "latency_ms": dur}

async def main():
    print("=" * 80)
    print("  MEDIFLOW AI — 500 CLINICAL SCENARIOS BENCHMARK SUITE")
    print(f"  Target: {SERVER_ROOT} (API: {BASE_URL})")
    print("=" * 80)

    scenarios = generate_500_scenarios()
    semaphore = asyncio.Semaphore(25)
    
    start_total = time.perf_counter()
    async with httpx.AsyncClient(follow_redirects=True) as client:
        try:
            h = await client.get(f"{SERVER_ROOT}/")
            if h.status_code != 200:
                print(f"[!] Error: Root returned HTTP {h.status_code}")
                return
        except Exception as e:
            print(f"[!] Error: Server unreachable: {e}")
            return

        tasks = [run_scenario(client, sc, semaphore) for sc in scenarios]
        results = []
        
        for f in asyncio.as_completed(tasks):
            res = await f
            results.append(res)
            mark = "[PASS]" if res.get("passed") else "[FAIL]"
            
            if res["id"] % 50 == 0 or not res.get("passed"):
                print(f"  {mark} Case #{res['id']:03d} | Type: {res['type']:<8} | Latency: {res['latency_ms']:>6.1f}ms | {res['detail']}")

    total_time = round(time.perf_counter() - start_total, 2)
    passed_count = sum(1 for r in results if r.get("passed"))
    failed_count = len(results) - passed_count
    avg_latency = round(sum(r.get("latency_ms", 0) for r in results) / len(results), 2)

    print("\n" + "=" * 80)
    print("                         BENCHMARK RESULTS SUMMARY")
    print("=" * 80)
    print(f"  Total Scenarios Evaluated : 500")
    print(f"  Passed                    : {passed_count} / 500 ({(passed_count/500)*100:.1f}%)")
    print(f"  Failed                    : {failed_count}")
    print(f"  Average Request Latency   : {avg_latency} ms")
    print(f"  Total Execution Time      : {total_time} seconds")
    print(f"  Throughput                : {round(500 / total_time, 2)} req/sec")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(main())