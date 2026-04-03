from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class DBUser(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String)  # admin, manager, staff
    full_name = Column(String)

class DBCustomer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    status = Column(String, default="active")
    avatar = Column(String, nullable=True)
    first_contact = Column(DateTime, default=datetime.utcnow)

class DBReservation(Base):
    __tablename__ = "reservations"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    subsection = Column(String)
    seat_number = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime, nullable=True)
    duration_months = Column(Integer, default=1)
    amount = Column(Float)
    pay_via = Column(String, default="Cash")
    status = Column(String, default="paid")

class DBBill(Base):
    __tablename__ = "bills"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    amount = Column(Float)
    month_ending = Column(DateTime)
    due_date = Column(DateTime)
    pay_via = Column(String, nullable=True)
    pay_date = Column(DateTime, nullable=True)
    status = Column(String, default="pending")

class DBNotification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    message = Column(String)
    sent_at = Column(DateTime, default=datetime.utcnow)

class DBRole(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    description = Column(String)
    permissions = Column(String) # Comma separated list of permissions

Base.metadata.create_all(bind=engine)
