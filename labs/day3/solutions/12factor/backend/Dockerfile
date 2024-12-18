# Use official Node.js LTS image
FROM node:14

# Set the working directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Expose the port
EXPOSE 3001

# Start the application
CMD [ "npm", "start" ]