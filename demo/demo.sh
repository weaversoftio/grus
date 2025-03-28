#!/bin/bash
#Deploy demo app
oc apply -f spring-music-deploy-original.yaml
# upgrade the helm chart
helm upgrade --install grus ../grus-api/k8s/grus-helm-chart

