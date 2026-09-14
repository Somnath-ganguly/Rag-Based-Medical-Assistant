
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

GROQ_API_KEY=os.getenv("GROQ_API_KEY")

client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

response = client.responses.create(
    input="What is the name of chief minister of west bengal in india",
    model="openai/gpt-oss-20b",
)
print(response.output_text)
