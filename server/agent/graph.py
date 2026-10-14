from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, START, END

from langgraph.prebuilt import ToolNode
from agent.tools import (check_calendar, create_event)
from llm import llm

tools = [
    check_calendar, create_event
]

llm_with_tools = llm.bind_tools(tools)

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]

def call_model(state:AgentState):
    response = llm_with_tools.invoke(state["messages"])

    return {
        "messages": [response]
    }

def should_continue(state:AgentState):
    last_message = state["messages"][-1]

    if last_message.tool_calls:
        return "tools"
    return END

def build_agent():
    graph = StateGraph(AgentState)

    graph.add_node("agent", call_model)
    graph.add_node("tools", ToolNode(tools))

    graph.add_edge(START, "agent")
    graph.add_conditional_edges("agent", should_continue, {"tools":"tools", END:END})

    graph.add_edge("tools", "agent")

    return graph.compile()

assistant_agent = build_agent()