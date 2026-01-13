from fastapi import FastAPI, APIRouter, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import asyncio
from difflib import SequenceMatcher
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class Product(BaseModel):
    id: str
    title: str
    price: float
    original_price: Optional[float] = None
    image: str
    url: str
    platform: str
    rating: Optional[float] = None
    similarity_score: float = 0.0

class SearchHistory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    query: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    results_count: int

# Mock data generators for each platform
def generate_amazon_products(query: str) -> List[Product]:
    """Generate mock Amazon products"""
    products = []
    base_items = [
        {"title": f"{query} - Premium Quality", "price": random.uniform(500, 2000)},
        {"title": f"Best {query} for Home", "price": random.uniform(800, 3000)},
        {"title": f"{query} Professional Grade", "price": random.uniform(1000, 5000)},
    ]
    
    for item in base_items:
        products.append(Product(
            id=str(uuid.uuid4()),
            title=item["title"],
            price=round(item["price"], 2),
            original_price=round(item["price"] * 1.2, 2),
            image=f"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80",
            url=f"https://amazon.in/product/{uuid.uuid4()}",
            platform="Amazon",
            rating=round(random.uniform(3.5, 5.0), 1)
        ))
    return products

def generate_flipkart_products(query: str) -> List[Product]:
    """Generate mock Flipkart products"""
    products = []
    base_items = [
        {"title": f"{query} Latest Model", "price": random.uniform(600, 2500)},
        {"title": f"{query} Special Edition", "price": random.uniform(700, 2800)},
    ]
    
    for item in base_items:
        products.append(Product(
            id=str(uuid.uuid4()),
            title=item["title"],
            price=round(item["price"], 2),
            original_price=round(item["price"] * 1.15, 2),
            image=f"https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop&q=80",
            url=f"https://flipkart.com/product/{uuid.uuid4()}",
            platform="Flipkart",
            rating=round(random.uniform(3.8, 4.9), 1)
        ))
    return products

def generate_meesho_products(query: str) -> List[Product]:
    """Generate mock Meesho products"""
    products = []
    base_items = [
        {"title": f"{query} Budget Friendly", "price": random.uniform(300, 1200)},
        {"title": f"Affordable {query}", "price": random.uniform(400, 1500)},
    ]
    
    for item in base_items:
        products.append(Product(
            id=str(uuid.uuid4()),
            title=item["title"],
            price=round(item["price"], 2),
            image=f"https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&h=400&fit=crop&q=80",
            url=f"https://meesho.com/product/{uuid.uuid4()}",
            platform="Meesho",
            rating=round(random.uniform(3.5, 4.5), 1)
        ))
    return products

def generate_ajio_products(query: str) -> List[Product]:
    """Generate mock Ajio products"""
    products = []
    base_items = [
        {"title": f"{query} Designer Collection", "price": random.uniform(900, 3500)},
        {"title": f"Trendy {query}", "price": random.uniform(1200, 4000)},
    ]
    
    for item in base_items:
        products.append(Product(
            id=str(uuid.uuid4()),
            title=item["title"],
            price=round(item["price"], 2),
            original_price=round(item["price"] * 1.25, 2),
            image=f"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=80",
            url=f"https://ajio.com/product/{uuid.uuid4()}",
            platform="Ajio",
            rating=round(random.uniform(4.0, 4.8), 1)
        ))
    return products

def generate_jiomart_products(query: str) -> List[Product]:
    """Generate mock JioMart products"""
    products = []
    base_items = [
        {"title": f"{query} Value Pack", "price": random.uniform(500, 2000)},
        {"title": f"{query} Combo Deal", "price": random.uniform(600, 2200)},
    ]
    
    for item in base_items:
        products.append(Product(
            id=str(uuid.uuid4()),
            title=item["title"],
            price=round(item["price"], 2),
            image=f"https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop&q=80",
            url=f"https://jiomart.com/product/{uuid.uuid4()}",
            platform="JioMart",
            rating=round(random.uniform(3.7, 4.6), 1)
        ))
    return products

def calculate_similarity(query: str, title: str) -> float:
    """Calculate similarity score between query and product title"""
    query_lower = query.lower()
    title_lower = title.lower()
    
    # Exact match check
    if query_lower in title_lower:
        return 0.9 + (len(query_lower) / len(title_lower)) * 0.1
    
    # Use SequenceMatcher for fuzzy matching
    return SequenceMatcher(None, query_lower, title_lower).ratio()

async def scrape_all_platforms(query: str) -> List[Product]:
    """Scrape all platforms and return combined results"""
    all_products = []
    
    # Generate products from all platforms
    all_products.extend(generate_amazon_products(query))
    all_products.extend(generate_flipkart_products(query))
    all_products.extend(generate_meesho_products(query))
    all_products.extend(generate_ajio_products(query))
    all_products.extend(generate_jiomart_products(query))
    
    # Calculate similarity scores
    for product in all_products:
        product.similarity_score = calculate_similarity(query, product.title)
    
    # Filter products with similarity > 0.3 and sort by similarity
    filtered_products = [p for p in all_products if p.similarity_score > 0.3]
    filtered_products.sort(key=lambda x: x.similarity_score, reverse=True)
    
    return filtered_products[:15]  # Return top 15 matches

@api_router.get("/")
async def root():
    return {"message": "Smart Price Finder API", "status": "active"}

@api_router.get("/search", response_model=List[Product])
async def search_products(q: str = Query(..., description="Product search query")):
    """Search products across all platforms"""
    if not q or len(q.strip()) < 2:
        return []
    
    # Scrape all platforms
    products = await scrape_all_platforms(q)
    
    # Save search history
    search_history = SearchHistory(
        query=q,
        results_count=len(products)
    )
    doc = search_history.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.search_history.insert_one(doc)
    
    return products

@api_router.get("/history", response_model=List[SearchHistory])
async def get_search_history():
    """Get recent search history"""
    history = await db.search_history.find({}, {"_id": 0}).sort("timestamp", -1).limit(10).to_list(10)
    
    for item in history:
        if isinstance(item['timestamp'], str):
            item['timestamp'] = datetime.fromisoformat(item['timestamp'])
    
    return history

@api_router.get("/stats")
async def get_platform_stats(q: str = Query(...)):
    """Get price statistics for a product across platforms"""
    products = await scrape_all_platforms(q)
    
    platform_stats = {}
    for product in products:
        if product.platform not in platform_stats:
            platform_stats[product.platform] = {
                "platform": product.platform,
                "min_price": product.price,
                "max_price": product.price,
                "avg_price": product.price,
                "count": 1
            }
        else:
            stats = platform_stats[product.platform]
            stats["min_price"] = min(stats["min_price"], product.price)
            stats["max_price"] = max(stats["max_price"], product.price)
            stats["avg_price"] = (stats["avg_price"] * stats["count"] + product.price) / (stats["count"] + 1)
            stats["count"] += 1
    
    return {"stats": list(platform_stats.values()), "total_products": len(products)}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()