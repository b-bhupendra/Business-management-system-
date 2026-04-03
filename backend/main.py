from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import database as db
import models as schemas
from datetime import datetime

app = FastAPI(title="Lumina Pro API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# Auth
@app.post("/api/auth/login")
def login(user_data: schemas.UserCreate, db_session: Session = Depends(get_db)):
    # Simple simulated login
    return {
        "user": {
            "email": user_data.email,
            "role": "admin" if "admin" in user_data.email else "staff"
        },
        "token": "demo-token-123"
    }

# Customers
@app.get("/api/customers", response_model=List[schemas.Customer])
def get_customers(db_session: Session = Depends(get_db)):
    return db_session.query(db.DBCustomer).all()

@app.post("/api/customers", response_model=schemas.Customer)
def create_customer(customer: schemas.CustomerBase, db_session: Session = Depends(get_db)):
    db_customer = db.DBCustomer(**customer.dict())
    db_session.add(db_customer)
    db_session.commit()
    db_session.refresh(db_customer)
    return db_customer

@app.post("/api/customers/scan")
def biometric_scan():
    # Simulate a biometric scan
    return {"status": "success", "message": "Biometric verification complete."}

# Reservations
@app.get("/api/reservations")
def get_reservations(db_session: Session = Depends(get_db)):
    results = db_session.query(db.DBReservation, db.DBCustomer.name).join(db.DBCustomer).all()
    return [{**r[0].__dict__, "customer_name": r[1]} for r in results]

@app.post("/api/reservations")
def create_reservation(res: schemas.ReservationBase, db_session: Session = Depends(get_db)):
    db_res = db.DBReservation(**res.dict())
    db_session.add(db_res)
    db_session.commit()
    db_session.refresh(db_res)
    return db_res

@app.patch("/api/reservations/{res_id}/status")
def update_reservation_status(res_id: int, update: schemas.StatusUpdate, db_session: Session = Depends(get_db)):
    db_res = db_session.query(db.DBReservation).filter(db.DBReservation.id == res_id).first()
    if not db_res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    db_res.status = update.status
    db_session.commit()
    return {"status": "updated"}

# Billing
@app.get("/api/billing")
def get_bills(db_session: Session = Depends(get_db)):
    results = db_session.query(db.DBBill, db.DBCustomer.name, db.DBCustomer.phone).join(db.DBCustomer).all()
    return [{**r[0].__dict__, "customer_name": r[1], "customer_phone": r[2]} for r in results]

@app.post("/api/billing")
def create_bill(bill: schemas.BillBase, db_session: Session = Depends(get_db)):
    db_bill = db.DBBill(**bill.dict())
    db_session.add(db_bill)
    db_session.commit()
    db_session.refresh(db_bill)
    return db_bill

@app.patch("/api/billing/{bill_id}/status")
def update_bill_status(bill_id: int, update: schemas.StatusUpdate, db_session: Session = Depends(get_db)):
    db_bill = db_session.query(db.DBBill).filter(db.DBBill.id == bill_id).first()
    if not db_bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    db_bill.status = update.status
    db_session.commit()
    return {"status": "updated"}

# Roles
@app.get("/api/roles", response_model=List[schemas.Role])
def get_roles(db_session: Session = Depends(get_db)):
    return db_session.query(db.DBRole).all()

# Notifications
@app.get("/api/notifications")
def get_notifications(db_session: Session = Depends(get_db)):
    results = db_session.query(db.DBNotification, db.DBCustomer.name).join(db.DBCustomer).all()
    return [{**n[0].__dict__, "customer_name": n[1]} for n in results]

@app.post("/api/notifications")
def create_notification(notif: schemas.NotificationBase, db_session: Session = Depends(get_db)):
    db_notif = db.DBNotification(**notif.dict())
    db_session.add(db_notif)
    db_session.commit()
    db_session.refresh(db_notif)
    return db_notif

# Stats
@app.get("/api/stats")
def get_stats(db_session: Session = Depends(get_db)):
    total_customers = db_session.query(db.DBCustomer).count()
    active_reservations = db_session.query(db.DBReservation).count()
    total_revenue = db_session.query(db.DBBill).filter(db.DBBill.status == 'paid').all()
    revenue_sum = sum(b.amount for b in total_revenue)
    
    return {
        "total_customers": total_customers,
        "active_reservations": active_reservations,
        "total_revenue": revenue_sum,
        "usage_rate": 85 # Mock for now
    }

# Seed Data
@app.post("/api/seed")
def seed_data(db_session: Session = Depends(get_db)):
    # Seed roles if empty
    if not db_session.query(db.DBRole).first():
        roles = [
            {"name": "admin", "description": "Full System Access", "permissions": "all"},
            {"name": "manager", "description": "Department Manager", "permissions": "read,write,notify"},
            {"name": "staff", "description": "Floor Staff", "permissions": "read,write_reservations"}
        ]
        for r in roles:
            db_session.add(db.DBRole(**r))
    
    # Seed a demo customer
    if not db_session.query(db.DBCustomer).first():
        cust = db.DBCustomer(name="Demo User", email="demo@example.com", phone="1234567890")
        db_session.add(cust)
        db_session.commit()
        db_session.refresh(cust)
        
        # Seed a reservation
        res = db.DBReservation(
            customer_id=cust.id, 
            subsection="Main Hall", 
            seat_number="A1", 
            start_date=datetime.now(), 
            end_date=datetime.now(), 
            amount=100.0,
            status="paid"
        )
        db_session.add(res)
        
        # Seed a bill
        bill = db.DBBill(
            customer_id=cust.id,
            amount=100.0,
            month_ending=datetime.now(),
            due_date=datetime.now(),
            status="paid"
        )
        db_session.add(bill)
    
    db_session.commit()
    return {"msg": "Seeded"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
