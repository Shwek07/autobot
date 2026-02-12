import { NextResponse } from 'next/server';
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import { RateLimiter } from 'limiter';

// Rate limiting - 10 requests per minuut per IP
// const limiter = new RateLimiter({
//   tokensPerInterval: 10,
//   interval: 'minute',
// });

// // API key verificatie
// const validateApiKey = (apiKey: string) => {
//   return apiKey === process.env.INTERNAL_API_KEY;
// };

// export async function POST(request: Request) {
//   try {
//     // 1. Rate limiting check
//     const ip = request.headers.get('x-forwarded-for') || 'unknown';
//     const hasToken = await limiter.tryRemoveTokens(1, ip);
    
//     if (!hasToken) {
//       return NextResponse.json(
//         { error: 'Te veel verzoeken. Probeer het later opnieuw.' },
//         { status: 429 }
//       );
//     }

//     // 2. Input validatie
//     const { message, conversationId } = await request.json();
    
//     if (!message || typeof message !== 'string' || message.length > 500) {
//       return NextResponse.json(
//         { error: 'Ongeldig bericht' },
//         { status: 400 }
//       );
//     }

//     // 3. Sanitize input
//     const sanitizedMessage = message
//       .trim()
//       .replace(/<[^>]*>/g, '') // Remove HTML
//       .slice(0, 500); // Max lengte

//     // 4. Gemini API call
//     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
//     const model = genAI.getGenerativeModel({ 
//       model: "gemini-1.5-flash",
//       safetySettings: [
//         {
//           category: "HARM_CATEGORY_HARASSMENT",
//           threshold: "BLOCK_MEDIUM_AND_ABOVE",
//         },
//         {
//           category: "HARM_CATEGORY_HATE_SPEECH",
//           threshold: "BLOCK_MEDIUM_AND_ABOVE",
//         },
//       ],
//     });

//     const prompt = `Je bent AutoBot, een AI-assistent voor een auto-onderdelen webshop. 
//     Je helpt klanten met het vinden van auto-onderdelen, technisch advies en afspraken.
//     Wees vriendelijk, professioneel en behulpzaam. Antwoord in het Nederlands.
    
//     Klant: ${sanitizedMessage}
    
//     AutoBot:`;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();

//     // 5. Genereer suggesties
//     const suggestions = generateSuggestions(sanitizedMessage);

//     // 6. Log voor monitoring (zonder PII)
//     console.log(`Chat query - Length: ${sanitizedMessage.length}, Suggestions: ${suggestions.length}`);

//     return NextResponse.json({
//       message: text,
//       suggestions,
//       sessionId: conversationId || generateSessionId(),
//     });

//   } catch (error) {
//     console.error('Gemini API error:', error);
    
//     return NextResponse.json(
//       { 
//         error: 'Er is een interne fout opgetreden',
//         message: 'Sorry, ik kan je nu niet helpen. Probeer het later opnieuw.'
//       },
//       { status: 500 }
//     );
//   }
// }

// function generateSuggestions(message: string): string[] {
//   const suggestions = [];
  
//   if (message.toLowerCase().includes('rem')) {
//     suggestions.push('Remschijven prijs', 'Remblokken vervangen', 'Remmen specialist');
//   }
//   if (message.toLowerCase().includes('olie')) {
//     suggestions.push('Olie verversen', 'Motorolie advies', 'Filter set');
//   }
//   if (message.toLowerCase().includes('apk')) {
//     suggestions.push('APK afspraak', 'APK kosten', 'APK keuring');
//   }
  
//   return suggestions.slice(0, 3);
// }

// function generateSessionId(): string {
//   return Math.random().toString(36).substring(2, 15);
// }