# Use a lightweight Nginx image to serve static files
FROM nginx:alpine

# Copy the static files to the Nginx html directory
COPY . /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# The default command starts Nginx automatically
