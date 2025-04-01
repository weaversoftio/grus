import subprocess
import json

def fetch_k8s_nodes():
    """
    Executes 'oc get nodes' to retrieve node information, processes the output,
    and returns it in Ansible inventory format, including IP addresses and hostnames.
    """
    try:
        # Execute the 'oc get nodes' command to retrieve node information in JSON format
        result = subprocess.run(
            ['oc', 'get', 'nodes', '-o', 'json'],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        # Parse the JSON output
        nodes_data = json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        # Handle errors in the subprocess
        print(f"An error occurred while executing 'oc get nodes': {e}")
        if e.stderr:
            print(f"Error details: {e.stderr}")
        return
    except json.JSONDecodeError:
        # Handle JSON parsing errors
        print("Error parsing the JSON output from 'oc get nodes'.")
        return

    # Initialize the inventory structure
    inventory = {
        "nodes": {
            "hosts": {}
        }
    }

    # Populate the inventory with node information
    for node in nodes_data.get('items', []):
        node_name = node['metadata']['name']
        # Extract node IP addresses
        node_ips = [address['address'] for address in node.get('status', {}).get('addresses', [])
                    if address.get('type') == 'InternalIP']
        # Use the first IP address as the host key
        if node_ips:
            host_key = node_ips[0]
            inventory['nodes']['hosts'][host_key] = {
                "ansible_user": "core",  # Adjust based on your specific user
                "hostname": node_name,
                "ip": node_ips[0]
            }

    # Optionally, print the inventory
    print(json.dumps(inventory, indent=4))

    # Save the inventory to a file
    with open('ansible_inventory.json', 'w') as file:
        json.dump(inventory, file, indent=4)

# Example usage
fetch_k8s_nodes()

