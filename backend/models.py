from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    role: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        from_attributes = True

class CustomerBase(BaseModel):
    name: str
    email: str
    phone: str
    status: str = "active"
    avatar: Optional[str] = None

class Customer(CustomerBase):
    id: int
    first_contact: datetime
    class Config:
        from_attributes = True

class ReservationBase(BaseModel):
    customer_id: int
    subsection: str
    seat_number: str
    start_date: datetime
    end_date: Optional[datetime] = None
    duration_months: int = 1
    amount: float
    pay_via: str = "Cash"
    status: str = "paid"

class Reservation(ReservationBase):
    id: int
    class Config:
        from_attributes = True

class BillBase(BaseModel):
    customer_id: int
    amount: float
    month_ending: datetime
    due_date: datetime
    status: str = "pending"

class Bill(BillBase):
    id: int
    class Config:
        from_attributes = True

class RoleBase(BaseModel):
    name: str
    description: str
    permissions: str

class Role(RoleBase):
    id: int
    class Config:
        from_attributes = True

class NotificationBase(BaseModel):
    customer_id: int
    message: str

class Notification(NotificationBase):
    id: int
    sent_at: datetime
    class Config:
        from_attributes = True

class StatusUpdate(BaseModel):
    status: str
