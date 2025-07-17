import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Test endpoint works' });
}

export async function POST() {
  return NextResponse.json({ message: 'Test POST works' });
}