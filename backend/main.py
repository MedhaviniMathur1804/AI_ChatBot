from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import init_db, get_db, FAQ, UserAccount
import re

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(title="Voice Bot API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class QueryRequest(BaseModel):
    text: str


class QueryResponse(BaseModel):
    response_text: str
    intent: str
    action_taken: str


# Intent Detection Functions
def detect_intent(text: str) -> str:
    """Detect user intent from text using keyword matching"""
    text_lower = text.lower()
    
    # Balance check intent
    if any(word in text_lower for word in ["balance", "account balance", "how much", "money", "funds"]):
        return "check_balance"
    
    # Pricing intent
    if any(word in text_lower for word in ["price", "pricing", "cost", "how much", "plan", "subscription"]):
        return "get_pricing"
    
    # Contact support intent
    if any(word in text_lower for word in ["contact", "support", "help", "speak", "talk", "customer service"]):
        return "contact_support"
    
    # Business hours intent
    if any(word in text_lower for word in ["hours", "open", "when", "time", "available"]):
        return "get_hours"
    
    # Payment methods intent
    if any(word in text_lower for word in ["payment", "pay", "method", "card", "credit", "debit"]):
        return "get_payment_methods"
    
    # Password reset intent
    if any(word in text_lower for word in ["password", "reset", "forgot", "change password"]):
        return "reset_password"
    
    # Default: general query
    return "general_query"


def process_query(text: str, db: Session) -> QueryResponse:
    """Process user query and return appropriate response"""
    intent = detect_intent(text)
    text_lower = text.lower()
    
    # Handle balance check
    if intent == "check_balance":
        # Try to find account by username or use default demo account
        username_match = re.search(r"(?:account|user|username)\s+(\w+)", text_lower)
        if username_match:
            username = username_match.group(1)
            account = db.query(UserAccount).filter(UserAccount.username == username).first()
        else:
            # Default to demo_user
            account = db.query(UserAccount).filter(UserAccount.username == "demo_user").first()
        
        if account:
            return QueryResponse(
                response_text=f"Your account balance for {account.username} (Account: {account.account_number}) is ${account.balance:.2f}.",
                intent=intent,
                action_taken="Retrieved account balance from database"
            )
        else:
            return QueryResponse(
                response_text="I couldn't find your account. Please provide your username or account number.",
                intent=intent,
                action_taken="Account lookup failed"
            )
    
    # Handle pricing query
    elif intent == "get_pricing":
        return QueryResponse(
            response_text="Our basic plan starts at $29 per month. Premium plans are available at $79 per month and Enterprise at $199 per month. Would you like more details about any specific plan?",
            intent=intent,
            action_taken="Retrieved pricing information"
        )
    
    # Handle contact support
    elif intent == "contact_support":
        return QueryResponse(
            response_text="You can contact our support team via email at support@company.com or call us at 1-800-123-4567. Our support hours are Monday to Friday, 9 AM to 6 PM EST.",
            intent=intent,
            action_taken="Provided contact information"
        )
    
    # Handle business hours
    elif intent == "get_hours":
        return QueryResponse(
            response_text="We are open Monday to Friday from 9 AM to 6 PM Eastern Standard Time.",
            intent=intent,
            action_taken="Retrieved business hours"
        )
    
    # Handle payment methods
    elif intent == "get_payment_methods":
        return QueryResponse(
            response_text="We accept all major credit cards, PayPal, and bank transfers.",
            intent=intent,
            action_taken="Retrieved payment methods"
        )
    
    # Handle password reset
    elif intent == "reset_password":
        return QueryResponse(
            response_text="You can reset your password by clicking 'Forgot Password' on the login page or visiting our password reset page. I can send you a reset link if you provide your email address.",
            intent=intent,
            action_taken="Provided password reset instructions"
        )
    
    # Handle general queries - search FAQs
    else:
        # Search FAQs by keywords
        faqs = db.query(FAQ).all()
        best_match = None
        max_matches = 0
        
        for faq in faqs:
            keywords = [kw.strip().lower() for kw in faq.keywords.split(",")]
            matches = sum(1 for kw in keywords if kw in text_lower)
            if matches > max_matches:
                max_matches = matches
                best_match = faq
        
        if best_match and max_matches > 0:
            return QueryResponse(
                response_text=best_match.answer,
                intent=intent,
                action_taken="Matched FAQ from database"
            )
        else:
            return QueryResponse(
                response_text="I'm sorry, I didn't quite understand that. Could you please rephrase your question? I can help you with account balances, pricing, support contact, business hours, payment methods, and password resets.",
                intent=intent,
                action_taken="No match found, provided general help"
            )


# API Endpoints
@app.get("/")
def root():
    return {"message": "Voice Bot API is running", "version": "1.0.0"}


@app.post("/api/process-query", response_model=QueryResponse)
def process_user_query(request: QueryRequest, db: Session = Depends(get_db)):
    """Process user query and return response"""
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Query text cannot be empty")
    
    try:
        response = process_query(request.text, db)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")


@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    """Get basic statistics"""
    faq_count = db.query(FAQ).count()
    user_count = db.query(UserAccount).count()
    return {
        "total_faqs": faq_count,
        "total_users": user_count
    }

