# 🚀 eBay Helper - Intelligent Marketplace Assistant

[![Google Apartiv Hackathon](https://img.shields.io/badge/Google-Apartiv_Hackathon-4285F4?style=for-the-badge&logo=google)](https://apartiv.com)
[![Neo4j](https://img.shields.io/badge/Neo4j-4.4+-018bff?style=for-the-badge&logo=neo4j)](https://neo4j.com)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![AI Powered](https://img.shields.io/badge/AI-Local_Model-00D4AA?style=for-the-badge&logo=tensorflow)](https://tensorflow.org)

> 🏆 **Built for Google Apartiv & Neo4j Hackathon** - Revolutionizing online marketplace experiences with intelligent graph databases and local AI detection.

## 🌟 Overview

eBay Helper leverages cutting-edge graph database technology and local AI models to provide intelligent insights, fraud detection, and enhanced user experiences for online marketplace interactions. Our solution combines the power of Neo4j's graph capabilities with Firebase's real-time features and on-device AI processing.

## ✨ Key Features

- 🧠 **Local AI Detection** - Privacy-first fraud and anomaly detection using on-device models
- 🕸️ **Graph Intelligence** - Neo4j-powered relationship mapping between users, products, and transactions
- ⚡ **Real-time Analytics** - Firebase integration for live data synchronization
- 🔍 **Smart Recommendations** - Graph-based product and seller suggestions
- 🛡️ **Trust Scoring** - Dynamic trust metrics based on transaction history graphs
- 📊 **Market Insights** - Price trend analysis and market behavior patterns

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Graph Database** | Neo4j 4.4+ |
| **Backend Services** | Firebase (Firestore, Functions, Auth) |
| **AI/ML** | Local TensorFlow Lite Model |
| **Frontend** | React/Next.js |
| **APIs** | eBay API, Custom REST APIs |
| **Deployment** | Google Cloud Platform |

## 🚀 Quick Start

### Prerequisites

```bash
# Install dependencies
npm install

# Set up Neo4j (Docker)
docker run -d \
  --name neo4j-ebay \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:latest
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore, Authentication, and Functions
3. Add your config to `firebase-config.js`

### Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Add your credentials
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
FIREBASE_PROJECT_ID=your-project-id
EBAY_API_KEY=your-ebay-api-key
```

### Run the Application

```bash
# Start development server
npm run dev

# Initialize Neo4j schema
npm run neo4j:init

# Deploy Firebase functions
npm run firebase:deploy
```

## 🧪 Local AI Model

Our privacy-first approach uses TensorFlow Lite models for:

- **Fraud Detection**: Identifies suspicious listing patterns
- **Price Anomaly Detection**: Flags unusual pricing behaviors  
- **Image Recognition**: Validates product authenticity
- **Sentiment Analysis**: Analyzes review and feedback sentiment

```javascript
// Example: Loading local AI model
import * as tf from '@tensorflow/tfjs';

const model = await tf.loadLayersModel('/models/fraud-detection.json');
const prediction = model.predict(inputTensor);
```

## 📈 Graph Schema

```cypher
// Sample Neo4j relationships
CREATE (u:User {id: 'user123', trustScore: 0.95})
CREATE (p:Product {id: 'item456', category: 'electronics'})
CREATE (t:Transaction {id: 'txn789', amount: 299.99, timestamp: datetime()})

CREATE (u)-[:SELLS]->(p)
CREATE (u)-[:PARTICIPATES_IN]->(t)
CREATE (t)-[:INVOLVES]->(p)
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   React App     │    │   Firebase   │    │     Neo4j       │
│                 │◄──►│   Firestore  │◄──►│  Graph Engine   │
│  Local AI Model │    │   Functions  │    │                 │
└─────────────────┘    └──────────────┘    └─────────────────┘
         │                       │                    │
         └───────────────────────┼────────────────────┘
                                 │
                      ┌──────────▼──────────┐
                      │    eBay API         │
                      │   Integration       │
                      └─────────────────────┘
```

## 🎯 Hackathon Goals

- [x] **Neo4j Integration** - Graph-based user and product relationships
- [x] **Firebase Real-time** - Live data synchronization
- [x] **Local AI Processing** - Privacy-preserving fraud detection
- [x] **eBay API Integration** - Real marketplace data
- [ ] **Advanced Analytics Dashboard**
- [ ] **Mobile App Companion**

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Team

Built with ❤️ for the Google Apartiv & Neo4j Hackathon by Team eBay Helper.

---

**Ready to revolutionize online marketplaces?** 🚀 Let's build the future of intelligent e-commerce together!
