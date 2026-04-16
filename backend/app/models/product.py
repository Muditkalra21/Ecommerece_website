from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class Product(Base):
    __tablename__ = "products"

    id               = Column(Integer, primary_key=True, index=True)
    name             = Column(String(300), nullable=False)
    description      = Column(Text, nullable=True)
    price            = Column(Numeric(10, 2), nullable=False)           # exact decimal, no float rounding
    original_price   = Column(Numeric(10, 2), nullable=True)
    discount_percent = Column(Integer, default=0)
    stock            = Column(Integer, default=0)
    brand            = Column(String(100), nullable=True)
    rating           = Column(Float, default=0.0)                       # Float fine for display rating
    rating_count     = Column(Integer, default=0)
    image_url        = Column(Text, nullable=True)
    images           = Column(Text, nullable=True)                      # JSON string of image URLs
    specifications   = Column(Text, nullable=True)                      # JSON string
    is_active        = Column(Boolean, default=True)
    category_id      = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())

    category       = relationship("Category",      back_populates="products")
    cart_items     = relationship("CartItem",       back_populates="product")
    order_items    = relationship("OrderItem",      back_populates="product")
    wishlist_items = relationship("WishlistItem",   back_populates="product")
