#!/bin/bash

helm upgrade -i --recreate-pods grus .
sleep 5
oc port-forward svc/grus --address 0.0.0.0 8000:8000 3000:80
