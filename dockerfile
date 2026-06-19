FROM ubuntu AS base

RUN apt-get update -yq && apt-get upgrade -yq

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN chown -R 1000:985 /app

# install node
RUN apt-get install -yq curl
RUN curl -sL https://deb.nodesource.com/setup_26.x | bash
RUN apt-get install -yq nodejs build-essential python3 python3-pip nano
RUN apt-get install -yq ffmpeg

# install npm
RUN npm install -g npm@latest

# Copy package files
COPY package*.json ./

# Install all dependencies with build optimizations
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --no-audit --no-fund && \
    npm cache clean --force

# Copy source code
COPY --chown=1000:985 . .

# Set optimized environment variables
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=256 --no-warnings" \
    NPM_CONFIG_LOGLEVEL=silent

# Switch to non-root user for security
USER 1000:985

# Expose port
EXPOSE 3737

# Start production server
CMD ["npm", "run", "start:production"]
