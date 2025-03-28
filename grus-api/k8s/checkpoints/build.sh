#!/bin/bash
newcontainer=$(buildah from scratch)
buildah add $newcontainer checkpoint-counter.tar /
buildah config --annotation=io.kubernetes.cri-o.annotations.checkpoint.name=spring-music $newcontainer
buildah commit $newcontainer frenzy669/checkpoint-counter:latest
buildah rm $newcontainer
buildah push frenzy669/checkpoint-counter:latest