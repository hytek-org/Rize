FROM node

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application to the container
COPY . .

# Expose the ports used by Expo
EXPOSE 8081

# Start the Expo server
CMD ["npm", "run", "start"]