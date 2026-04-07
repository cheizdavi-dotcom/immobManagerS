import { NextResponse } from 'next/server';
import { sendFollowUpReminders } from '@/app/actions';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await sendFollowUpReminders(5);
    return NextResponse.json({ 
      success: true, 
      message: `Follow-up enviado para ${result} clientes`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erro ao executar follow-up',
      details: error 
    }, { status: 500 });
  }
}
