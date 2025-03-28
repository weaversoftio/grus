#!/bin/bash
while true; do
    oc delete -f pod.yaml
    oc apply -f pod.yaml
    sleep 30
    oc port-forward --address 0.0.0.0 pod/grus-api 8000:8000
    echo "Restarting in 5 seconds..."
    sleep 30
done
