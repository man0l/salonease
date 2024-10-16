# Backend Dockerfile
FROM node:18

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install
RUN npm install -g sequelize-cli

# Copy app files
COPY . .

# Install wait-for-it script
ADD https://github.com/vishnubob/wait-for-it/raw/master/wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it

# Expose port
EXPOSE 5000

# Run the application
CMD ["sh", "-c", "wait-for-it db:5432 -- wait-for-it db_test:5432 -- npm start"]
