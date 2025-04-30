// src/components/AIDocumentation.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Database, Brain, AlertTriangle, Code, BarChart2 } from 'lucide-react';

const AIDocumentation = () => {
  return (
    <div className="space-y-6">
      <Card className="card-glass">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-nebula-400" />
            <CardTitle className="text-2xl">AI System Documentation</CardTitle>
          </div>
          <CardDescription>
            How AToIoTA uses artificial intelligence to enhance your DeFi experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <Brain className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="models" className="flex items-center gap-1">
                <Bot className="h-4 w-4" />
                <span>AI Models</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                <span>Data Sources</span>
              </TabsTrigger>
              <TabsTrigger value="prompts" className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                <span>Prompt Engineering</span>
              </TabsTrigger>
              <TabsTrigger value="limitations" className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                <span>Limitations</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-xl font-bold">AI-Powered DeFi Assistant</h2>
                <p>
                  AToIoTA uses advanced artificial intelligence to transform how users interact with 
                  decentralized finance on the IOTA network. Our AI system combines multiple technologies 
                  to provide intelligent portfolio management, market analysis, and on-chain insights.
                </p>
                
                <h3 className="text-lg font-semibold mt-4">Key AI Capabilities</h3>
                <ul>
                  <li>
                    <strong>Portfolio Optimization</strong>: AI-driven allocation suggestions based on market conditions, 
                    risk tolerance, and historical performance
                  </li>
                  <li>
                    <strong>Natural Language Interface</strong>: Conversational AI that understands complex financial 
                    queries and provides actionable insights
                  </li>
                  <li>
                    <strong>On-Chain Analysis</strong>: Intelligent monitoring of whale transactions and market movements 
                    with predictive insights
                  </li>
                  <li>
                    <strong>Market Intelligence</strong>: AI-powered analysis of market trends, token fundamentals, 
                    and trading opportunities
                  </li>
                </ul>
                
                <h3 className="text-lg font-semibold mt-4">AI System Architecture</h3>
                <p>
                  Our AI system uses a hybrid approach that combines:
                </p>
                <ul>
                  <li>Large Language Models (LLMs) for natural language understanding and generation</li>
                  <li>Rule-based systems for financial safety and compliance</li>
                  <li>Pattern recognition for market trend identification</li>
                  <li>On-chain data analysis for blockchain intelligence</li>
                </ul>
                
                <p>
                  This multi-layered approach ensures that AToIoTA provides accurate, helpful, and 
                  responsible AI assistance for your DeFi activities.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="models" className="space-y-4">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-xl font-bold">AI Models</h2>
                <p>
                  AToIoTA leverages state-of-the-art AI models to power its intelligent features. 
                  Our primary AI engine is built on Google's Gemini 2.5 Pro, with specialized components 
                  for financial analysis and blockchain data processing.
                </p>
                
                <div className="bg-cosmic-800 p-4 rounded-lg mt-4">
                  <h3 className="text-lg font-semibold text-nebula-400">Gemini 2.5 Pro</h3>
                  <p className="mt-2">
                    Gemini 2.5 Pro is Google's multimodal AI model that powers our natural language 
                    understanding and generation capabilities. This model enables AToIoTA to:
                  </p>
                  <ul className="mt-2">
                    <li>Understand complex financial queries</li>
                    <li>Generate detailed market analyses</li>
                    <li>Explain DeFi concepts in accessible language</li>
                    <li>Provide personalized portfolio recommendations</li>
                  </ul>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The model has been fine-tuned for financial and blockchain-specific language 
                    through specialized prompt engineering.
                  </p>
                </div>
                
                <div className="bg-cosmic-800 p-4 rounded-lg mt-4">
                  <h3 className="text-lg font-semibold text-nebula-400">Rule-Based Systems</h3>
                  <p className="mt-2">
                    In addition to Gemini, we employ rule-based systems for:
                  </p>
                  <ul className="mt-2">
                    <li>Portfolio allocation validation</li>
                    <li>Risk assessment calculations</li>
                    <li>Transaction pattern classification</li>
                    <li>Fallback responses when API services are unavailable</li>
                  </ul>
                  <p className="mt-2 text-sm text-muted-foreground">
                    These rule-based components ensure reliability and provide guardrails for the AI system.
                  </p>
                </div>
                
                <h3 className="text-lg font-semibold mt-4">Model Selection Process</h3>
                <p>
                  Our AI system dynamically selects the appropriate model or combination of models based on:
                </p>
                <ul>
                  <li>The type of user query or task</li>
                  <li>Available data sources</li>
                  <li>Required response speed</li>
                  <li>Confidence thresholds</li>
                </ul>
                <p>
                  This ensures optimal performance while maintaining response quality across different scenarios.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="data" className="space-y-4">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-xl font-bold">Data Sources</h2>
                <p>
                  AToIoTA's AI system integrates multiple data sources to provide comprehensive insights 
                  for DeFi decision-making. Our data pipeline combines on-chain data, market information, 
                  and historical patterns.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-cosmic-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-nebula-400 flex items-center gap-2">
                      <BarChart2 className="h-5 w-5" />
                      On-Chain Data
                    </h3>
                    <ul className="mt-2">
                      <li>IOTA Explorer API for transaction data</li>
                      <li>Smart contract events and interactions</li>
                      <li>Token transfers and whale movements</li>
                      <li>Wallet behavior and patterns</li>
                      <li>Protocol metrics (TVL, volume, etc.)</li>
                    </ul>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Data is fetched in real-time from the IOTA blockchain for the most current insights.
                    </p>
                  </div>
                  
                  <div className="bg-cosmic-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-nebula-400 flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Market Data
                    </h3>
                    <ul className="mt-2">
                      <li>Token prices and market caps</li>
                      <li>Trading volumes and liquidity metrics</li>
                      <li>Historical price patterns</li>
                      <li>Yield and APR information</li>
                      <li>Market sentiment indicators</li>
                    </ul>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Market data is sourced from CoinGecko API and other providers with regular updates.
                    </p>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mt-4">Data Processing</h3>
                <p>
                  Raw data undergoes several processing steps before being used by our AI models:
                </p>
                <ol>
                  <li>
                    <strong>Cleaning and Normalization</strong>: Standardizing data formats and handling missing values
                  </li>
                  <li>
                    <strong>Feature Extraction</strong>: Identifying relevant patterns and metrics from raw data
                  </li>
                  <li>
                    <strong>Contextual Enrichment</strong>: Adding historical context and related information
                  </li>
                  <li>
                    <strong>Real-time Integration</strong>: Combining fresh data with existing knowledge
                  </li>
                </ol>
                
                <h3 className="text-lg font-semibold mt-4">Data Privacy</h3>
                <p>
                  AToIoTA respects user privacy and data security:
                </p>
                <ul>
                  <li>All blockchain data used is already publicly available</li>
                  <li>User portfolio data is processed locally when possible</li>
                  <li>No personally identifiable information is stored or processed</li>
                  <li>API calls to external services are made with minimal necessary data</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="prompts" className="space-y-4">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-xl font-bold">Prompt Engineering</h2>
                <p>
                  The effectiveness of our AI system relies heavily on sophisticated prompt engineering. 
                  We've developed specialized prompts for different financial and blockchain analysis tasks.
                </p>
                
                <h3 className="text-lg font-semibold mt-4">Prompt Design Principles</h3>
                <ul>
                  <li><strong>Specificity</strong>: Prompts include detailed instructions and context</li>
                  <li><strong>Structure</strong>: Consistent formatting for predictable outputs</li>
                  <li><strong>Context</strong>: Relevant market and blockchain data is included</li>
                  <li><strong>Constraints</strong>: Clear guidelines for responsible financial advice</li>
                </ul>
                
                <div className="bg-cosmic-800 p-4 rounded-lg mt-4 font-mono text-sm overflow-x-auto">
                  <h3 className="text-nebula-400 font-semibold mb-2">Example: Whale Transaction Analysis Prompt</h3>
                  <pre className="whitespace-pre-wrap">
{`You are a blockchain analyst specializing in whale transaction analysis for the IOTA ecosystem. 
Analyze this whale transaction and provide insights:

Transaction Details:
- Type: {transaction.type} (buy/sell/transfer)
- Token: {transaction.tokenSymbol} ({transaction.tokenName})
- Amount: {transaction.valueFormatted} tokens
- USD Value: {transaction.usdValue}
- From: {transaction.from}
- To: {transaction.to}
- Time: {transaction.age}
- Hash: {transaction.hash}

Please provide a comprehensive analysis including:
1. Transaction overview and significance
2. Analysis of the sender and recipient wallets
3. Potential market impact of this transaction
4. Related on-chain activity and patterns
5. Recommendations for traders/investors

Format your response in Markdown with appropriate headings and bullet points.
Keep your analysis factual and evidence-based. Mention if certain conclusions are speculative.`}
                  </pre>
                </div>
                
                <div className="bg-cosmic-800 p-4 rounded-lg mt-4 font-mono text-sm overflow-x-auto">
                  <h3 className="text-nebula-400 font-semibold mb-2">Example: Portfolio Rebalancing Prompt</h3>
                  <pre className="whitespace-pre-wrap">
{`You are an AI portfolio advisor specializing in crypto asset allocation for the IOTA ecosystem.
Analyze the user's current portfolio and market conditions to provide rebalancing advice:

Current Portfolio:
{allocations.map(a => \`- \${a.name}: \${a.allocation}%\`).join('\\n')}

Market Conditions:
- Overall Market: {marketCondition}
- Sector Performance: {sectorPerformance}
- Risk Metrics: {riskMetrics}

User Query: {userMessage}

Provide a thoughtful analysis and recommendation including:
1. Assessment of current allocation strengths and weaknesses
2. Specific rebalancing suggestions with percentages
3. Rationale for each suggested change
4. Risk considerations and potential downsides
5. Timeline recommendations (immediate vs gradual changes)

Format your response in clear sections. Always maintain a total allocation of 100%.
Avoid excessive risk and maintain appropriate diversification.
Clearly indicate when advice is speculative vs data-driven.`}
                  </pre>
                </div>
                
                <h3 className="text-lg font-semibold mt-4">Dynamic Prompt Generation</h3>
                <p>
                  Our system dynamically generates prompts based on:
                </p>
                <ul>
                  <li>User query context and history</li>
                  <li>Current market conditions</li>
                  <li>Available on-chain data</li>
                  <li>Portfolio composition</li>
                </ul>
                <p>
                  This ensures that the AI receives the most relevant information for each specific request.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="limitations" className="space-y-4">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-xl font-bold">Limitations and Ethical Considerations</h2>
                <p>
                  While our AI system provides valuable insights, it's important to understand its limitations 
                  and the ethical considerations we've incorporated into its design.
                </p>
                
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg mt-4">
                  <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Key Limitations
                  </h3>
                  <ul className="mt-2">
                    <li><strong>Not Financial Advice</strong>: Our AI provides analysis and suggestions, not professional financial advice</li>
                    <li><strong>Market Unpredictability</strong>: No AI can predict market movements with certainty</li>
                    <li><strong>Data Limitations</strong>: Analysis is based on available public data which may be incomplete</li>
                    <li><strong>Model Constraints</strong>: AI models have inherent limitations in understanding complex market dynamics</li>
                    <li><strong>Latency Issues</strong>: On-chain data may have delays affecting real-time analysis</li>
                  </ul>
                </div>
                
                <h3 className="text-lg font-semibold mt-4">Ethical Framework</h3>
                <p>
                  Our AI system operates within a strict ethical framework:
                </p>
                <ul>
                  <li><strong>Transparency</strong>: We clearly indicate when information comes from AI</li>
                  <li><strong>Accuracy</strong>: We prioritize factual information and label speculation</li>
                  <li><strong>Responsibility</strong>: We avoid encouraging high-risk financial behavior</li>
                  <li><strong>Privacy</strong>: We minimize data collection and processing</li>
                  <li><strong>Accessibility</strong>: We design for users with varying levels of expertise</li>
                </ul>
                
                <h3 className="text-lg font-semibold mt-4">Safeguards</h3>
                <p>
                  We've implemented several safeguards in our AI system:
                </p>
                <ul>
                  <li>Risk warnings for potentially high-risk suggestions</li>
                  <li>Confidence scores for predictions and analyses</li>
                  <li>Fallback mechanisms when AI confidence is low</li>
                  <li>Regular auditing of AI outputs for bias and accuracy</li>
                  <li>Clear disclaimers about the nature of AI-generated content</li>
                </ul>
                
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg mt-4">
                  <h3 className="text-amber-400 font-semibold">Important Disclaimer</h3>
                  <p className="mt-2">
                    AToIoTA's AI features are designed to assist with portfolio management and market analysis, 
                    but all investment decisions should be made based on your own research and judgment. 
                    Cryptocurrency investments carry significant risks, and past performance is not indicative 
                    of future results.
                  </p>
                </div>
                
                <h3 className="text-lg font-semibold mt-4">Continuous Improvement</h3>
                <p>
                  We are committed to continuously improving our AI system:
                </p>
                <ul>
                  <li>Regular updates to models and data sources</li>
                  <li>Ongoing evaluation of accuracy and helpfulness</li>
                  <li>Incorporation of user feedback</li>
                  <li>Adaptation to evolving market conditions and DeFi landscape</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-glass">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-nebula-400" />
              <CardTitle>AI Capabilities</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                  <Bot className="h-3 w-3 text-nebula-400" />
                </div>
                <span>Natural language portfolio analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                  <Bot className="h-3 w-3 text-nebula-400" />
                </div>
                <span>Market trend identification and forecasting</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                  <Bot className="h-3 w-3 text-nebula-400" />
                </div>
                <span>Whale transaction monitoring and analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                  <Bot className="h-3 w-3 text-nebula-400" />
                </div>
                <span>Risk assessment and diversification suggestions</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                  <Bot className="h-3 w-3 text-nebula-400" />
                </div>
                <span>DeFi protocol comparison and recommendations</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-nebula-400" />
              <CardTitle>Data Integration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                  <Database className="h-3 w-3 text-nebula-400" />
                </div>
                <span>Real-time IOTA blockchain data processing</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                  <Database className="h-3 w-3 text-nebula-400" />
                </div>
                <span>Market data from multiple trusted sources</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                  <Database className="h-3 w-3 text-nebula-400" />
                </div>
                <span>Historical performance patterns and correlations</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                  <Database className="h-3 w-3 text-nebula-400" />
                </div>
                <span>DeFi protocol metrics and performance data</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                  <Database className="h-3 w-3 text-nebula-400" />
                </div>
                <span>Secure, privacy-preserving data processing</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-nebula-400" />
              <CardTitle>Usage Guidelines</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-amber-500/20 p-1 mt-0.5">
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                </div>
                <span>Use AI insights as one of many research tools</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-amber-500/20 p-1 mt-0.5">
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                </div>
                <span>Verify important information from multiple sources</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-amber-500/20 p-1 mt-0.5">
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                </div>
                <span>Consider your personal risk tolerance and goals</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-amber-500/20 p-1 mt-0.5">
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                </div>
                <span>Be aware of AI's limitations in predicting markets</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-amber-500/20 p-1 mt-0.5">
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                </div>
                <span>Report any concerning or inaccurate AI responses</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="card-glass">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-nebula-400" />
            <CardTitle>Technical Implementation</CardTitle>
          </div>
          <CardDescription>
            How our AI system is integrated into the AToIoTA platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none">
            <p>
              AToIoTA's AI capabilities are implemented through a sophisticated architecture that 
              combines cloud-based AI services with local processing:
            </p>
            
            <div className="not-prose bg-cosmic-800 p-4 rounded-lg mt-4">
              <h3 className="text-lg font-semibold text-nebula-400">Architecture Overview</h3>
              <ul className="mt-2 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                    <Code className="h-3 w-3 text-nebula-400" />
                  </div>
                  <div>
                    <span className="font-semibold">Frontend Integration</span>
                    <p className="text-sm text-muted-foreground">
                      AI features are seamlessly integrated into the user interface through React components 
                      and custom hooks that manage AI state and interactions.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                    <Code className="h-3 w-3 text-nebula-400" />
                  </div>
                  <div>
                    <span className="font-semibold">API Layer</span>
                    <p className="text-sm text-muted-foreground">
                      Secure API endpoints handle AI requests, data processing, and response formatting. 
                      This layer manages authentication, rate limiting, and error handling.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                    <Code className="h-3 w-3 text-nebula-400" />
                  </div>
                  <div>
                    <span className="font-semibold">AI Service</span>
                    <p className="text-sm text-muted-foreground">
                      Our core AI service orchestrates interactions with Gemini and other AI models, 
                      handling prompt construction, context management, and response processing.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-nebula-500/20 p-1 mt-0.5">
                    <Code className="h-3 w-3 text-nebula-400" />
                  </div>
                  <div>
                    <span className="font-semibold">Data Pipeline</span>
                    <p className="text-sm text-muted-foreground">
                      A robust data pipeline collects, processes, and enriches blockchain and market data 
                      before it's used by AI models, ensuring high-quality inputs.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            
            <h3 className="text-lg font-semibold mt-4">Performance Optimizations</h3>
            <p>
              We've implemented several optimizations to ensure responsive AI interactions:
            </p>
            <ul>
              <li>Response caching for common queries</li>
              <li>Progressive rendering for long-form AI responses</li>
              <li>Parallel data fetching to minimize latency</li>
              <li>Efficient prompt templating to reduce token usage</li>
              <li>Fallback mechanisms for degraded service conditions</li>
            </ul>
            
            <h3 className="text-lg font-semibold mt-4">Future Development</h3>
            <p>
              Our AI system is continuously evolving. Upcoming technical improvements include:
            </p>
            <ul>
              <li>Enhanced personalization through user preference learning</li>
              <li>More sophisticated market prediction models</li>
              <li>Expanded multimodal capabilities (chart analysis, document processing)</li>
              <li>Deeper integration with IOTA's unique features and capabilities</li>
              <li>Additional language support for international users</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIDocumentation;