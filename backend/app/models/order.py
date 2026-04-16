import enum
from sqlalchemy import Column, Integer, Float, String, Text, ForeignKey, DateTime, Numeric, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class OrderStatus(str, enum.Enum):
    pending   = "pending"
    confirmed = "confirmed"
    shipped   = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class Order(Base):
    __tablename__ = "orders"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    total_amount     = Column(Numeric(10, 2), nullable=False)           # exact decimal
    status           = Column(SAEnum(OrderStatus), default=OrderStatus.confirmed)
    shipping_address = Column(Text, nullable=False)
    payment_method   = Column(String(50), default="Cash on Delivery")
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), onupdate=func.now())

    user  = relationship("User",      back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id         = Column(Integer, primary_key=True, index=True)
    order_id   = Column(Integer, ForeignKey("orders.id"),   nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    quantity   = Column(Integer, nullable=False)
    price      = Column(Numeric(10, 2), nullable=False)  # price snapshot at time of order

    order   = relationship("Order",   back_populates="items")
    product = relationship("Product", back_populates="order_items")
