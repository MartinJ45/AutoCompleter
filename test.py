import os
import asyncio
from openai import AsyncOpenAI

client = AsyncOpenAI(
    api_key = os.getenv("OPENAI_API_KEY")
)

async def main():
    chat_completion = await client.chat.completions.create(
        model = "gpt-3.5-turbo",
        messages = [
            {
                "role": "user",
                "content": "Heywows World!"
            }
        ]
    )

asyncio.run(main())
