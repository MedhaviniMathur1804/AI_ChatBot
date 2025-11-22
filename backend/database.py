from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database setup
DATABASE_URL = "sqlite:///./voicebot.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Database Models
class FAQ(Base):
    __tablename__ = "faqs"
    
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, index=True)
    answer = Column(String)
    keywords = Column(String)  # Comma-separated keywords for matching


class UserAccount(Base):
    __tablename__ = "user_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    account_number = Column(String, unique=True)
    balance = Column(Float, default=0.0)
    email = Column(String)


# Initialize database
def init_db():
    Base.metadata.create_all(bind=engine)
    
    # Create session
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(FAQ).count() == 0:
            # Add sample FAQs
            faqs = [
                FAQ(
                    question="What are your business hours?",
                    answer="We are open Monday to Friday from 9 AM to 6 PM EST.",
                    keywords="hours,time,open,when,business"
                ),
                FAQ(
                    question="How can I contact support?",
                    answer="You can contact our support team via email at support@company.com or call us at 1-800-123-4567.",
                    keywords="contact,support,help,email,phone,reach"
                ),
                FAQ(
                    question="What is your pricing?",
                    answer="Our basic plan starts at $29/month. Premium plans are available at $79/month and Enterprise at $199/month.",
                    keywords="price,pricing,cost,plan,subscription,rate"
                ),
                FAQ(
                    question="How do I reset my password?",
                    answer="You can reset your password by clicking 'Forgot Password' on the login page or visiting our password reset page.",
                    keywords="password,reset,forgot,change,update"
                ),
                FAQ(
                    question="What payment methods do you accept?",
                    answer="We accept all major credit cards, PayPal, and bank transfers.",
                    keywords="payment,pay,method,card,credit,debit"
                ),
            ]
            db.add_all(faqs)
        
        # Check if user accounts exist
        if db.query(UserAccount).count() == 0:
            # Add sample user accounts
            users = [
                UserAccount(
                    username="john_doe",
                    account_number="ACC001",
                    balance=1250.50,
                    email="john@example.com"
                ),
                UserAccount(
                    username="jane_smith",
                    account_number="ACC002",
                    balance=3420.75,
                    email="jane@example.com"
                ),
                UserAccount(
                    username="demo_user",
                    account_number="ACC003",
                    balance=500.00,
                    email="demo@example.com"
                ),
            ]
            db.add_all(users)
        
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error initializing database: {e}")
    finally:
        db.close()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

