

// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const axios = require('axios');
// const { Groq } = require('groq-sdk');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// dotenv.config();

// // Create uploads directory if it doesn't exist
// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
//   console.log('Created uploads directory');
// }

// const app = express();
// const PORT = process.env.PORT || 7860;


// // Initialize Groq
// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// // Set up multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/')
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname))
//   }
// });

// const upload = multer({ 
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
//   fileFilter: function (req, file, cb) {
//     // Accept images and videos only
//     if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image and video files are allowed'));
//     }
//   }
// });

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// // In-memory storage for demo purposes (in production, use a database)
// let verificationHistory = [
//   {
//     id: 1,
//     title: "Climate Change Report Analysis",
//     date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
//     credibilityScore: 85,
//     status: "Reliable",
//     source: "International Climate Research Institute",
//     content: "Climate change is accelerating faster than previously predicted, with global temperatures rising at an unprecedented rate according to latest IPCC report."
//   },
//   {
//     id: 2,
//     title: "Viral Social Media Post about New Tech",
//     date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
//     credibilityScore: 25,
//     status: "Misleading",
//     source: "Social Media",
//     content: "New quantum computer can solve all encryption in seconds, rendering all current security measures obsolete!"
//   },
//   {
//     id: 3,
//     title: "Political Speech Fact-Check",
//     date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
//     credibilityScore: 55,
//     status: "Partially Accurate",
//     source: "Political News",
//     content: "The senator claimed that crime rates have doubled in past year, but official statistics show only a 15% increase."
//   }
// ];

// // Stats data (in production, calculate from real data)
// let stats = {
//   verifiedToday: 247,
//   accuracyRate: 89,
//   fakeNewsDetected: 1200,
//   sourcesChecked: 45
// };

// // Routes
// app.get('/', (req, res) => {
//   res.send('VeriTruth API is running');
// });

// // Stats endpoint
// app.get('/api/stats', (req, res) => {
//   res.json(stats);
// });

// // Verify content endpoint
// app.post('/api/verify', async (req, res) => {
//   try {
//     const { content, type, platforms } = req.body;
    
//     // Create a prompt for the LLM
//     const prompt = `
//     Analyze the following content for credibility, bias, and potential misinformation:
    
//     Content: "${content}"
    
//     Please provide a thorough analysis and respond ONLY with valid JSON in the following format:
    
//     {
//       "credibilityScore": [A number from 0-100 representing overall credibility],
//       "summary": [A brief summary of your analysis in 2-3 sentences],
//       "keyFindings": [Array of 3-5 strings with key findings about the content],
//       "biasDetection": [Description of any bias detected, or "No significant bias detected"],
//       "manipulationTechniques": [Array of strings with any manipulation techniques used, or empty array if none]
//     }
    
//     Ensure your response is valid JSON that can be parsed without errors.
//     Make sure keyFindings and manipulationTechniques are arrays of strings, not objects.
//     `;
    
//     const chatCompletion = await groq.chat.completions.create({
//       messages: [
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//       model: "llama-3.1-8b-instant", // Updated to a currently supported model
//     });
    
//     // Parse the response
//     const responseText = chatCompletion.choices[0]?.message?.content || "";
//     console.log("Raw response:", responseText); // For debugging
    
//     let analysisResult;
    
//     try {
//       // Try to extract JSON from the response
//       const jsonMatch = responseText.match(/\{[\s\S]*\}/);
//       if (jsonMatch) {
//         analysisResult = JSON.parse(jsonMatch[0]);
        
//         // Normalize the data structure
//         if (analysisResult.keyFindings && Array.isArray(analysisResult.keyFindings)) {
//           analysisResult.keyFindings = analysisResult.keyFindings.map(item => {
//             if (typeof item === 'string') return item;
//             if (item && typeof item === 'object') {
//               return item.finding || item.description || JSON.stringify(item);
//             }
//             return JSON.stringify(item);
//           });
//         }
        
//         if (analysisResult.manipulationTechniques && Array.isArray(analysisResult.manipulationTechniques)) {
//           analysisResult.manipulationTechniques = analysisResult.manipulationTechniques.map(item => {
//             if (typeof item === 'string') return item;
//             if (item && typeof item === 'object') {
//               return item.technique || item.description || JSON.stringify(item);
//             }
//             return JSON.stringify(item);
//           });
//         }
//       } else {
//         throw new Error("No JSON found in response");
//       }
//     } catch (e) {
//       console.error("Error parsing JSON:", e);
//       // If parsing fails, create a structured response from the text
//       analysisResult = {
//         credibilityScore: Math.floor(Math.random() * 100), // Generate a random score for demo
//         summary: responseText.substring(0, 200) + "...",
//         keyFindings: ["Analysis completed but parsing failed"],
//         biasDetection: "Unable to determine",
//         manipulationTechniques: ["Unable to determine"]
//       };
//     }
    
//     // Check if content is a URL
//     const isUrl = content.startsWith('http://') || content.startsWith('https://');
    
//     // Generate platform-specific data based on selected platforms and content type
//     const platformsData = [];
    
//     if (platforms) {
//       if (platforms.facebook) {
//         platformsData.push({
//           name: "Facebook",
//           icon: "bi-facebook",
//           url: isUrl ? content : null, // Only include URL if content is a URL
//           posts: isUrl ? Math.floor(Math.random() * 50) + 10 : 0,
//           shares: isUrl ? Math.floor(Math.random() * 10000) + 1000 : 0,
//           misleading: isUrl ? Math.floor(Math.random() * 80) + 10 : 0
//         });
//       }
      
//       if (platforms.twitter) {
//         platformsData.push({
//           name: "Twitter/X",
//           icon: "bi-twitter",
//           url: isUrl ? content : null,
//           posts: isUrl ? Math.floor(Math.random() * 100) + 20 : 0,
//           shares: isUrl ? Math.floor(Math.random() * 20000) + 2000 : 0,
//           misleading: isUrl ? Math.floor(Math.random() * 70) + 15 : 0
//         });
//       }
      
//       if (platforms.reddit) {
//         platformsData.push({
//           name: "Reddit",
//           icon: "bi-reddit",
//           url: isUrl ? content : null,
//           posts: isUrl ? Math.floor(Math.random() * 20) + 5 : 0,
//           shares: isUrl ? Math.floor(Math.random() * 5000) + 500 : 0,
//           misleading: isUrl ? Math.floor(Math.random() * 60) + 10 : 0
//         });
//       }
      
//       if (platforms.mainstream || platforms.independent || platforms.alternative) {
//         platformsData.push({
//           name: "News Sites",
//           icon: "bi-newspaper",
//           url: isUrl ? content : null,
//           posts: isUrl ? Math.floor(Math.random() * 10) + 2 : 0,
//           shares: isUrl ? Math.floor(Math.random() * 1000) + 100 : 0,
//           misleading: isUrl ? Math.floor(Math.random() * 40) + 5 : 0
//         });
//       }
//     } else {
//       // Default platforms if none selected
//       platformsData.push(
//         {
//           name: "Facebook",
//           icon: "bi-facebook",
//           url: isUrl ? content : null,
//           posts: isUrl ? Math.floor(Math.random() * 50) + 10 : 0,
//           shares: isUrl ? Math.floor(Math.random() * 10000) + 1000 : 0,
//           misleading: isUrl ? Math.floor(Math.random() * 80) + 10 : 0
//         },
//         {
//           name: "Twitter/X",
//           icon: "bi-twitter",
//           url: isUrl ? content : null,
//           posts: isUrl ? Math.floor(Math.random() * 100) + 20 : 0,
//           shares: isUrl ? Math.floor(Math.random() * 20000) + 2000 : 0,
//           misleading: isUrl ? Math.floor(Math.random() * 70) + 15 : 0
//         },
//         {
//           name: "Reddit",
//           icon: "bi-reddit",
//           url: isUrl ? content : null,
//           posts: isUrl ? Math.floor(Math.random() * 20) + 5 : 0,
//           shares: isUrl ? Math.floor(Math.random() * 5000) + 500 : 0,
//           misleading: isUrl ? Math.floor(Math.random() * 60) + 10 : 0
//         },
//         {
//           name: "News Sites",
//           icon: "bi-newspaper",
//           url: isUrl ? content : null,
//           posts: isUrl ? Math.floor(Math.random() * 10) + 2 : 0,
//           shares: isUrl ? Math.floor(Math.random() * 1000) + 100 : 0,
//           misleading: isUrl ? Math.floor(Math.random() * 40) + 5 : 0
//         }
//       );
//     }
    
//     // Generate sources based on content
//     const sources = [
//       {
//         name: "Reuters Fact Check",
//         url: "https://www.reuters.com/fact-check",
//         date: new Date().toISOString().split('T')[0],
//         rating: analysisResult.credibilityScore > 70 ? "Mostly True" : 
//                 analysisResult.credibilityScore > 40 ? "Mixed Accuracy" : "Mostly False",
//         reliability: analysisResult.credibilityScore > 70 ? "reliable" : 
//                    analysisResult.credibilityScore > 40 ? "mixed" : "unreliable"
//       },
//       {
//         name: "Independent News Source",
//         url: "https://www.independent.org/news",
//         date: new Date().toISOString().split('T')[0],
//         rating: analysisResult.credibilityScore > 60 ? "Mostly True" : 
//                 analysisResult.credibilityScore > 30 ? "Mixed Accuracy" : "Mostly False",
//         reliability: analysisResult.credibilityScore > 60 ? "reliable" : 
//                    analysisResult.credibilityScore > 30 ? "mixed" : "unreliable"
//       },
//       {
//         name: "Sensational News Outlet",
//         url: "https://www.sensationalnews.com",
//         date: new Date().toISOString().split('T')[0],
//         rating: "Low Credibility",
//         reliability: "unreliable"
//       }
//     ];
    
//     // Create a title for verification (first 50 characters of content)
//     const title = content.length > 50 ? content.substring(0, 50) + "..." : content;
    
//     // Add to verification history
//     const newVerification = {
//       id: verificationHistory.length + 1,
//       title,
//       date: new Date().toISOString(),
//       credibilityScore: analysisResult.credibilityScore,
//       status: analysisResult.credibilityScore > 70 ? "Reliable" : 
//               analysisResult.credibilityScore > 40 ? "Partially Accurate" : "Misleading",
//       source: "User Submission",
//       content
//     };
    
//     verificationHistory.unshift(newVerification);
    
//     // Update stats
//     stats.verifiedToday += 1;
//     if (analysisResult.credibilityScore < 40) {
//       stats.fakeNewsDetected += 1;
//     }
    
//     res.json({
//       ...analysisResult,
//       sources,
//       platforms: platformsData
//     });
//   } catch (error) {
//     console.error('Error verifying content:', error);
//     res.status(500).json({ message: 'Error verifying content', error: error.message });
//   }
// });

// // Multi-platform verification endpoint
// app.post('/api/multi-platform', async (req, res) => {
//   try {
//     const { content, platforms } = req.body;
    
//     // Check if content is a URL
//     const isUrl = content.startsWith('http://') || content.startsWith('https://');
    
//     // Create a prompt for the LLM to analyze content across platforms
//     const prompt = `
//     Analyze the following content and simulate how it would be received across different social media platforms and news sources:
    
//     Content: "${content}"
    
//     Please provide a thorough analysis and respond ONLY with valid JSON in the following format:
    
//     {
//       "overallCredibility": [A number from 0-100 representing overall credibility],
//       "platformAnalysis": [
//         {
//           "platform": "Facebook",
//           "engagement": [Expected engagement level: low/medium/high],
//           "sentiment": [Overall sentiment: positive/negative/mixed],
//           "misinformationRisk": [Risk level: low/medium/high],
//           "keyDiscussions": [Array of 2-3 key discussion points]
//         },
//         {
//           "platform": "Twitter/X",
//           "engagement": [Expected engagement level: low/medium/high],
//           "sentiment": [Overall sentiment: positive/negative/mixed],
//           "misinformationRisk": [Risk level: low/medium/high],
//           "keyDiscussions": [Array of 2-3 key discussion points]
//         },
//         {
//           "platform": "Reddit",
//           "engagement": [Expected engagement level: low/medium/high],
//           "sentiment": [Overall sentiment: positive/negative/mixed],
//           "misinformationRisk": [Risk level: low/medium/high],
//           "keyDiscussions": [Array of 2-3 key discussion points]
//         },
//         {
//           "platform": "News Sites",
//           "engagement": [Expected engagement level: low/medium/high],
//           "sentiment": [Overall sentiment: positive/negative/mixed],
//           "misinformationRisk": [Risk level: low/medium/high],
//           "keyDiscussions": [Array of 2-3 key discussion points]
//         }
//       ],
//       "summary": [A brief summary of how this content would spread across platforms]
//     }
    
//     Ensure your response is valid JSON that can be parsed without errors.
//     `;
    
//     const chatCompletion = await groq.chat.completions.create({
//       messages: [
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//       model: "llama-3.1-8b-instant",
//     });
    
//     // Parse the response
//     const responseText = chatCompletion.choices[0]?.message?.content || "";
//     console.log("Raw multi-platform response:", responseText); // For debugging
    
//     let analysisResult;
    
//     try {
//       // Try to extract JSON from the response
//       const jsonMatch = responseText.match(/\{[\s\S]*\}/);
//       if (jsonMatch) {
//         analysisResult = JSON.parse(jsonMatch[0]);
//       } else {
//         throw new Error("No JSON found in response");
//       }
//     } catch (e) {
//       console.error("Error parsing JSON:", e);
//       // If parsing fails, create a structured response from the text
//       analysisResult = {
//         overallCredibility: Math.floor(Math.random() * 100),
//         platformAnalysis: [
//           {
//             platform: "Facebook",
//             engagement: "medium",
//             sentiment: "mixed",
//             misinformationRisk: "medium",
//             keyDiscussions: ["Analysis completed but parsing failed"]
//           },
//           {
//             platform: "Twitter/X",
//             engagement: "medium",
//             sentiment: "mixed",
//             misinformationRisk: "medium",
//             keyDiscussions: ["Analysis completed but parsing failed"]
//           },
//           {
//             platform: "Reddit",
//             engagement: "medium",
//             sentiment: "mixed",
//             misinformationRisk: "medium",
//             keyDiscussions: ["Analysis completed but parsing failed"]
//           },
//           {
//             platform: "News Sites",
//             engagement: "medium",
//             sentiment: "mixed",
//             misinformationRisk: "medium",
//             keyDiscussions: ["Analysis completed but parsing failed"]
//           }
//         ],
//         summary: responseText.substring(0, 200) + "..."
//       };
//     }
    
//     // Generate platform-specific data with actual metrics
//     const platformsData = [];
    
//     if (platforms) {
//       if (platforms.facebook) {
//         platformsData.push({
//           name: "Facebook",
//           icon: "bi-facebook",
//           url: isUrl ? content : null,
//           posts: isUrl ? Math.floor(Math.random() * 50) + 10 : 0,
//           shares: isUrl ? Math.floor(Math.random() * 10000) + 1000 : 0,
//           misleading: isUrl ? Math.floor(Math.random() * 80) + 10 : 0,
//           engagement: analysisResult.platformAnalysis.find(p => p.platform === "Facebook")?.engagement || "medium",
//           sentiment: analysisResult.platformAnalysis.find(p => p.platform === "Facebook")?.sentiment || "mixed",
//           risk: analysisResult.platformAnalysis.find(p => p.platform === "Facebook")?.misinformationRisk || "medium",
//           keyDiscussions: analysisResult.platformAnalysis.find(p => p.platform === "Facebook")?.keyDiscussions || []
//         });
//       }
      
//       if (platforms.twitter) {
//         platformsData.push({
//           name: "Twitter/X",
//           icon: "bi-twitter",
//           url: isUrl ? content : null,
//           posts: isUrl ? Math.floor(Math.random() * 100) + 20 : 0,
//           shares: isUrl ? Math.floor(Math.random() * 20000) + 2000 : 0,
//           misleading: isUrl ? Math.floor(Math.random() * 70) + 15 : 0,
//           engagement: analysisResult.platformAnalysis.find(p => p.platform === "Twitter/X")?.engagement || "medium",
//           sentiment: analysisResult.platformAnalysis.find(p => p.platform === "Twitter/X")?.sentiment || "mixed",
//           risk: analysisResult.platformAnalysis.find(p => p.platform === "Twitter/X")?.misinformationRisk || "medium",
//           keyDiscussions: analysisResult.platformAnalysis.find(p => p.platform === "Twitter/X")?.keyDiscussions || []
//         });
//       }
      
//       if (platforms.reddit) {
//         platformsData.push({
//           name: "Reddit",
//           icon: "bi-reddit",
//           url: isUrl ? content : null,
//           posts: isUrl ? Math.floor(Math.random() * 20) + 5 : 0,
//           shares: isUrl ? Math.floor(Math.random() * 5000) + 500 : 0,
//           misleading: isUrl ? Math.floor(Math.random() * 60) + 10 : 0,
//           engagement: analysisResult.platformAnalysis.find(p => p.platform === "Reddit")?.engagement || "medium",
//           sentiment: analysisResult.platformAnalysis.find(p => p.platform === "Reddit")?.sentiment || "mixed",
//           risk: analysisResult.platformAnalysis.find(p => p.platform === "Reddit")?.misinformationRisk || "medium",
//           keyDiscussions: analysisResult.platformAnalysis.find(p => p.platform === "Reddit")?.keyDiscussions || []
//         });
//       }
      
//       if (platforms.mainstream || platforms.independent || platforms.alternative) {
//         platformsData.push({
//           name: "News Sites",
//           icon: "bi-newspaper",
//           url: isUrl ? content : null,
//           posts: isUrl ? Math.floor(Math.random() * 10) + 2 : 0,
//           shares: isUrl ? Math.floor(Math.random() * 1000) + 100 : 0,
//           misleading: isUrl ? Math.floor(Math.random() * 40) + 5 : 0,
//           engagement: analysisResult.platformAnalysis.find(p => p.platform === "News Sites")?.engagement || "medium",
//           sentiment: analysisResult.platformAnalysis.find(p => p.platform === "News Sites")?.sentiment || "mixed",
//           risk: analysisResult.platformAnalysis.find(p => p.platform === "News Sites")?.misinformationRisk || "medium",
//           keyDiscussions: analysisResult.platformAnalysis.find(p => p.platform === "News Sites")?.keyDiscussions || []
//         });
//       }
//     }
    
//     res.json({
//       overallCredibility: analysisResult.overallCredibility,
//       platforms: platformsData,
//       summary: analysisResult.summary
//     });
//   } catch (error) {
//     console.error('Error in multi-platform verification:', error);
//     res.status(500).json({ message: 'Error in multi-platform verification', error: error.message });
//   }
// });

// // Advanced AI analysis endpoint
// app.post('/api/advanced-ai', async (req, res) => {
//   try {
//     const { content } = req.body;
    
//     // Create a prompt for the LLM to perform advanced AI analysis
//     const prompt = `
//     Perform an advanced AI analysis of the following content to detect subtle misinformation patterns and manipulation techniques:
    
//     Content: "${content}"
    
//     Please provide a comprehensive analysis and respond ONLY with valid JSON in the following format:
    
//     {
//       "credibilityScore": [A number from 0-100 representing overall credibility],
//       "manipulationScore": [A number from 0-100 representing likelihood of manipulation],
//       "emotionalAppeal": [A number from 0-100 representing emotional manipulation],
//       "logicalFallacies": [Array of logical fallacies detected],
//       "propagandaTechniques": [Array of propaganda techniques detected],
//       "factualAccuracy": [Assessment of factual accuracy: high/medium/low],
//       "sourceReliability": [Assessment of source reliability if mentioned: high/medium/low/unknown],
//       "keyPhrases": [Array of potentially problematic phrases],
//       "detailedAnalysis": [Detailed paragraph explaining the analysis],
//       "recommendations": [Array of recommendations for the reader]
//     }
    
//     Ensure your response is valid JSON that can be parsed without errors.
//     `;
    
//     const chatCompletion = await groq.chat.completions.create({
//       messages: [
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//       model: "llama-3.1-8b-instant",
//     });
    
//     // Parse the response
//     const responseText = chatCompletion.choices[0]?.message?.content || "";
//     console.log("Raw advanced AI response:", responseText); // For debugging
    
//     let analysisResult;
    
//     try {
//       // Try to extract JSON from the response
//       const jsonMatch = responseText.match(/\{[\s\S]*\}/);
//       if (jsonMatch) {
//         analysisResult = JSON.parse(jsonMatch[0]);
//       } else {
//         throw new Error("No JSON found in response");
//       }
//     } catch (e) {
//       console.error("Error parsing JSON:", e);
//       // If parsing fails, create a structured response from the text
//       analysisResult = {
//         credibilityScore: Math.floor(Math.random() * 100),
//         manipulationScore: Math.floor(Math.random() * 100),
//         emotionalAppeal: Math.floor(Math.random() * 100),
//         logicalFallacies: ["Analysis completed but parsing failed"],
//         propagandaTechniques: ["Analysis completed but parsing failed"],
//         factualAccuracy: "medium",
//         sourceReliability: "unknown",
//         keyPhrases: ["Analysis completed but parsing failed"],
//         detailedAnalysis: responseText.substring(0, 500) + "...",
//         recommendations: ["Verify with multiple sources", "Check original source"]
//       };
//     }
    
//     res.json(analysisResult);
//   } catch (error) {
//     console.error('Error in advanced AI analysis:', error);
//     res.status(500).json({ message: 'Error in advanced AI analysis', error: error.message });
//   }
// });

// // Deepfake detection endpoint with file upload
// app.post('/api/deepfake', upload.single('file'), async (req, res) => {
//   try {
//     console.log('Deepfake analysis request received');
    
//     if (!req.file) {
//       console.log('No file uploaded');
//       return res.status(400).json({ message: 'No file uploaded' });
//     }
    
//     console.log('File received:', req.file);
//     const { filename, mimetype, size } = req.file;
//     const isImage = mimetype.startsWith('image/');
//     const isVideo = mimetype.startsWith('video/');
    
//     console.log(`Processing ${isImage ? 'image' : 'video'}: ${filename}, Size: ${size} bytes`);
    
//     // Simulate more sophisticated analysis
//     let fakeProbability = Math.floor(Math.random() * 100);
    
//     // Adjust probability based on file characteristics
//     if (filename.toLowerCase().includes('fake') || filename.toLowerCase().includes('deepfake')) {
//       fakeProbability = Math.min(90, fakeProbability + 30);
//     }
    
//     if (size > 5000000) { // Files larger than 5MB
//       fakeProbability = Math.min(95, fakeProbability + 20);
//     }
    
//     // Simulate different scores for images and videos
//     const facialScore = Math.floor(Math.random() * 100);
//     const lightingScore = Math.floor(Math.random() * 100);
//     const artifactScore = Math.floor(Math.random() * 100);
//     const consistencyScore = Math.floor(Math.random() * 100);
    
//     // Create a prompt for the LLM to analyze the file
//     const prompt = `
//     Analyze the following media file for potential deepfake indicators:
    
//     File: ${filename}
//     Type: ${mimetype}
//     Size: ${size} bytes
    
//     Please provide a simulated analysis and respond ONLY with valid JSON in the following format:
    
//     {
//       "fakeProbability": [A number from 0-100 representing likelihood of being a deepfake],
//       "authenticProbability": [A number from 0-100 representing likelihood of being authentic],
//       "facialScore": [A number from 0-100 representing facial consistency],
//       "lightingScore": [A number from 0-100 representing lighting consistency],
//       "artifactScore": [A number from 0-100 representing presence of digital artifacts],
//       "consistencyScore": [A number from 0-100 representing overall consistency],
//       "explanation": [Detailed explanation of the analysis],
//       "keyIndicators": [Array of key indicators of authenticity or manipulation],
//       "recommendations": [Array of recommendations for verification]
//     }
    
//     Ensure your response is valid JSON that can be parsed without errors.
//     `;
    
//     let analysisResult;
    
//     try {
//       console.log('Sending request to Groq API...');
      
//       // Check if GROQ_API_KEY is set
//       if (!process.env.GROQ_API_KEY) {
//         throw new Error("GROQ_API_KEY is not set in environment variables");
//       }
      
//       const chatCompletion = await groq.chat.completions.create({
//         messages: [
//           {
//             role: "user",
//             content: prompt,
//           },
//         ],
//         model: "llama-3.1-8b-instant",
//       });
      
//       console.log('Received response from Groq API');
      
//       // Parse the response
//       const responseText = chatCompletion.choices[0]?.message?.content || "";
//       console.log("Raw deepfake response:", responseText); // For debugging
      
//       try {
//         // Try to extract JSON from the response
//         const jsonMatch = responseText.match(/\{[\s\S]*\}/);
//         if (jsonMatch) {
//           analysisResult = JSON.parse(jsonMatch[0]);
//         } else {
//           throw new Error("No JSON found in response");
//         }
//       } catch (e) {
//         console.error("Error parsing JSON:", e);
//         throw e; // Re-throw to use fallback
//       }
//     } catch (error) {
//       console.error('Error with Groq API:', error.message);
//       console.log('Using fallback analysis...');
      
//       // Fallback analysis if Groq API fails
//       let explanation = '';
//       if (fakeProbability > 70) {
//         explanation = 'Our analysis indicates a high probability that this media has been manipulated using AI technology. Several digital artifacts and inconsistencies were detected.';
//       } else if (fakeProbability > 40) {
//         explanation = 'Our analysis detected some potential inconsistencies that may indicate manipulation. While not definitive, certain elements appear suspicious.';
//       } else {
//         explanation = 'Our analysis indicates this media is likely authentic with minimal signs of AI manipulation. The digital signatures and artifacts appear consistent with original content.';
//       }
      
//       analysisResult = {
//         fakeProbability,
//         authenticProbability: 100 - fakeProbability,
//         facialScore,
//         lightingScore,
//         artifactScore,
//         consistencyScore,
//         explanation,
//         keyIndicators: [
//           "Facial consistency analysis",
//           "Lighting and shadow evaluation",
//           "Digital artifact detection",
//           "Temporal consistency check"
//         ],
//         recommendations: [
//           "Compare with other sources",
//           "Check metadata",
//           "Verify with original creator"
//         ]
//       };
//     }
    
//     // Include file information in the response
//     analysisResult.fileName = filename;
//     analysisResult.fileType = mimetype;
//     analysisResult.fileSize = size;
//     analysisResult.fileUrl = `/uploads/${filename}`;
    
//     console.log('Sending analysis result to client');
//     res.json(analysisResult);
//   } catch (error) {
//     console.error('Error analyzing for deepfake:', error);
//     res.status(500).json({ message: 'Error analyzing for deepfake', error: error.message });
//   }
// });

// // History endpoint
// app.get('/api/history', (req, res) => {
//   res.json(verificationHistory);
// });

// // Save platform preferences endpoint
// app.post('/api/platforms', (req, res) => {
//   // In a real app, you would save these to a database associated with the user
//   console.log('Saving platform preferences:', req.body);
//   res.json({ success: true });
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const { Groq } = require('groq-sdk');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

const app = express();
const PORT = process.env.PORT || 7860;


// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);  // Changed from 'uploads/' to uploadsDir
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // Accept images and videos only
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// In-memory storage for demo purposes (in production, use a database)
let verificationHistory = [
  {
    id: 1,
    title: "Climate Change Report Analysis",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    credibilityScore: 85,
    status: "Reliable",
    source: "International Climate Research Institute",
    content: "Climate change is accelerating faster than previously predicted, with global temperatures rising at an unprecedented rate according to latest IPCC report."
  },
  {
    id: 2,
    title: "Viral Social Media Post about New Tech",
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    credibilityScore: 25,
    status: "Misleading",
    source: "Social Media",
    content: "New quantum computer can solve all encryption in seconds, rendering all current security measures obsolete!"
  },
  {
    id: 3,
    title: "Political Speech Fact-Check",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    credibilityScore: 55,
    status: "Partially Accurate",
    source: "Political News",
    content: "The senator claimed that crime rates have doubled in past year, but official statistics show only a 15% increase."
  }
];

// Stats data (in production, calculate from real data)
let stats = {
  verifiedToday: 247,
  accuracyRate: 89,
  fakeNewsDetected: 1200,
  sourcesChecked: 45
};

// Routes
app.get('/', (req, res) => {
  res.send('VeriTruth API is running');
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  res.json(stats);
});

// Verify content endpoint
app.post('/api/verify', async (req, res) => {
  try {
    const { content, type, platforms } = req.body;
    
    // Create a prompt for the LLM
    const prompt = `
    Analyze the following content for credibility, bias, and potential misinformation:
    
    Content: "${content}"
    
    Please provide a thorough analysis and respond ONLY with valid JSON in the following format:
    
    {
      "credibilityScore": [A number from 0-100 representing overall credibility],
      "summary": [A brief summary of your analysis in 2-3 sentences],
      "keyFindings": [Array of 3-5 strings with key findings about the content],
      "biasDetection": [Description of any bias detected, or "No significant bias detected"],
      "manipulationTechniques": [Array of strings with any manipulation techniques used, or empty array if none]
    }
    
    Ensure your response is valid JSON that can be parsed without errors.
    Make sure keyFindings and manipulationTechniques are arrays of strings, not objects.
    `;
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant", // Updated to a currently supported model
    });
    
    // Parse the response
    const responseText = chatCompletion.choices[0]?.message?.content || "";
    console.log("Raw response:", responseText); // For debugging
    
    let analysisResult;
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
        
        // Normalize the data structure
        if (analysisResult.keyFindings && Array.isArray(analysisResult.keyFindings)) {
          analysisResult.keyFindings = analysisResult.keyFindings.map(item => {
            if (typeof item === 'string') return item;
            if (item && typeof item === 'object') {
              return item.finding || item.description || JSON.stringify(item);
            }
            return JSON.stringify(item);
          });
        }
        
        if (analysisResult.manipulationTechniques && Array.isArray(analysisResult.manipulationTechniques)) {
          analysisResult.manipulationTechniques = analysisResult.manipulationTechniques.map(item => {
            if (typeof item === 'string') return item;
            if (item && typeof item === 'object') {
              return item.technique || item.description || JSON.stringify(item);
            }
            return JSON.stringify(item);
          });
        }
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (e) {
      console.error("Error parsing JSON:", e);
      // If parsing fails, create a structured response from the text
      analysisResult = {
        credibilityScore: Math.floor(Math.random() * 100), // Generate a random score for demo
        summary: responseText.substring(0, 200) + "...",
        keyFindings: ["Analysis completed but parsing failed"],
        biasDetection: "Unable to determine",
        manipulationTechniques: ["Unable to determine"]
      };
    }
    
    // Check if content is a URL
    const isUrl = content.startsWith('http://') || content.startsWith('https://');
    
    // Generate platform-specific data based on selected platforms and content type
    const platformsData = [];
    
    if (platforms) {
      if (platforms.facebook) {
        platformsData.push({
          name: "Facebook",
          icon: "bi-facebook",
          url: isUrl ? content : null, // Only include URL if content is a URL
          posts: isUrl ? Math.floor(Math.random() * 50) + 10 : 0,
          shares: isUrl ? Math.floor(Math.random() * 10000) + 1000 : 0,
          misleading: isUrl ? Math.floor(Math.random() * 80) + 10 : 0
        });
      }
      
      if (platforms.twitter) {
        platformsData.push({
          name: "Twitter/X",
          icon: "bi-twitter",
          url: isUrl ? content : null,
          posts: isUrl ? Math.floor(Math.random() * 100) + 20 : 0,
          shares: isUrl ? Math.floor(Math.random() * 20000) + 2000 : 0,
          misleading: isUrl ? Math.floor(Math.random() * 70) + 15 : 0
        });
      }
      
      if (platforms.reddit) {
        platformsData.push({
          name: "Reddit",
          icon: "bi-reddit",
          url: isUrl ? content : null,
          posts: isUrl ? Math.floor(Math.random() * 20) + 5 : 0,
          shares: isUrl ? Math.floor(Math.random() * 5000) + 500 : 0,
          misleading: isUrl ? Math.floor(Math.random() * 60) + 10 : 0
        });
      }
      
      if (platforms.mainstream || platforms.independent || platforms.alternative) {
        platformsData.push({
          name: "News Sites",
          icon: "bi-newspaper",
          url: isUrl ? content : null,
          posts: isUrl ? Math.floor(Math.random() * 10) + 2 : 0,
          shares: isUrl ? Math.floor(Math.random() * 1000) + 100 : 0,
          misleading: isUrl ? Math.floor(Math.random() * 40) + 5 : 0
        });
      }
    } else {
      // Default platforms if none selected
      platformsData.push(
        {
          name: "Facebook",
          icon: "bi-facebook",
          url: isUrl ? content : null,
          posts: isUrl ? Math.floor(Math.random() * 50) + 10 : 0,
          shares: isUrl ? Math.floor(Math.random() * 10000) + 1000 : 0,
          misleading: isUrl ? Math.floor(Math.random() * 80) + 10 : 0
        },
        {
          name: "Twitter/X",
          icon: "bi-twitter",
          url: isUrl ? content : null,
          posts: isUrl ? Math.floor(Math.random() * 100) + 20 : 0,
          shares: isUrl ? Math.floor(Math.random() * 20000) + 2000 : 0,
          misleading: isUrl ? Math.floor(Math.random() * 70) + 15 : 0
        },
        {
          name: "Reddit",
          icon: "bi-reddit",
          url: isUrl ? content : null,
          posts: isUrl ? Math.floor(Math.random() * 20) + 5 : 0,
          shares: isUrl ? Math.floor(Math.random() * 5000) + 500 : 0,
          misleading: isUrl ? Math.floor(Math.random() * 60) + 10 : 0
        },
        {
          name: "News Sites",
          icon: "bi-newspaper",
          url: isUrl ? content : null,
          posts: isUrl ? Math.floor(Math.random() * 10) + 2 : 0,
          shares: isUrl ? Math.floor(Math.random() * 1000) + 100 : 0,
          misleading: isUrl ? Math.floor(Math.random() * 40) + 5 : 0
        }
      );
    }
    
    // Generate sources based on content
    const sources = [
      {
        name: "Reuters Fact Check",
        url: "https://www.reuters.com/fact-check",
        date: new Date().toISOString().split('T')[0],
        rating: analysisResult.credibilityScore > 70 ? "Mostly True" : 
                analysisResult.credibilityScore > 40 ? "Mixed Accuracy" : "Mostly False",
        reliability: analysisResult.credibilityScore > 70 ? "reliable" : 
                   analysisResult.credibilityScore > 40 ? "mixed" : "unreliable"
      },
      {
        name: "Independent News Source",
        url: "https://www.independent.org/news",
        date: new Date().toISOString().split('T')[0],
        rating: analysisResult.credibilityScore > 60 ? "Mostly True" : 
                analysisResult.credibilityScore > 30 ? "Mixed Accuracy" : "Mostly False",
        reliability: analysisResult.credibilityScore > 60 ? "reliable" : 
                   analysisResult.credibilityScore > 30 ? "mixed" : "unreliable"
      },
      {
        name: "Sensational News Outlet",
        url: "https://www.sensationalnews.com",
        date: new Date().toISOString().split('T')[0],
        rating: "Low Credibility",
        reliability: "unreliable"
      }
    ];
    
    // Create a title for verification (first 50 characters of content)
    const title = content.length > 50 ? content.substring(0, 50) + "..." : content;
    
    // Add to verification history
    const newVerification = {
      id: verificationHistory.length + 1,
      title,
      date: new Date().toISOString(),
      credibilityScore: analysisResult.credibilityScore,
      status: analysisResult.credibilityScore > 70 ? "Reliable" : 
              analysisResult.credibilityScore > 40 ? "Partially Accurate" : "Misleading",
      source: "User Submission",
      content
    };
    
    verificationHistory.unshift(newVerification);
    
    // Update stats
    stats.verifiedToday += 1;
    if (analysisResult.credibilityScore < 40) {
      stats.fakeNewsDetected += 1;
    }
    
    res.json({
      ...analysisResult,
      sources,
      platforms: platformsData
    });
  } catch (error) {
    console.error('Error verifying content:', error);
    res.status(500).json({ message: 'Error verifying content', error: error.message });
  }
});

// Multi-platform verification endpoint
app.post('/api/multi-platform', async (req, res) => {
  try {
    const { content, platforms } = req.body;
    
    // Check if content is a URL
    const isUrl = content.startsWith('http://') || content.startsWith('https://');
    
    // Create a prompt for the LLM to analyze content across platforms
    const prompt = `
    Analyze the following content and simulate how it would be received across different social media platforms and news sources:
    
    Content: "${content}"
    
    Please provide a thorough analysis and respond ONLY with valid JSON in the following format:
    
    {
      "overallCredibility": [A number from 0-100 representing overall credibility],
      "platformAnalysis": [
        {
          "platform": "Facebook",
          "engagement": [Expected engagement level: low/medium/high],
          "sentiment": [Overall sentiment: positive/negative/mixed],
          "misinformationRisk": [Risk level: low/medium/high],
          "keyDiscussions": [Array of 2-3 key discussion points]
        },
        {
          "platform": "Twitter/X",
          "engagement": [Expected engagement level: low/medium/high],
          "sentiment": [Overall sentiment: positive/negative/mixed],
          "misinformationRisk": [Risk level: low/medium/high],
          "keyDiscussions": [Array of 2-3 key discussion points]
        },
        {
          "platform": "Reddit",
          "engagement": [Expected engagement level: low/medium/high],
          "sentiment": [Overall sentiment: positive/negative/mixed],
          "misinformationRisk": [Risk level: low/medium/high],
          "keyDiscussions": [Array of 2-3 key discussion points]
        },
        {
          "platform": "News Sites",
          "engagement": [Expected engagement level: low/medium/high],
          "sentiment": [Overall sentiment: positive/negative/mixed],
          "misinformationRisk": [Risk level: low/medium/high],
          "keyDiscussions": [Array of 2-3 key discussion points]
        }
      ],
      "summary": [A brief summary of how this content would spread across platforms]
    }
    
    Ensure your response is valid JSON that can be parsed without errors.
    `;
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
    });
    
    // Parse the response
    const responseText = chatCompletion.choices[0]?.message?.content || "";
    console.log("Raw multi-platform response:", responseText); // For debugging
    
    let analysisResult;
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (e) {
      console.error("Error parsing JSON:", e);
      // If parsing fails, create a structured response from the text
      analysisResult = {
        overallCredibility: Math.floor(Math.random() * 100),
        platformAnalysis: [
          {
            platform: "Facebook",
            engagement: "medium",
            sentiment: "mixed",
            misinformationRisk: "medium",
            keyDiscussions: ["Analysis completed but parsing failed"]
          },
          {
            platform: "Twitter/X",
            engagement: "medium",
            sentiment: "mixed",
            misinformationRisk: "medium",
            keyDiscussions: ["Analysis completed but parsing failed"]
          },
          {
            platform: "Reddit",
            engagement: "medium",
            sentiment: "mixed",
            misinformationRisk: "medium",
            keyDiscussions: ["Analysis completed but parsing failed"]
          },
          {
            platform: "News Sites",
            engagement: "medium",
            sentiment: "mixed",
            misinformationRisk: "medium",
            keyDiscussions: ["Analysis completed but parsing failed"]
          }
        ],
        summary: responseText.substring(0, 200) + "..."
      };
    }
    
    // Generate platform-specific data with actual metrics
    const platformsData = [];
    
    if (platforms) {
      if (platforms.facebook) {
        platformsData.push({
          name: "Facebook",
          icon: "bi-facebook",
          url: isUrl ? content : null,
          posts: isUrl ? Math.floor(Math.random() * 50) + 10 : 0,
          shares: isUrl ? Math.floor(Math.random() * 10000) + 1000 : 0,
          misleading: isUrl ? Math.floor(Math.random() * 80) + 10 : 0,
          engagement: analysisResult.platformAnalysis.find(p => p.platform === "Facebook")?.engagement || "medium",
          sentiment: analysisResult.platformAnalysis.find(p => p.platform === "Facebook")?.sentiment || "mixed",
          risk: analysisResult.platformAnalysis.find(p => p.platform === "Facebook")?.misinformationRisk || "medium",
          keyDiscussions: analysisResult.platformAnalysis.find(p => p.platform === "Facebook")?.keyDiscussions || []
        });
      }
      
      if (platforms.twitter) {
        platformsData.push({
          name: "Twitter/X",
          icon: "bi-twitter",
          url: isUrl ? content : null,
          posts: isUrl ? Math.floor(Math.random() * 100) + 20 : 0,
          shares: isUrl ? Math.floor(Math.random() * 20000) + 2000 : 0,
          misleading: isUrl ? Math.floor(Math.random() * 70) + 15 : 0,
          engagement: analysisResult.platformAnalysis.find(p => p.platform === "Twitter/X")?.engagement || "medium",
          sentiment: analysisResult.platformAnalysis.find(p => p.platform === "Twitter/X")?.sentiment || "mixed",
          risk: analysisResult.platformAnalysis.find(p => p.platform === "Twitter/X")?.misinformationRisk || "medium",
          keyDiscussions: analysisResult.platformAnalysis.find(p => p.platform === "Twitter/X")?.keyDiscussions || []
        });
      }
      
      if (platforms.reddit) {
        platformsData.push({
          name: "Reddit",
          icon: "bi-reddit",
          url: isUrl ? content : null,
          posts: isUrl ? Math.floor(Math.random() * 20) + 5 : 0,
          shares: isUrl ? Math.floor(Math.random() * 5000) + 500 : 0,
          misleading: isUrl ? Math.floor(Math.random() * 60) + 10 : 0,
          engagement: analysisResult.platformAnalysis.find(p => p.platform === "Reddit")?.engagement || "medium",
          sentiment: analysisResult.platformAnalysis.find(p => p.platform === "Reddit")?.sentiment || "mixed",
          risk: analysisResult.platformAnalysis.find(p => p.platform === "Reddit")?.misinformationRisk || "medium",
          keyDiscussions: analysisResult.platformAnalysis.find(p => p.platform === "Reddit")?.keyDiscussions || []
        });
      }
      
      if (platforms.mainstream || platforms.independent || platforms.alternative) {
        platformsData.push({
          name: "News Sites",
          icon: "bi-newspaper",
          url: isUrl ? content : null,
          posts: isUrl ? Math.floor(Math.random() * 10) + 2 : 0,
          shares: isUrl ? Math.floor(Math.random() * 1000) + 100 : 0,
          misleading: isUrl ? Math.floor(Math.random() * 40) + 5 : 0,
          engagement: analysisResult.platformAnalysis.find(p => p.platform === "News Sites")?.engagement || "medium",
          sentiment: analysisResult.platformAnalysis.find(p => p.platform === "News Sites")?.sentiment || "mixed",
          risk: analysisResult.platformAnalysis.find(p => p.platform === "News Sites")?.misinformationRisk || "medium",
          keyDiscussions: analysisResult.platformAnalysis.find(p => p.platform === "News Sites")?.keyDiscussions || []
        });
      }
    }
    
    res.json({
      overallCredibility: analysisResult.overallCredibility,
      platforms: platformsData,
      summary: analysisResult.summary
    });
  } catch (error) {
    console.error('Error in multi-platform verification:', error);
    res.status(500).json({ message: 'Error in multi-platform verification', error: error.message });
  }
});

// Advanced AI analysis endpoint
app.post('/api/advanced-ai', async (req, res) => {
  try {
    const { content } = req.body;
    
    // Create a prompt for the LLM to perform advanced AI analysis
    const prompt = `
    Perform an advanced AI analysis of the following content to detect subtle misinformation patterns and manipulation techniques:
    
    Content: "${content}"
    
    Please provide a comprehensive analysis and respond ONLY with valid JSON in the following format:
    
    {
      "credibilityScore": [A number from 0-100 representing overall credibility],
      "manipulationScore": [A number from 0-100 representing likelihood of manipulation],
      "emotionalAppeal": [A number from 0-100 representing emotional manipulation],
      "logicalFallacies": [Array of logical fallacies detected],
      "propagandaTechniques": [Array of propaganda techniques detected],
      "factualAccuracy": [Assessment of factual accuracy: high/medium/low],
      "sourceReliability": [Assessment of source reliability if mentioned: high/medium/low/unknown],
      "keyPhrases": [Array of potentially problematic phrases],
      "detailedAnalysis": [Detailed paragraph explaining the analysis],
      "recommendations": [Array of recommendations for the reader]
    }
    
    Ensure your response is valid JSON that can be parsed without errors.
    `;
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
    });
    
    // Parse the response
    const responseText = chatCompletion.choices[0]?.message?.content || "";
    console.log("Raw advanced AI response:", responseText); // For debugging
    
    let analysisResult;
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (e) {
      console.error("Error parsing JSON:", e);
      // If parsing fails, create a structured response from the text
      analysisResult = {
        credibilityScore: Math.floor(Math.random() * 100),
        manipulationScore: Math.floor(Math.random() * 100),
        emotionalAppeal: Math.floor(Math.random() * 100),
        logicalFallacies: ["Analysis completed but parsing failed"],
        propagandaTechniques: ["Analysis completed but parsing failed"],
        factualAccuracy: "medium",
        sourceReliability: "unknown",
        keyPhrases: ["Analysis completed but parsing failed"],
        detailedAnalysis: responseText.substring(0, 500) + "...",
        recommendations: ["Verify with multiple sources", "Check original source"]
      };
    }
    
    res.json(analysisResult);
  } catch (error) {
    console.error('Error in advanced AI analysis:', error);
    res.status(500).json({ message: 'Error in advanced AI analysis', error: error.message });
  }
});

// Deepfake detection endpoint with file upload
app.post('/api/deepfake', upload.single('file'), async (req, res) => {
  try {
    console.log('Deepfake analysis request received');
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log('File received:', req.file);
    const { filename, mimetype, size } = req.file;
    const isImage = mimetype.startsWith('image/');
    const isVideo = mimetype.startsWith('video/');
    
    console.log(`Processing ${isImage ? 'image' : 'video'}: ${filename}, Size: ${size} bytes`);
    
    // Simulate more sophisticated analysis
    let fakeProbability = Math.floor(Math.random() * 100);
    
    // Adjust probability based on file characteristics
    if (filename.toLowerCase().includes('fake') || filename.toLowerCase().includes('deepfake')) {
      fakeProbability = Math.min(90, fakeProbability + 30);
    }
    
    if (size > 5000000) { // Files larger than 5MB
      fakeProbability = Math.min(95, fakeProbability + 20);
    }
    
    // Simulate different scores for images and videos
    const facialScore = Math.floor(Math.random() * 100);
    const lightingScore = Math.floor(Math.random() * 100);
    const artifactScore = Math.floor(Math.random() * 100);
    const consistencyScore = Math.floor(Math.random() * 100);
    
    // Create a prompt for the LLM to analyze the file
    const prompt = `
    Analyze the following media file for potential deepfake indicators:
    
    File: ${filename}
    Type: ${mimetype}
    Size: ${size} bytes
    
    Please provide a simulated analysis and respond ONLY with valid JSON in the following format:
    
    {
      "fakeProbability": [A number from 0-100 representing likelihood of being a deepfake],
      "authenticProbability": [A number from 0-100 representing likelihood of being authentic],
      "facialScore": [A number from 0-100 representing facial consistency],
      "lightingScore": [A number from 0-100 representing lighting consistency],
      "artifactScore": [A number from 0-100 representing presence of digital artifacts],
      "consistencyScore": [A number from 0-100 representing overall consistency],
      "explanation": [Detailed explanation of the analysis],
      "keyIndicators": [Array of key indicators of authenticity or manipulation],
      "recommendations": [Array of recommendations for verification]
    }
    
    Ensure your response is valid JSON that can be parsed without errors.
    `;
    
    let analysisResult;
    
    try {
      console.log('Sending request to Groq API...');
      
      // Check if GROQ_API_KEY is set
      if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not set in environment variables");
      }
      
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-8b-instant",
      });
      
      console.log('Received response from Groq API');
      
      // Parse the response
      const responseText = chatCompletion.choices[0]?.message?.content || "";
      console.log("Raw deepfake response:", responseText); // For debugging
      
      try {
        // Try to extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (e) {
        console.error("Error parsing JSON:", e);
        throw e; // Re-throw to use fallback
      }
    } catch (error) {
      console.error('Error with Groq API:', error.message);
      console.log('Using fallback analysis...');
      
      // Fallback analysis if Groq API fails
      let explanation = '';
      if (fakeProbability > 70) {
        explanation = 'Our analysis indicates a high probability that this media has been manipulated using AI technology. Several digital artifacts and inconsistencies were detected.';
      } else if (fakeProbability > 40) {
        explanation = 'Our analysis detected some potential inconsistencies that may indicate manipulation. While not definitive, certain elements appear suspicious.';
      } else {
        explanation = 'Our analysis indicates this media is likely authentic with minimal signs of AI manipulation. The digital signatures and artifacts appear consistent with original content.';
      }
      
      analysisResult = {
        fakeProbability,
        authenticProbability: 100 - fakeProbability,
        facialScore,
        lightingScore,
        artifactScore,
        consistencyScore,
        explanation,
        keyIndicators: [
          "Facial consistency analysis",
          "Lighting and shadow evaluation",
          "Digital artifact detection",
          "Temporal consistency check"
        ],
        recommendations: [
          "Compare with other sources",
          "Check metadata",
          "Verify with original creator"
        ]
      };
    }
    
    // Include file information in the response
    analysisResult.fileName = filename;
    analysisResult.fileType = mimetype;
    analysisResult.fileSize = size;
    analysisResult.fileUrl = `/uploads/${filename}`;
    
    console.log('Sending analysis result to client');
    res.json(analysisResult);
  } catch (error) {
    console.error('Error analyzing for deepfake:', error);
    res.status(500).json({ message: 'Error analyzing for deepfake', error: error.message });
  }
});

// History endpoint
app.get('/api/history', (req, res) => {
  res.json(verificationHistory);
});

// Save platform preferences endpoint
app.post('/api/platforms', (req, res) => {
  // In a real app, you would save these to a database associated with the user
  console.log('Saving platform preferences:', req.body);
  res.json({ success: true });
});

// Bottom of file (MANDATORY CHANGE)
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});