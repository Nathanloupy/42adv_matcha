from fastapi import FastAPI

app: object = FastAPI()

@app.get("/")
async def root():
	return {"message": "Hello World"}
