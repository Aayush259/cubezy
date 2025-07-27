# # Use official Node.js LTS image
# FROM node:18-alpine

# # Set working directory
# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Copy the rest of the application code
# COPY . .

# # Build the Next.js app
# RUN npm run build

# # Expose port 3000
# EXPOSE 3000

# # Start the Next.js app
# CMD ["npm", "start"]

FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npm run build && npm start"]