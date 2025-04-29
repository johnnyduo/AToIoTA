# AToIoTA - AI-powered DeFi Investment Portfolio Navigator

## Overview

AToIoTA is an AI-powered DeFi investment portfolio navigator specifically designed for the IOTA EVM network. It helps users optimize their cryptocurrency investments through intelligent portfolio management, yield comparisons, and performance tracking.

## Features

- **Portfolio Overview**: Track your entire IOTA EVM investment portfolio in one place
- **Performance Charts**: Visualize your investment performance over time
- **Yield Comparison**: Compare yields across different DeFi protocols
- **Token Management**: View and manage all your tokens in a comprehensive table
- **AI-Powered Insights**: Get intelligent investment recommendations
- **Persistent Chat**: AI chat history is saved across browser sessions using localStorage
- **Real-Time Token Prices**: Integration with CoinGecko API for up-to-date market data
- **Gemini AI Integration**: Advanced token insights powered by Google's Gemini AI

## Tech Stack

- **Frontend**: React with TypeScript
- **UI Framework**: Tailwind CSS with Shadcn UI components
- **State Management**: React Query
- **Visualization**: Custom charts for portfolio performance

## Getting Started

Follow these steps to set up the project locally:

```sh
# Clone the repository
git clone <YOUR_REPOSITORY_URL>

# Navigate to the project directory
cd atoiota

# Install dependencies
npm install

# Create .env file for API keys
cp .env.example .env
# Edit the .env file and add your Gemini API key

# Start the development server
npm run dev
```

### Environment Setup

The application uses environment variables for API keys and configuration. Create or modify the `.env` file in the project root with the following variables:

```
# Gemini API Key for token price data
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# CoinGecko API URL (free tier)
VITE_COINGECKO_API_URL=https://api.coingecko.com/api/v3
```

### Gemini API Key
To use the Gemini AI for token insights:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and paste it in the `.env` file as the value for `VITE_GEMINI_API_KEY`

## Development

This project uses Vite as its build tool. Here are some useful commands:

```sh
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Deployment

To deploy this application:

1. Build the project: `npm run build`
2. Deploy the contents of the `dist` directory to your hosting provider

## License

[Include your license information here]

## Contact

[Include your contact information here]
