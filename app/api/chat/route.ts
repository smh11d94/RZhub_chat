import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, userName, courseInfo } = await req.json();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "assistant",
          content: `${courseInfo.courseInstructor} is the instructor of the ${courseInfo.courseName} course. 
          ${courseInfo.courseInfo}
          You are an expert in this course and the instructor's assistant. You want to make sure students learn. 
          The student's name is ${userName}. (Keep your responses short and to the point.)
          If there was any question about dates or times which you were not sure, tell them to contact ${courseInfo.courseInstructor}.` 
        },
        { 
          role: "user", 
          content: message 
        }
      ],
    });

    const response = completion.choices[0].message.content ?? '';
    const mentionsInstructor = response ? 
      new RegExp(`contact(.*)${courseInfo.courseInstructor}|email(.*)${courseInfo.courseInstructor}|reach(.*)${courseInfo.courseInstructor}|ask(.*)${courseInfo.courseInstructor}|check out(.*)${courseInfo.courseInstructor}|check with(.*)${courseInfo.courseInstructor}`, 'i').test(response) 
      : false;
    
    let emailBody = '';
    if (mentionsInstructor) {
      const emailCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Generate a polite and friendly email body to Professor ${courseInfo.courseInstructor} about the following ${courseInfo.courseName} course question. Keep it concise but detailed enough to explain the issue. The email is from ${userName}`
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
      includeEmailButton: mentionsInstructor,
      emailDetails: mentionsInstructor ? {
        mailto: "instructor.email@university.edu", // You might want to add email to your CourseInfo model
        subject: `${courseInfo.courseName} Course Question [${userName}]`,
        body: emailBody
      } : null
    });
  } catch (error: any) {
    console.error('OpenAI Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}