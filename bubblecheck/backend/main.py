from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="BubbleCheck API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading bias model... please wait ⏳")
bias_model = pipeline(
    "text-classification",
    model="valurank/distilroberta-bias"
)
print("Bias model loaded! ✅")

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini = genai.GenerativeModel("gemini-2.0-flash")
print("Gemini connected! ✅")

class TextInput(BaseModel):
    text: str

def get_bias_score(text: str):
    result = bias_model(text)[0]
    return {
        "label": result["label"],
        "confidence": round(result["score"] * 100, 2)
    }

def get_credibility_score(text: str):
    text_lower = text.lower()

    fear_words = [
        "they don't want you to know", "hidden truth", "wake up",
        "conspiracy", "they are hiding", "poisoning", "deep state",
        "new world order", "they are lying to you"
    ]
    sensational_words = [
        "shocking", "bombshell", "explosive", "unbelievable",
        "mind blowing", "jaw dropping", "you won't believe",
        "insane", "crazy", "wild", "terrifying"
    ]
    manipulation_words = [
    "mainstream media", "fake news", "sheeple", "exposed",
    "urgent", "share before deleted", "banned video",
    "they don't want this shared", "wake up people",
    "hiding", "coverup", "cover up", "suppressed",
    "silenced", "they don't want", "real truth"
    ]
    credibility_boosters = [
        "according to", "research shows", "study finds",
        "published in", "data shows", "statistics show",
        "experts say", "scientists found", "per cent", "percent",
        "survey of", "interviewed", "reported by"
    ]

    fear_found         = [w for w in fear_words if w in text_lower]
    sensational_found  = [w for w in sensational_words if w in text_lower]
    manipulation_found = [w for w in manipulation_words if w in text_lower]
    boosters_found     = [w for w in credibility_boosters if w in text_lower]

    score  = 100
    score -= len(fear_found) * 20
    score -= len(sensational_found) * 12
    score -= len(manipulation_found) * 12
    score += len(boosters_found) * 10
    score  = max(0, min(100, score))

    if score >= 75:
        verdict = "High Credibility"
    elif score >= 50:
        verdict = "Moderate Credibility"
    elif score >= 25:
        verdict = "Low Credibility"
    else:
        verdict = "Very Low Credibility"

    return {
        "score"               : score,
        "verdict"             : verdict,
        "fear_language"       : fear_found,
        "sensational_language": sensational_found,
        "manipulation_tactics": manipulation_found,
        "credibility_boosters": boosters_found,
        "explanation"         : f"Found {len(fear_found)} fear triggers, "
                                f"{len(sensational_found)} sensational words, "
                                f"{len(manipulation_found)} manipulation tactics, "
                                f"{len(boosters_found)} credibility signals."
    }

def get_counter_perspective(text: str):
    try:
        prompt = f"""
        You are a neutral journalist. Analyze this content in under 80 words:
        "{text}"

        1. What perspective does this favor? (1 line)
        2. Brief counter perspective (2 lines)
        3. Suggested sources (1 line)
        """
        response = gemini.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Counter perspective unavailable: {str(e)}"

@app.get("/")
def home():
    return {"message": "BubbleCheck API is running! 🪞"}

@app.post("/analyze")
def analyze_text(input: TextInput):
    text = input.text.strip()

    if len(text) < 10:
        return {"error": "Text too short. Paste a headline or post."}
    if len(text) > 1000:
        return {"error": "Text too long. Keep it under 1000 characters."}

    bias        = get_bias_score(text)
    credibility = get_credibility_score(text)
    counter     = get_counter_perspective(text)

    return {
        "input_text"          : text,
        "bias_analysis"       : bias,
        "credibility"         : credibility,
        "counter_perspective" : counter
    }