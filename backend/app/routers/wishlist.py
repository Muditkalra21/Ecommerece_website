from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from ..core.deps import get_db
from ..core.config import settings
from ..models import WishlistItem, Product
from ..schemas import WishlistItemCreate, WishlistItemOut, WishlistResponse

router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])

DEFAULT_USER_ID = settings.DEFAULT_USER_ID


@router.get("", response_model=WishlistResponse)
def get_wishlist(db: Session = Depends(get_db)):
    items = (
        db.query(WishlistItem)
        .options(joinedload(WishlistItem.product).joinedload(Product.category))
        .filter(WishlistItem.user_id == DEFAULT_USER_ID)
        .order_by(WishlistItem.created_at.desc())
        .all()
    )
    return {"items": items, "total": len(items)}


@router.post("", response_model=WishlistItemOut)
def add_to_wishlist(payload: WishlistItemCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == payload.product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = db.query(WishlistItem).filter(
        WishlistItem.user_id == DEFAULT_USER_ID,
        WishlistItem.product_id == payload.product_id,
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Product already in wishlist")

    item = WishlistItem(user_id=DEFAULT_USER_ID, product_id=payload.product_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    item = db.query(WishlistItem).options(
        joinedload(WishlistItem.product).joinedload(Product.category)
    ).filter(WishlistItem.id == item.id).first()
    return item


@router.delete("/{item_id}")
def remove_from_wishlist(item_id: int, db: Session = Depends(get_db)):
    item = db.query(WishlistItem).filter(
        WishlistItem.id == item_id, WishlistItem.user_id == DEFAULT_USER_ID
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    db.delete(item)
    db.commit()
    return {"message": "Item removed from wishlist"}


@router.delete("/product/{product_id}")
def remove_from_wishlist_by_product(product_id: int, db: Session = Depends(get_db)):
    item = db.query(WishlistItem).filter(
        WishlistItem.product_id == product_id,
        WishlistItem.user_id == DEFAULT_USER_ID,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    db.delete(item)
    db.commit()
    return {"message": "Item removed from wishlist"}
