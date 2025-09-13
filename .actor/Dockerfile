# ~~~ Stage 1: Build the application ~~~
# Use a specific version for reproducibility and name the stage 'builder'.
FROM apify/actor-node:20 AS builder

# Set the working directory.
WORKDIR /usr/src/app

# Copy package manifests. This layer is cached as long as these files don't change.
COPY package*.json pnpm-lock.yaml ./

# Install pnpm and all dependencies (including devDependencies needed for build).
# Using --frozen-lockfile is faster and ensures an exact install from the lock file.
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy the rest of the source code.
# This is done *after* installing dependencies, so code changes don't invalidate the dependency cache.
COPY . .

# Run the build script to generate the distributable files (e.g., in the /dist folder).
RUN pnpm run build

# ~~~ Stage 2: Create the final, lean production image ~~~
# Start from the same clean base image.
FROM apify/actor-node:20

# The apify/actor-node image sets the user and WORKDIR to /home/apify by default.
# We will work within that established environment.
WORKDIR /home/apify

# Copy package manifests again to install production dependencies.
COPY package*.json pnpm-lock.yaml ./

# Install pnpm and ONLY production dependencies.
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# Copy the built application files from the 'builder' stage.
# This is the key step: we only bring over the compiled code, not the source.
COPY --from=builder /usr/src/app/dist ./dist

# The base image already creates and sets the 'apify' user.
RUN adduser -h /home/apify -D apify && \
    chown -R apify:apify ./

USER apify 

# Run the image.
CMD npm run start:prod --silent
