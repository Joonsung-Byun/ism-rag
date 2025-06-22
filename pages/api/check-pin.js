import { NextResponse } from "next/server";

export default async function handler(request, response) {
  
  console.log(request.body.pin)
  const adminPin = process.env.ADMIN_PIN;
  if (request.body.pin == adminPin) {
    return response.json({ success: true });
  } else {
    return response.json({ success: false }, { status: 401 });
  }
}
