import asyncio
import shlex

async def run(command, check=True, capture_output=True, text=True):
    print("--------------------------------")
    print(f"Running command: \n")
    # Convert the command array to a shell-quoted string for easy copy-paste
    cmd_str = ' '.join(shlex.quote(str(arg)) for arg in command)
    print(f"{cmd_str}")
    print("--------------------------------")
    
    try:
        process = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE if capture_output else None,
            stderr=asyncio.subprocess.PIPE if capture_output else None
        )
        
        stdout, stderr = await process.communicate()
        
        if check and process.returncode != 0:
            raise RuntimeError(
                f"Command '{' '.join(command)}' failed with error: {stderr.decode() if stderr else ''}"
            )
            
        if text and capture_output:
            stdout = stdout.decode() if stdout else ''
            stderr = stderr.decode() if stderr else ''
            
        return AsyncProcessResult(
            process.returncode,
            stdout,
            stderr,
            cmd_str
        )
        
    except Exception as e:
        raise RuntimeError(f"Command '{' '.join(command)}' failed with error: {str(e)}")

class AsyncProcessResult:
    def __init__(self, returncode, stdout, stderr, args):
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr
        self.args = args