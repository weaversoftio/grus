from pydantic import BaseModel
import json
# checkpoint insights use case , here we will use LLM to analyze the checkpoint and provide insights
import os
from typing import Optional
from openai import OpenAI
import time
class CheckpointInsightsRequest(BaseModel):
    openai_api_key_secret_name: str
    checkpoint_info_path: str
    model: Optional[str] = "gpt-4o-mini"  # Allow model selection with a default

class CheckpointInsightsResponse(BaseModel):
    insights: str

# Use case for checkpoint insights
async def CheckpointInsightsUseCase(request: CheckpointInsightsRequest) -> CheckpointInsightsResponse:
    print("Starting checkpoint insights use case")
    # measure the time taken to extract insights
    start_time = time.time()
    # check if the checkpoint exists
    if not os.path.exists(request.checkpoint_info_path):
        raise Exception("Checkpoint does not exist")

    # Get the OpenAI config details from the secrets folder
    path = f"config/security/secrets/{request.openai_api_key_secret_name}.json"
    #check if the file exists
    if not os.path.exists(path):
        raise Exception("OpenAI API key secret not found")
    
    with open(path, 'r') as file:
        OpenAIsecret = json.load(file)
    # get the openai api key from the secret
    client = OpenAI(    
    api_key=OpenAIsecret.get("api-key").get("openai-api-key"),
    base_url=os.getenv('OPENAI_API_BASE', 'https://api.openai.com/v1')
    )

    with open(request.checkpoint_info_path, 'r') as file:
        json_data = json.load(file)
            
    # Create the prompt for OpenAI
    messages = [
        {"role": "system", "content": "You are an expert at analyzing container checkpoint data with focus on processes, memory, files, and network state."},
        {"role": "user", "content": f"""
Analyze the following container checkpoint data and extract key insights focusing on:

1. Process State:
   - Running processes and their hierarchy
   - Process memory mappings
   - Any suspicious memory patterns

2. File System State:
   - Open files and their states
   - Mount points
   - File caching information

3. Network State:
   - Socket statistics
   - Network filtering rules
   - Network connections

4. System Environment:
   - Environment variables
   - System configuration
   - Runtime state

Checkpoint Data:
{json.dumps(json_data, indent=2)}

Please provide:
1. Key observations for each category
2. Any anomalies or concerning patterns
3. Performance implications
4. Security considerations
5. Recommendations for container optimization
"""}
    ]

    # Call OpenAI API
    try:
        response = client.chat.completions.create(
            model=request.model,
            messages=messages,
            temperature=0.7,
            max_tokens=4000
        )
        insights = response.choices[0].message.content
        
        # Save the insights to a file
        # Use the same name as the checkpoint info file but with .txt extension
        with open(os.path.join(os.path.dirname(request.checkpoint_info_path), os.path.basename(request.checkpoint_info_path).replace(".json", ".txt")), "w") as file:
            file.write(insights)
        print("Saved insights to file successfully")
        print(f"Time taken to extract insights: {time.time() - start_time} seconds")
    except Exception as e:
        raise Exception(f"Error calling OpenAI API: {str(e)}")

    return CheckpointInsightsResponse(insights=insights)