from fastapi import FastAPI

from app.api import router

app = FastAPI(title="Practice AI API", version="0.2.0")
app.include_router(router)
