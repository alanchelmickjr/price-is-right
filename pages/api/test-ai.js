export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Test LlamaFile connection
    const testResponse = await fetch('http://localhost:8080/v1/models');
    
    if (!testResponse.ok) {
      // Try alternative endpoint
      const altResponse = await fetch('http://localhost:8080/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "Say 'AI server is working'",
          max_tokens: 10
        })
      });
      
      if (!altResponse.ok) {
        throw new Error('AI server not responding');
      }
    }

    // Test image recognition
    const imageBase64 = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    
    const aiResponse = await fetch('http://localhost:8080/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "llava",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "What do you see in this image? Respond with just the main object name."
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
              }
            ]
          }
        ],
        max_tokens: 50,
        temperature: 0.1
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const result = await aiResponse.json();
    const content = result.choices?.[0]?.message?.content || 'No response';

    res.status(200).json({
      success: true,
      aiWorking: true,
      response: content,
      endpoints: {
        models: testResponse.ok,
        completion: true,
        chat: aiResponse.ok
      }
    });

  } catch (error) {
    console.error('AI test failed:', error);
    res.status(500).json({
      success: false,
      aiWorking: false,
      error: error.message,
      endpoints: {
        models: false,
        completion: false,
        chat: false
      }
    });
  }
}