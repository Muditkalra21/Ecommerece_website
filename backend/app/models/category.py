from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from ..core.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    icon = Column(String(10), nullable=True)   # emoji icon
    description = Column(Text, nullable=True)

    products = relationship("Product", back_populates="category")
