#Personalized News Update Aggregator
## **Overview**
The Personalized News Update Aggregator is a microservice-based system designed to deliver personalized news and technology updates to users. Users can set preferences for news categories, and the system will fetch, summarize, and deliver the most relevant news via email.

## **System Architecture**
-**service-user**: Manages user profiles and preferences.
-**service-news**: Fetches news articles based on user preferences.
-**service-notification**: Sends news updates via email.

## **Technologies Used**

- **Backend**: Node.js  
- **Frontend (Optional)**: React  
- **Database**: MongoDB  
- **Message Queue**: RabbitMQ  
- **Containerization**: Docker, Docker Compose  
- **Service Communication**: Dapr  
- **APIs**: NewsData.io.  

## **Setup and Installation**

### **Prerequisites**
1. Install **Docker** and **Docker Compose**.
2. Install **Node.js** and **npm**.
3. Clone this repository:  
   ```bash
   git clone https://github.com/chanicoh/zionet-finalProject
   ```
   
4. Navigate to the project directory:
   ```bash
   cd news-aggregator
   ```
5. Start the application using Docker Compose:
   ```bash
   docker-compose up --build
   
   ```


