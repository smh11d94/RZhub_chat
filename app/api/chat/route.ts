import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, userName } = await req.json();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "assistant",
          content: `Roza is the instructer of the thermodynamics course. You are an expert in this course and her assistant. You want to make sure students learn. The student's name is ${userName}. (Keep your responses short and to the point.)
          if there was any question about dates or times which you were not sure, tell them to contact Roza.` 
        },
        { 
          role: "user", 
          content: message 
        }
      ],
    });

    const response = completion.choices[0].message.content ?? '';
    const mentionsRoza = response ? /contact(.*)Roza|email(.*)Roza|reach(.*)Roza|ask(.*)Roza|check out(.*)Roza | check with(.*)Roza/i.test(response):false ;
    
    let emailBody = '';
    if (mentionsRoza) {
      const emailCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Generate a polite and friendly email body to Professor Roza about the following thermodynamics course question. Keep it concise but detailed enough to explain the issue. The email is from ${userName}`
          },
          {
            role: "user",
            content: message
          }
        ],
      });
      emailBody = emailCompletion.choices[0].message.content ?? '';
    }

    return Response.json({
      message: response,
      includeEmailButton: mentionsRoza,
      emailDetails: mentionsRoza ? {
        mailto: "roza.ghaemi@ubc.ca",
        subject: `Thermodynamics Course Question [${userName}]`,
        body: emailBody
      } : null
    });
  } catch (error: any) {
    console.error('OpenAI Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}