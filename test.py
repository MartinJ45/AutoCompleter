import os
import openai
from flask import Flask, request, jsonify
import asyncio
from openai import AsyncOpenAI

# Set up Flask app
app = Flask(__name__)

# Initialize OpenAI client
client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

# Route to handle the chat completion
@app.route("/chat", methods=["POST"])
async def chat():
    data = request.json  # Get the data from the incoming POST request
    user_message = data.get("message", "")  # Extract the message

    # Make the async API call to OpenAI
    chat_completion = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": user_message}
        ]
    )

    # Return the response from OpenAI as JSON
    return jsonify({"reply": chat_completion["choices"][0]["message"]["content"]})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
