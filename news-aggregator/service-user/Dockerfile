# השתמש בתמונה בסיסית עבור Node.js
FROM node:18

# קבע את תיקיית העבודה בקונטיינר
WORKDIR /app

# העתק את קבצי package.json ו-package-lock.json
COPY package*.json ./

# התקן את התלויות
RUN npm install

# העתק את שאר הקבצים
COPY . .

# פתח את הפורט
EXPOSE 5000

# הפעל את השרת
CMD ["node", "index.js"]
