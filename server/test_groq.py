from dotenv import load_dotenv
from groq import Groq
import os

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

print("API key loaded:", bool(api_key))

client = Groq(api_key=api_key)

models = client.models.list()

print("\nAvailable models:\n")

for model in models.data:
    print(model.id)