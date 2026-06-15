import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    // Use z-ai-web-dev-sdk for AI chat
    const { ZAI } = await import('z-ai-web-dev-sdk')
    const ai = new ZAI({ apiKey: process.env.Z_API_KEY || '' })

    const systemPrompt = `أنت مساعد ذكي لعيادة المغازي للأمراض الجلدية. تجيب على الأسئلة باللغة العربية. يمكنك:
- الإجابة عن أسئلة المرضى والأطباء
- اقتراح خيارات العلاج للأمراض الجلدية الشائعة
- شرح الأدوية وآثارها الجانبية
- تقديم نصائح عامة للعناية بالبشرة
- مساعدة في إدارة العيادة

تنبيه: أنت لا تقدم تشخيصاً طبياً نهائياً، بل نصائح عامة يجب مراجعتها مع الطبيب المختص.`

    const result = await ai.chat({
      model: 'glm-4-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    })

    return NextResponse.json({ 
      message: result.content || result.choices?.[0]?.message?.content || 'عذراً، لم أتمكن من معالجة طلبك' 
    })
  } catch (error) {
    console.error('AI chat error:', error)
    // Fallback response if AI service is unavailable
    const lastMessage = messages[messages.length - 1]?.content || ''
    let fallbackResponse = 'عذراً، خدمة المساعد الذكي غير متاحة حالياً. يرجى المحاولة لاحقاً.'
    
    if (lastMessage.includes('حبوب') || lastMessage.includes('acne')) {
      fallbackResponse = 'لعلاج حبوب الشباب، ننصح بـ:\n1. غسل الوجه مرتين يومياً بغسول لطيف\n2. استخدام جل أدابالين 0.1% ليلاً\n3. استخدام بنزويل بيروكسايد 5% صباحاً\n4. واقي شمس SPF 50+ يومياً\n5. مراجعة الطبيب للحالات المتوسطة إلى الشديدة'
    } else if (lastMessage.includes('إكزيما') || lastMessage.includes('eczema')) {
      fallbackResponse = 'لعلاج الإكزيما، ننصح بـ:\n1. ترطيب البشرة باستمرار بكريم يوريا 10%\n2. تجنب المحفزات (صابون قاسي، ماء ساخن)\n3. استخدام كريم بيتاميثازون للالتهابات\n4. تاكروليموس للمناطق الحساسة\n5. سيتريزين 10mg للحكة الشديدة'
    } else if (lastMessage.includes('ليزر') || lastMessage.includes('laser')) {
      fallbackResponse = 'معلومات عن إزالة الشعر بالليزر:\n- يحتاج 6-8 جلسات للحصول على نتائج جيدة\n- الجلسات كل 4-6 أسابيع\n- تجنب التعرض للشمس قبل وبعد الجلسة\n- يمكن استخدام كريم مخدر موضعي لتقليل الألم\n- النتائج تختلف حسب لون البشرة ونوع الشعر'
    }
    
    return NextResponse.json({ message: fallbackResponse })
  }
}
