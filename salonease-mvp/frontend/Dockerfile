# Build stage
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Declare build arguments
ARG REACT_APP_API_URL
ARG REACT_APP_BACKEND_PORT
ARG REACT_APP_STRIPE_BOOKING_PRICE_ID
ARG REACT_APP_STRIPE_BASE_PRICE_ID
ARG REACT_APP_STRIPE_PUBLISHABLE_KEY
ARG REACT_APP_MAILERLITE_API_KEY

# Set environment variables from build args
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_BACKEND_PORT=$REACT_APP_BACKEND_PORT
ENV REACT_APP_STRIPE_BOOKING_PRICE_ID=$REACT_APP_STRIPE_BOOKING_PRICE_ID
ENV REACT_APP_STRIPE_BASE_PRICE_ID=$REACT_APP_STRIPE_BASE_PRICE_ID
ENV REACT_APP_STRIPE_PUBLISHABLE_KEY=$REACT_APP_STRIPE_PUBLISHABLE_KEY
ENV REACT_APP_MAILERLITE_API_KEY=$REACT_APP_MAILERLITE_API_KEY

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration if you have any custom config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
