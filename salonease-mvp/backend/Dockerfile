# Backend Dockerfile
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install -g sequelize-cli nodemon

# Copy app files
COPY . .

# Expose port
EXPOSE 5000

# Run the application with nodemon instead of npm start
CMD ["nodemon", "src/server.js"]
