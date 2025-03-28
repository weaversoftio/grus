#TODO: Implement the analyze_checkpoint_volatility flow 
# extract the checkpoint data from the checkpoint_info_path
# analyze the checkpoint data
# extracting the checkpoint data will require using CRIT
# Save the analysis to a file
# Return status to the client

import tarfile
import tempfile
import os
import shutil
import subprocess
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel
from flows.proccess_utils import run
from flows.analytics.checkpoint_insights import CheckpointInsightsUseCase, CheckpointInsightsRequest
import json
from openai import OpenAI
import time

class VolatilityRequest(BaseModel):
    pod_name: str
    checkpoint_name: str


LINUX_PLUGINS = [
    "linux.pslist.PsList",      # Process listing
    "linux.pstree.PsTree"        # Loaded kernel modules
]


async def analyze_checkpoint_volatility(request: VolatilityRequest):
    """Extract, decode, and analyze a checkpoint using Volatility"""
    checkpoint_name = request.checkpoint_name.split(".")[0]
    checkpoint_path = Path(f"checkpoints/{request.pod_name}/{checkpoint_name}.tar")

    logger = setup_logging()
    logger.info(f"Analyzing checkpoint path: {checkpoint_path}")

    if not checkpoint_path.exists():
        return {"status": "error", "message": "Checkpoint does not exist"}

    # Extract the checkpoint
    extracted_path = await extract_tar_file(checkpoint_path)

    try:
        checkpoint_dir = extracted_path / "checkpoint"
        if not checkpoint_dir.exists():
            checkpoint_dir = extracted_path  # Fallback

        output_file = checkpoint_path.parent / f"{checkpoint_name}_decoded.txt"
        # await inspect_criu_dump(checkpoint_dir, output_file)
        # with open(output_file, "w") as f:
        #     for img_file in Path(checkpoint_dir).rglob("*.img"):
        #         if img_file.stat().st_size > 0:
        #             # if img_file.name in {"pstree.img", "psinfo.img"} or img_file.name.startswith("core"):
        #             try:
        #                 logger.info(f"Decoding with crit: {img_file}")
        #                 cmd = ["crit", "decode", "-i", str(img_file)]
        #                 result = await run(cmd, True, True, True)
        #                 f.write(result.stdout)
        #             except Exception as e:
        #                 f.write(f"\nError decoding {img_file.name}: {str(e)}\n")
                    
                    # if img_file.name.startswith("pages-"):
                        # f.write(f"\n=== Analysis of {img_file.name} ===\n")
                        # for plugin in LINUX_PLUGINS:
                        #     try:
                        #         vol_cmd = ["vol", "-f", str(img_file), plugin]
                        #         vol_result = await run(vol_cmd, True, True, True)
                        #         f.write(f"\n--- Results from {plugin} ---\n")
                        #         f.write(vol_result.stdout)
                        #     except Exception as e:
                        #         f.write(f"\nError analyzing {img_file.name} with {plugin}: {str(e)}\n")

        await CheckpointInsightsUseCase(output_file)
        return {"status": "done", "output_file": str(output_file)}

    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        return {"status": "error", "message": str(e)}

    finally:
        await asyncio.to_thread(shutil.rmtree, extracted_path, ignore_errors=True)


async def extract_tar_file(checkpoint_path: Path) -> Path:
    """Extracts a tar archive to a temporary directory"""
    temp_dir = Path(tempfile.mkdtemp())

    try:
        await asyncio.to_thread(extract_tar, checkpoint_path, temp_dir)
        return temp_dir

    except Exception as e:
        logging.error(f"Failed to extract checkpoint: {str(e)}")
        raise


def extract_tar(checkpoint_path: Path, dest_dir: Path):
    with tarfile.open(checkpoint_path, "r:*") as tar:
        logging.info(f"Extracting {checkpoint_path} to {dest_dir}")
        tar.extractall(path=dest_dir)


def setup_logging():
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
    )
    return logging.getLogger(__name__)


async def checkpoint_volatility_analysis(request: VolatilityRequest):
    """Returns the checkpoint volatility analysis results"""
    checkpoint_name = request.checkpoint_name.split(".")[0]
    analysis_path = Path(f"checkpoints/{request.pod_name}/{checkpoint_name}_volatility_analysis.txt")

    if not analysis_path.exists():
        return {"status": "error", "message": "Analysis file does not exist"}

    return analysis_path.read_text()

async def inspect_criu_dump(dump_dir, output_file, volatility_profile="Linux"):
    """
    Inspect CRIU dump logs, process metadata, and extract memory dumps.
    
    :param dump_dir: Path to the CRIU dump directory.
    :param output_file: File to store the output.
    :param volatility_profile: Profile to use with Volatility (default: Linux).
    """
    try:
        with open(output_file, "w") as f:
            # Show CRIU dump logs
            result = await run(["criu", "show", f"{dump_dir}/dump.log"], True, True, True)
            f.write("Inspecting CRIU dump log...\n")
            f.write(result.stdout)
            
            # Show process tree metadata
            result = await run(["criu", "show", f"{dump_dir}/pstree.img"], True, True, True)
            f.write("Inspecting pstree.img...\n")
            f.write(result.stdout)

            # Extract memory dump analysis
            result = await run(["vol", "-f", f"{dump_dir}/pages-*.img", "--profile", volatility_profile, "check"], True, True, True)
            f.write("Running Volatility analysis...\n")
            f.write(result.stdout)

    except subprocess.CalledProcessError as e:
        with open(output_file, "a") as f:
            f.write(f"Error running command: {e}\n")
    except Exception as e:
        with open(output_file, "a") as f:
            f.write(f"Unexpected error: {e}\n")


async def CheckpointInsightsUseCase(info_path):
    print("Starting checkpoint insights use case")
    # measure the time taken to extract insights
    start_time = time.time()
    # check if the checkpoint exists
    if not os.path.exists(info_path):
        raise Exception("Checkpoint does not exist")

    # Get the OpenAI config details from the secrets folder
    path = f"config/security/secrets/openai-api-key.json"
    #check if the file exists
    if not os.path.exists(path):
        raise Exception("OpenAI API key secret not found")
    
    with open(path, 'r') as file:
        OpenAIsecret = json.load(file)
    # get the openai api key from the secret
    print(OpenAIsecret['api_key']['openai-api-key'])
   
    client = OpenAI(    
    api_key=OpenAIsecret['api_key']['openai-api-key'],
    base_url=os.getenv('OPENAI_API_BASE', 'https://api.openai.com/v1')
    )

    # Create the prompt for OpenAI
    messages = f"""
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

Please provide:
1. Key observations for each category
2. Any anomalies or concerning patterns
3. Performance implications
4. Security considerations
5. Recommendations for container optimization
"""

    # Call OpenAI API
    try:
        # response = client.chat.completions.create(
        #     model="gpt-4o-mini",
        #     messages=messages,
        #     temperature=0.7,
        #     max_tokens=4000,

        # )

        file = client.files.create(
            file=Path(info_path),
            purpose="assistants"  # Other purposes: "fine-tune", "assistants"
        )
        print("Uploaded File ID:", file.id)
        
        my_assistant = client.beta.assistants.create(
            name="CRIU Image Checkpoint Analyzer",
            instructions="You are an expert at analyzing container checkpoint data with focus on processes, memory, files, and network state.",
            tools=[{"type": "retrieval"}],  # Enables document analysis
            model="gpt-4o-mini"
        )
        

        # Create a thread to handle the conversation
        my_thread = client.beta.threads.create()

        my_thread_message = client.beta.threads.messages.create(
            thread_id=my_thread.id,
            role="user",
            content=messages,
            file_ids=[file.id]
        )
        my_run = client.beta.threads.runs.create(
            thread_id=my_thread.id,
            assistant_id=my_assistant.id,
        )

        all_messages = client.beta.threads.messages.list(
            thread_id=my_thread.id
        )
        
        print(f"User: {my_thread_message.content[0].text.value}")
        print(f"Assistant: {all_messages.data[0].content[0].text.value}")
        # insights = response.choices[0].message.content
        
        # Save the insights to a file
        # Use the same name as the checkpoint info file but with .txt extension
        with open(os.path.join(os.path.dirname(info_path), os.path.basename(info_path).replace("_decoded.txt", "_llm.txt")), "w") as file:
            file.write(all_messages.data[0].content[0].text.value)
        print("Saved insights to file successfully")
        print(f"Time taken to extract insights: {time.time() - start_time} seconds")
    except Exception as e:
        raise Exception(f"Error calling OpenAI API: {str(e)}")

    return all_messages.data[0].content[0].text.value