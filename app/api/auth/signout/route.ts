import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Signed out' });
  response.cookies.delete('session');
  return response;
}
