from logger import logger
from pathlib import Path


def query_chain(chain, user_input: str):

    try:
        logger.debug(f"Running chain for input: {user_input}")

        result = chain({"query": user_input})

        sources = []

        for doc in result["source_documents"]:
            source_path = doc.metadata.get("source", "")
            page = doc.metadata.get("page", None)

            source = {
                "file": Path(source_path).name if source_path else "Unknown",
                "page": page + 1 if isinstance(page, int) else None
            }

            sources.append(source)

        response = {
            "response": result["result"],
            "sources": sources
        }

        logger.debug(f"Chain response: {response}")

        return response

    except Exception as e:
        logger.exception("Error on query chain")
        raise