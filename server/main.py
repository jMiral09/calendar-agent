from fastapi import FastAPI  # pyright: ignore[reportMissingImports]
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from agent.graph import assistant_agent

app= FastAPI(
    title = "AI Calendar Assistant"
)

class ChatRequest(BaseModel):
    message:str

class ChatResponse(BaseModel):
    reply:str

@app.post("/chat", response_model=ChatResponse)
async def chat(request:ChatRequest):
    result = assistant_agent.invoke({
        "messages": [
            HumanMessage(
                content=request.message
            )
        ]
    })

    final_message = result["messages"][-1]

    return ChatResponse(reply=final_message.content)