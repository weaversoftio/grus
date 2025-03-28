FROM polinux/stress as base

FROM frenzy669/spring-music:base
# Download and install stress binary
COPY --from=base /usr/local/bin/stress /usr/bin/stress
CMD ["/bin/sh", "-c", "sh"]   
