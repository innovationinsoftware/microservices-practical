# Use official Node.js LTS image
FROM node:18

# Set the working directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Expose the port
EXPOSE 3000

# Create and use a non-root user
RUN useradd -ms /bin/bash appuser
USER appuser

# Start the application
CMD [ "npm", "start" ]
